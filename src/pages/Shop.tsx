import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { Loader } from "lucide-react";

const API_BASE_URL = 'https://fluffy-atelier-vision-production.up.railway.app/api/v1';

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dynamicCategories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_BASE_URL}/products`);

        if (response.data.status === 'success') {
          const transformedProducts: Product[] = response.data.data.products.map((item: any) => ({
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            images: item.images || [],
            sizes: item.sizes || [],
            colors: item.colors || [],
            inStock: item.inStock || item.stock > 0,
            stock: item.stock || 0,
            category: item.category,
            description: item.description,
            isBestSeller: item.isBestSeller || false,
            isNewArrival: item.isNewArrival || false,
            rating: item.rating || 0,
            reviews: item.reviews || 0,
            soldCount: item.soldCount || 0,
          }));

          setProducts(transformedProducts);
        } else {
          setError("Failed to load products");
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">Shop</h1>
          <p className="text-sm font-body text-muted-foreground">Discover pieces designed for the modern woman</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-body tracking-wider uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader size={48} className="text-primary" />
            </motion.div>
            <p className="mt-4 text-sm font-body text-muted-foreground">Loading amazing products...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-center">
              <p className="text-lg font-display text-destructive mb-2">Oops! Something went wrong</p>
              <p className="text-sm font-body text-muted-foreground mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs font-body tracking-wider uppercase hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <p className="text-center text-muted-foreground font-body text-lg">
              {products.length === 0
                ? "No products available yet. Check back soon!"
                : "No products found in this category."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
