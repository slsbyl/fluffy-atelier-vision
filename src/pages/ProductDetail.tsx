import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Star, ArrowLeft, Heart, Loader, Sparkles, Upload, X } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { products as localProducts } from "@/data/products";

interface Review {
  name: string;
  rating: number;
  text: string;
}

const getColorCode = (colorName: string) => {
  const colorsMap: Record<string, string> = {
    "أحمر": "red", "احمر": "red", "أزرق": "blue", "ازرق": "blue",
    "أخضر": "green", "اخضر": "green", "أسود": "black", "اسود": "black",
    "أبيض": "white", "ابيض": "white", "أصفر": "yellow", "اصفر": "yellow",
    "برتقالي": "orange", "وردي": "pink", "بمبي": "pink", "بنفسجي": "purple",
    "رمادي": "gray", "رصاصي": "gray", "بني": "brown", "كحلي": "navy",
    "بيج": "beige", "ذهبي": "gold", "فضي": "silver"
  };
  return colorsMap[colorName.trim().toLowerCase()] || colorName;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<{size: string | null, color: string | null}[]>([{ size: null, color: null }]);
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (id) {
      const savedReviews = localStorage.getItem(`reviews_${id}`);
      if (savedReviews) {
        try {
          return JSON.parse(savedReviews);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [activeImage, setActiveImage] = useState<string>("");
  const [showVtoModal, setShowVtoModal] = useState(false);
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const [vtoLoading, setVtoLoading] = useState(false);
  const [vtoResult, setVtoResult] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        try {
          const response = await axios.get(`https://fluffy-atelier-vision-production.up.railway.app/api/v1/products/${id}`);
          if (response.data?.status === 'success' || response.status === 200) {
            const fetchedProduct = response.data.data?.product || response.data.data || response.data;
            if (fetchedProduct) {
              setProduct(fetchedProduct);
              setActiveImage(fetchedProduct.images?.[0] || fetchedProduct.image);
              return;
            }
          }
        } catch (e) {
          console.log("Single product fetch failed, trying fallback...");
        }

        try {
          const allResponse = await axios.get(`https://fluffy-atelier-vision-production.up.railway.app/api/v1/products`);
          if (allResponse.data?.status === 'success' || allResponse.status === 200) {
            const allProducts = allResponse.data.data?.products || allResponse.data;
            const foundProduct = allProducts.find((p: any) => String(p._id) === id || String(p.id) === id);
            if (foundProduct) {
              setProduct(foundProduct);
              setActiveImage(foundProduct.images?.[0] || foundProduct.image);
              return;
            }
          }
        } catch (e) {
          console.log("Fetch all fallback failed.");
        }

        const fallbackProduct = localProducts.find(p => String(p.id) === id);
        if (fallbackProduct) {
          setProduct(fallbackProduct);
          setActiveImage((fallbackProduct as any).images?.[0] || fallbackProduct.image);
        } else {
          setError("لم يتم العثور على تفاصيل المنتج. يرجى التأكد من الخادم.");
        }
      } catch (err: any) {
        setError("حدث خطأ غير متوقع. يرجى التأكد من تشغيل الخادم.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      localStorage.setItem(`reviews_${id}`, JSON.stringify(reviews));
    }
  }, [reviews, id]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;
    setReviews(prev => [...prev, { name: newReviewName, rating: newReviewRating, text: newReviewText }]);
    setNewReviewName("");
    setNewReviewText("");
    setNewReviewRating(5);
    toast({ title: "Review submitted!", description: "Thank you for your feedback." });
  };

  const handleAddToCart = () => {
    const incompleteIdx = selections.findIndex(s => 
      (product.sizes && product.sizes.length > 0 && !s.size) || 
      (product.colors && product.colors.length > 0 && !s.color)
    );

    if (incompleteIdx !== -1) {
      toast({
        title: "خطأ",
        description: `الرجاء استكمال اختيار المقاس واللون للقطعة رقم ${incompleteIdx + 1}`
      });
      return;
    }

    const availableStock = product.stock || 0;

    if (availableStock <= 0) {
      toast({
        title: "غير متوفر",
        description: "للأسف هذا المنتج انتهى من المخزون",
        variant: "destructive",
      });
      return;
    }

    const totalQuantityInCart = items
      .filter((i) => i.productId === (product._id || product.id))
      .reduce((sum, i) => sum + i.quantity, 0);

    if (totalQuantityInCart + selections.length > availableStock) {
      toast({
        title: "كمية غير متوفرة",
        description: `متوفر فقط ${availableStock} قطع. لديك ${totalQuantityInCart} في السلة بالفعل، ولا يمكنك إضافة ${selections.length} قطع أخرى.`,
        variant: "destructive",
      });
      return;
    }

    selections.forEach(sel => {
      addItem({
        productId: product._id || product.id,
        productName: product.name,
        price: product.price,
        image: product.image,
        size: sel.size,
        color: sel.color,
        quantity: 1,
        stock: availableStock,
      });
    });

    toast({
      title: "تمت الإضافة بنجاح!",
      description: `تم إضافة ${selections.length} قطعة من ${product.name} إلى السلة.`,
    });

    setSelections([{ size: null, color: null }]);
  };

  const handleAddQuantity = () => {
    const maxQuantity = product.stock || 0;
    if (selections.length < maxQuantity) {
      setSelections([...selections, { size: null, color: null }]);
    }
  };

  const handleRemoveQuantity = () => {
    if (selections.length > 1) {
      setSelections(selections.slice(0, -1));
    }
  };

  const updateSelection = (index: number, field: 'size' | 'color', value: string) => {
    const newSelections = [...selections];
    newSelections[index] = { ...newSelections[index], [field]: value };
    setSelections(newSelections);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setHumanImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVirtualTryOn = async () => {
    if (!humanImage) return;
    try {
      setVtoLoading(true);
      setVtoResult(null);
      
      let finalProductImage = activeImage || product.image;
      
      try {
        const urlToFetch = finalProductImage.startsWith('/') ? window.location.origin + finalProductImage : finalProductImage;
        const res = await fetch(urlToFetch);
        const blob = await res.blob();
        finalProductImage = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Failed to convert product image", err);
      }

      const response = await axios.post("https://fluffy-atelier-vision-production.up.railway.app/api/v1/vto", {
        humanImage, productImage: finalProductImage, category: product.category
      });
      
      if (response.data.status === 'success') {
        if (response.data.mocked) {
          toast({ 
            title: "تنبيه", 
            description: response.data.message || "لا يوجد رصيد كافٍ في حساب Replicate. يتم عرض صورة افتراضية.", 
            variant: "default" 
          });
        }
        setVtoResult(response.data.data.resultImage);
      } else {
        toast({ title: "خطأ", description: response.data.message, variant: "destructive" });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. تأكد من تشغيل السيرفر.";
      toast({ title: "خطأ", description: errorMessage, variant: "destructive" });
    } finally {
      setVtoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader size={48} className="text-primary" />
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-muted-foreground mb-6">{error || "Product not found."}</p>
          <Button onClick={() => navigate('/shop')} className="rounded-full">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const inStock = product.inStock || product.stock > 0;
  const maxQuantity = product.stock || 0;
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="rounded-3xl overflow-hidden bg-secondary/30 aspect-[3/4] mb-4">
              <img src={activeImage || product.image} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
            {galleryImages.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === img ? 'border-primary shadow-soft scale-105' : 'border-transparent hover:border-border'}`}
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              {product.isBestSeller && <span className="bg-primary/10 text-primary text-[10px] font-body tracking-wider uppercase px-3 py-1 rounded-full">Best Seller</span>}
              {product.isNewArrival && <span className="bg-accent text-accent-foreground text-[10px] font-body tracking-wider uppercase px-3 py-1 rounded-full">New</span>}
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">{product.name}</h1>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const avgRating = Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length);
                    return (
                      <Star key={i} size={14} className={i < avgRating ? "text-primary fill-primary" : "text-border"} />
                    );
                  })}
                </div>
                <span className="text-xs font-body text-muted-foreground">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

            <p className="font-display text-2xl text-foreground mb-6">${product.price}</p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-body tracking-wider uppercase text-muted-foreground">الكمية والمواصفات لكل قطعة</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRemoveQuantity}
                    disabled={selections.length <= 1}
                    className="px-3 py-2 rounded-xl border border-input bg-background hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-display text-lg">{selections.length}</span>
                  <button
                    onClick={handleAddQuantity}
                    disabled={selections.length >= maxQuantity}
                    className="px-3 py-2 rounded-xl border border-input bg-background hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {selections.map((sel, idx) => (
                  <div key={idx} className="bg-secondary/30 p-4 rounded-2xl border border-border/50 relative">
                    <span className="absolute top-3 left-4 text-xs font-display text-muted-foreground">#{idx + 1}</span>
                    
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mb-3 mt-1">
                        <p className="text-[11px] font-body text-muted-foreground mb-2">المقاس:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size: string) => (
                            <button
                              key={size}
                              onClick={() => updateSelection(idx, 'size', size)}
                              className={`min-w-[40px] h-9 px-2 rounded-lg text-xs font-body transition-all duration-200 ${sel.size === size ? "bg-primary text-primary-foreground shadow-soft" : "bg-background text-foreground hover:bg-accent border border-border"}`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.colors && product.colors.length > 0 && (
                      <div>
                        <p className="text-[11px] font-body text-muted-foreground mb-2">اللون:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color: string) => {
                            const colorCode = getColorCode(color);
                            return (
                              <button
                                key={color}
                                onClick={() => updateSelection(idx, 'color', color)}
                                className={`relative w-9 h-9 rounded-full border transition-all duration-200 flex items-center justify-center shadow-soft hover:scale-110 ${sel.color === color ? "border-primary ring-2 ring-primary/20 scale-110" : "border-border/50"}`}
                                style={{ backgroundColor: colorCode }}
                                title={color}
                              >
                                {sel.color === color && (
                                  <span className={`w-3 h-3 rounded-full ${['white', 'ابيض', 'أبيض', '#ffffff', '#fff'].includes(color.trim().toLowerCase()) ? 'bg-black' : 'bg-white'}`}></span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {inStock && (
                <p className="text-xs font-body text-muted-foreground text-center">
                  {maxQuantity} متاح في المخزون
                </p>
              )}
            </div>

            <p className={`text-xs font-body tracking-wider uppercase mb-6 ${inStock ? "text-green-600" : "text-destructive"}`}>
              {inStock ? `● متوفر` : "● غير متوفر"}
            </p>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-full font-body tracking-wider uppercase text-sm h-14"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingBag size={18} className="mr-2" />
                {!inStock ? "غير متوفر" : "أضف للسلة"}
              </Button>
              <Button variant="outline" size="lg" className="rounded-full h-14 w-14 p-0">
                <Heart size={18} />
              </Button>
            </div>

            <div className="mt-4">
              <Button 
                variant="secondary" 
                className="w-full rounded-full font-body h-14 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 text-foreground border border-pink-100 shadow-sm transition-all"
                onClick={() => setShowVtoModal(true)}
              >
                <Sparkles className="mr-2 text-primary" size={18} /> تجربة القياس بالذكاء الاصطناعي
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="font-display text-xl mb-4">تقييمات العملاء</h3>
              <div className="space-y-4 mb-8">
                {reviews.length > 0 ? (
                  reviews.map((review, i) => (
                    <div key={i} className="bg-secondary/30 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} size={12} className={j < review.rating ? "text-primary fill-primary" : "text-border"} />
                          ))}
                        </div>
                        <span className="text-xs font-body font-bold text-foreground">{review.name}</span>
                      </div>
                      <p className="text-sm font-body text-muted-foreground">{review.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-body text-muted-foreground text-center py-4">لا توجد تقييمات حتى الآن. كن أول من يقيّم!</p>
                )}
              </div>

              <div className="bg-secondary/20 rounded-2xl p-5">
                <h4 className="font-display text-base text-foreground mb-4">اترك تقييمك</h4>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div>
                    <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">اسمك</Label>
                    <Input value={newReviewName} onChange={(e) => setNewReviewName(e.target.value)} placeholder="اسمك" className="rounded-xl mt-1" required />
                  </div>
                  <div>
                    <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">التقييم</Label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(r => (
                        <button key={r} type="button" onClick={() => setNewReviewRating(r)}>
                          <Star size={20} className={r <= newReviewRating ? "text-primary fill-primary" : "text-border"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">تعليقك</Label>
                    <textarea value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="شارك رأيك..." rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-body mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-ring" required />
                  </div>
                  <Button type="submit" className="rounded-full font-body text-xs">إرسال التقييم</Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showVtoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => !vtoLoading && setShowVtoModal(false)}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()} 
                className="bg-card rounded-3xl w-full max-w-4xl overflow-hidden shadow-elevated border border-border flex flex-col md:flex-row h-[80vh] md:h-[600px]"
              >
                <div className="flex-1 p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-border overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-2xl text-foreground flex items-center gap-2"><Sparkles className="text-primary" /> تجربة القياس</h2>
                    <button onClick={() => setShowVtoModal(false)} disabled={vtoLoading} className="p-2 rounded-full hover:bg-secondary transition-colors"><X size={20} /></button>
                  </div>
                  <p className="text-sm font-body text-muted-foreground mb-6">ارفعي صورتك بوقفة مستقيمة لتجربة الموديل الجديد (Flux).</p>
                  
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-secondary/20 p-6 relative overflow-hidden mb-6 group hover:border-primary/50 transition-colors">
                    {humanImage ? (
                      <img src={humanImage} alt="Your photo" className="w-full h-full object-contain z-10 relative" />
                    ) : (
                      <div className="text-center z-10 relative pointer-events-none">
                        <Upload className="mx-auto text-muted-foreground mb-3" size={32} />
                        <p className="text-sm font-body font-medium">اضغطي لرفع صورتك</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" disabled={vtoLoading} />
                  </div>

                  <Button onClick={handleVirtualTryOn} disabled={!humanImage || vtoLoading} className="w-full rounded-xl h-14 gap-2">
                    {vtoLoading ? <><Loader className="animate-spin" size={18}/> جاري التفصيل بالذكاء الاصطناعي...</> : <><Sparkles size={18}/> تطبيق القياس</>}
                  </Button>
                </div>

                <div className="flex-1 bg-secondary/10 flex flex-col items-center justify-center p-6 relative">
                  {vtoLoading ? (
                    <div className="text-center flex flex-col items-center">
                      <Loader size={40} className="text-primary animate-spin mb-4" />
                      <p className="text-sm font-body text-muted-foreground animate-pulse">يتم ضبط القياسات... قد يستغرق الأمر 10 ثوانٍ</p>
                    </div>
                  ) : vtoResult ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-card border border-border bg-white">
                      <img src={vtoResult} alt="AI Try-On Result" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground/50">
                      <Sparkles size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="font-display text-lg">النتيجة ستظهر هنا</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductDetail;
