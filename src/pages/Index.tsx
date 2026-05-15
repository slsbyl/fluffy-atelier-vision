import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import heroImage from "@/assets/hero-1.jpg";
import collectionImage from "@/assets/collection-1.jpg";
import axios from "axios";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/products');
        if (response.data.status === 'success') {
          const transformed = response.data.data.products.map((item: any) => ({
            id: item._id || item.id,
            ...item
          }));
          setProducts(transformed);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const bestSellers = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).filter(p => p.isBestSeller || (p.soldCount && p.soldCount > 0)).slice(0, 6);

  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : products.slice(0, 4);
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : products.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src={heroImage}
            alt="Fluffy fashion hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-body tracking-[0.3em] uppercase text-foreground/80 mb-4"
          >
            Spring / Summer 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wider text-foreground mb-6"
          >
            FLUFFY
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-base md:text-lg font-body text-foreground/70 max-w-md mb-8"
          >
            Elegance woven into every thread. Discover our new collection.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button asChild size="lg" className="rounded-full px-8 font-body tracking-wider uppercase text-sm">
              <Link to="/shop">
                Explore Collection <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-2">Curated for You</p>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">New Arrivals</h2>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {displayNewArrivals.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Collection Banner */}
      <section className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-6"
        >
          <div className="relative rounded-3xl overflow-hidden h-[500px]">
            <img
              src={collectionImage}
              alt="Fluffy collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 to-transparent flex items-center">
              <div className="p-10 md:p-16 max-w-lg">
                <p className="text-xs font-body tracking-[0.3em] uppercase text-card/80 mb-3">The Edit</p>
                <h2 className="font-display text-4xl md:text-5xl text-card mb-4">
                  Soft & Dreamy
                </h2>
                <p className="text-sm font-body text-card/80 mb-6">
                  Our signature palette of blush, cream and rose — designed to make you feel effortlessly beautiful.
                </p>
                <Button asChild variant="secondary" size="lg" className="rounded-full px-8 font-body tracking-wider uppercase text-sm">
                  <Link to="/shop">Shop the Edit</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-2">Most Loved</p>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">Best Sellers</h2>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {displayBestSellers.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 font-body tracking-wider uppercase text-sm">
            <Link to="/shop?filter=best">View All Best Sellers</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
