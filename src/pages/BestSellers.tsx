import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import axios from "axios";
import { Loader } from "lucide-react";

const API_BASE_URL = 'https://fluffy-atelier-vision-production.up.railway.app/api/v1';

const BestSellers = () => {
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        if (response.data.status === 'success') {
          const allProducts = response.data.data.products.map((item: any) => ({
            id: item._id || item.id,
            ...item
          }));
          const filtered = allProducts
            .sort((a: any, b: any) => (b.soldCount || 0) - (a.soldCount || 0))
            .filter((p: any) => p.isBestSeller || (p.soldCount && p.soldCount > 0));
          
          setBestSellers(filtered.length > 0 ? filtered : allProducts.slice(0, 8));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14"
      >
        <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-2">Most Loved</p>
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">Best Sellers</h1>
        <p className="text-sm font-body text-muted-foreground max-w-md mx-auto">
          Our most popular pieces, loved by customers worldwide. Ranked by total sales.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader size={48} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {bestSellers.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="relative">
              <div className="absolute -top-2 -left-2 z-10 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-display text-sm shadow-soft">
                #{i + 1}
              </div>
              <ProductCard product={product} index={i} />
              <p className="text-xs font-body text-muted-foreground mt-1 px-1">
                {product.soldCount} sold
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  </div>
  );
};

export default BestSellers;
