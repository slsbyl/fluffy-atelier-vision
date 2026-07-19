import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, X, RotateCcw, Loader, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { restoreStockOnReturn } from "@/api/stockApi";
import axios from "axios";

interface OrderRecord {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  governorate?: string;
  shippingFee?: number;
  items: { productId: string; name: string; size: string; color?: string; quantity: number; price: number }[];
  total: number;
  date: string;
  status?: string;
}

const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم",
  "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد",
  "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
  "جنوب سيناء", "شمال سيناء", "سوهاج", "قنا", "كفر الشيخ", "مطروح", "الأقصر"
];

const API_BASE_URL = 'https://fluffy-atelier-vision-production.up.railway.app/api/v1';

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr).email || "" : "";
  });
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [shippingRates, setShippingRates] = useState<Record<string, number>>({});
  const [lastPlacedOrder, setLastPlacedOrder] = useState<{ id: string, items: any[] } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const total = getTotal();
  const shippingFee = shippingRates[governorate] || 0;
  const finalTotal = total + shippingFee;

  useEffect(() => {
    axios.get(`${API_BASE_URL}/shipping-rates`)
      .then(res => {
        if (res.data.status === 'success') {
          setShippingRates(res.data.data.rates);
        }
      })
      .catch(console.error);
  }, []);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !email.trim() || !phone.trim() || !address.trim() || !governorate) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع البيانات المطلوبة واختيار المحافظة",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "خطأ",
        description: "السلة فارغة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerName,
        email,
        phone,
        address,
        governorate,
        shippingFee,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          size: i.size || "",
          color: i.color,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: finalTotal,
      };

      const res = await axios.post(`${API_BASE_URL}/orders`, orderData);

      if (res.data.status === 'success') {
        setLastPlacedOrder({
          id: res.data.data?.orderId || res.data.data?._id,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
        });

        clearCart();
        setShowCheckout(false);
        setCustomerName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setGovernorate("");

        toast({
          title: "تم تأكيد الطلب بنجاح",
          description: `Thank you ${customerName}! Your order for ${finalTotal} EGP has been confirmed. It will be delivered soon.`,
        });
      } else {
        toast({
          title: "فشل الطلب",
          description: res.data.message || "حدث خطأ. الرجاء المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      const message = error.response?.data?.message || "حدث خطأ غير متوقع. الرجاء المحاولة لاحقاً.";
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnOrder = async () => {
    if (lastPlacedOrder) {
      try {
        setIsSubmitting(true);
        const restoreResult = await restoreStockOnReturn(
          lastPlacedOrder.id,
          lastPlacedOrder.items
        );

        if (restoreResult) {
          setLastPlacedOrder(null);
          toast({
            title: "تم إرجاع الطلب",
            description: `تم إرجاع الطلب بنجاح وتحديث الحالة في MongoDB و n8n.`,
          });
        } else {
          toast({
            title: "فشل الإرجاع",
            description: "لم نتمكن من إرجاع الطلب. الرجاء المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error returning order:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Continue Shopping
          </Link>

          <h1 className="font-display text-3xl text-foreground mb-8">Shopping Cart</h1>

          {lastPlacedOrder ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-card border border-border rounded-3xl shadow-card px-6"
            >
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-2">Your order has been confirmed successfully!</h2>
              <p className="text-sm font-body text-muted-foreground mb-8">Order Number: {lastPlacedOrder.id}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  className="rounded-full font-body text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleReturnOrder}
                  disabled={isSubmitting}
                >
                  <RotateCcw size={16} className="mr-2" /> Return Order (Cancel)
                </Button>
                <Button className="rounded-full font-body" onClick={() => setLastPlacedOrder(null)}>
                  العودة للتسوق
                </Button>
              </div>
            </motion.div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground">Your cart is empty</p>
              <Button asChild className="rounded-full mt-6 font-body tracking-wider uppercase text-sm">
                <Link to="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              {items.length > 0 && (
                <>
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.size}-${item.color || ''}`}
                        layout
                        exit={{ opacity: 0, x: -50 }}
                        className="flex gap-4 py-6 border-b border-border"
                      >
                        <div className="w-24 h-32 rounded-xl overflow-hidden bg-secondary/30 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-display text-base text-foreground">
                              {item.productName}
                            </h3>
                            <p className="text-xs font-body text-muted-foreground mt-1 flex items-center gap-2">
                              <span>Size: {item.size}</span>
                              {item.color && (
                                <>
                                  <span>|</span>
                                  <span className="flex items-center gap-1">
                                    Color: 
                                    {item.color.startsWith('#') ? (
                                      <span className="w-3 h-3 rounded-full border border-border inline-block" style={{ backgroundColor: item.color }} />
                                    ) : (
                                      item.color
                                    )}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.size, item.quantity - 1, item.color)
                                }
                                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-accent transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-body w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  if (item.stock && item.quantity < item.stock) {
                                    updateQuantity(item.productId, item.size, item.quantity + 1, item.color);
                                  } else {
                                    toast({
                                      title: "الحد الأقصى للمخزون",
                                      description: "لا يمكن إضافة المزيد من هذا المنتج",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                disabled={!item.stock || item.quantity >= item.stock}
                                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="font-display text-base text-foreground">
                              {item.price * item.quantity} EGP
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="text-muted-foreground hover:text-destructive transition-colors self-start"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-display text-lg text-foreground">Total</span>
                      <span className="font-display text-2xl text-foreground">{total} EGP</span>
                    </div>
                    <Button
                      size="lg"
                      className="w-full rounded-2xl font-body tracking-wider uppercase text-sm h-14"
                      onClick={() => setShowCheckout(true)}
                    >
                      Confirm Order
                    </Button>
                  </div>
                </>
              )}

            </>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-foreground">Confirm Order</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                >
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
              <form onSubmit={handleConfirmOrder} className="space-y-4">
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name"
                    className="rounded-xl mt-1"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (to receive order details)"
                    className="rounded-xl mt-1 text-left"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">
                    Phone Number
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 xxx xxxx xxxx"
                    className="rounded-xl mt-1"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">
                    Governorate
                  </Label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-body mt-1 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Governorate...</option>
                    {EGYPT_GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov} - {shippingRates[gov] || 0} EGP</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">
                    Delivery Address
                  </Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full Address"
                    className="rounded-xl mt-1"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground mb-2">Order Summary</p>
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm font-body text-foreground mb-1">
                      <span className="flex items-center gap-1">
                        {item.productName} ({item.size}) 
                        {item.color && (
                          <span className="inline-flex items-center">
                            - {item.color.startsWith('#') ? (
                              <span className="w-2.5 h-2.5 rounded-full border border-border inline-block mr-1" style={{ backgroundColor: item.color }} />
                            ) : item.color}
                          </span>
                        )}
                        x{item.quantity}
                      </span>
                      <span>{item.price * item.quantity} EGP</span>
                    </div>
                  ))}
                  <div className="border-t border-border mt-2 pt-2 flex justify-between font-display text-foreground text-sm">
                    <span>Subtotal</span>
                    <span>{total} EGP</span>
                  </div>
                  {governorate && (
                    <div className="flex justify-between font-display text-foreground text-sm mt-1">
                      <span>Shipping ({governorate})</span>
                      <span>{shippingFee} EGP</span>
                    </div>
                  )}
                  <div className="border-t border-border mt-2 pt-2 flex justify-between font-display text-foreground text-lg">
                    <span>Grand Total</span>
                    <span className="text-primary">{finalTotal} EGP</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 rounded-full font-body text-xs"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-full font-body text-xs"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Order"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
