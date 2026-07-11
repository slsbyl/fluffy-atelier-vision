import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = 'https://fluffy-atelier-vision-production.up.railway.app/api/v1';

const VirtualTryOn = () => {
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [vtoResult, setVtoResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!uploadedPhoto || !selectedProduct) return;
    try {
      setIsProcessing(true);
      setShowResult(false);
      setVtoResult(null);

      let finalProductImage = selectedProduct.image;
      
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

      const response = await axios.post(`${API_BASE_URL}/vto`, {
        humanImage: uploadedPhoto,
        productImage: finalProductImage,
        category: selectedProduct.category
      });
      
      if (response.data.status === 'success') {
        if (response.data.mocked) {
          toast({ 
            title: "Insufficient Credits", 
            description: response.data.message || "Showing fallback image.", 
            variant: "default" 
          });
        }
        setVtoResult(response.data.data.resultImage);
        setShowResult(true);
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to process virtual try-on", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-body tracking-wider uppercase mb-4">
            <Sparkles size={14} /> AI Powered
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">Virtual Try-On</h1>
          <p className="text-sm font-body text-muted-foreground max-w-md mx-auto">
            Upload your photo and see how our clothing looks on you before purchasing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-3xl border border-border p-6 shadow-card">
              <h3 className="font-display text-lg text-foreground mb-4">1. Upload Your Photo</h3>
              {!uploadedPhoto ? (
                <label className="flex flex-col items-center justify-center h-72 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                  <Upload size={32} className="text-muted-foreground mb-3" />
                  <p className="text-sm font-body text-muted-foreground mb-1">Click to upload or drag & drop</p>
                  <p className="text-xs font-body text-muted-foreground/60">JPG, PNG up to 10MB</p>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden h-72">
                  <img src={uploadedPhoto} alt="Your photo" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setUploadedPhoto(null); setShowResult(false); }}
                    className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm p-2 rounded-full shadow-soft"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-card rounded-3xl border border-border p-6 shadow-card">
              <h3 className="font-display text-lg text-foreground mb-4">2. Select an Item</h3>
              <div className="grid grid-cols-3 gap-3">
                {products.filter(p => p.inStock).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => { setSelectedProduct(product); setShowResult(false); }}
                    className={`rounded-2xl overflow-hidden aspect-square border-2 transition-all duration-300 ${
                      selectedProduct?.id === product.id
                        ? "border-primary shadow-soft scale-95"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {selectedProduct && (
                <p className="text-xs font-body text-primary mt-3 text-center">
                  Selected: {selectedProduct.name}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-3xl border border-border p-6 shadow-card min-h-[500px] flex flex-col items-center justify-center">
              <h3 className="font-display text-lg text-foreground mb-4 self-start">3. Your Try-On Result</h3>

              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-sm font-body text-muted-foreground">AI is creating your try-on...</p>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, delay: i * 0.2, duration: 0.8 }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : showResult && vtoResult && selectedProduct ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex-1 flex flex-col items-center"
                  >
                    <div className="relative rounded-2xl overflow-hidden w-full aspect-[3/4] bg-secondary/30">
                      <img src={vtoResult} alt="Try-on result" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-2xl p-4 shadow-elevated">
                        <div className="flex items-center gap-3">
                          <img src={selectedProduct.image} alt={selectedProduct.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1">
                            <p className="font-display text-sm text-foreground">{selectedProduct.name}</p>
                            <p className="text-xs font-body text-muted-foreground">${selectedProduct.price}</p>
                          </div>
                          <Button size="sm" className="rounded-full text-xs font-body">
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-body text-muted-foreground mt-3 text-center">
                      * This is an AI-generated preview. Actual fit may vary.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <Camera size={48} className="text-muted-foreground/20" />
                    <p className="text-sm font-body text-muted-foreground">
                      Upload a photo and select an item to see yourself wearing it
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              onClick={handleTryOn}
              disabled={!uploadedPhoto || !selectedProduct || isProcessing}
              size="lg"
              className="w-full rounded-2xl font-body tracking-wider uppercase text-sm h-14"
            >
              <Sparkles size={18} className="mr-2" />
              {isProcessing ? "Processing..." : "Generate Try-On"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
