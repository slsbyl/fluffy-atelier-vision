import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const navigate = useNavigate();
  const hasMultipleImages = (product as any).images && (product as any).images.length > 1;
  const secondaryImage = hasMultipleImages ? (product as any).images[1] : null;

  // تحقق من المخزون
  const inStock = product.inStock || ((product as any).stock && (product as any).stock > 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // توجيه المستخدم لصفحة تفاصيل المنتج لاختيار اللون والمقاس لكل قطعة
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-secondary/30 aspect-[3/4] mb-4">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${hasMultipleImages ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
            loading="lazy"
          />
          {hasMultipleImages && (
            <img
              src={secondaryImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
            />
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isBestSeller && (
              <span className="bg-primary text-primary-foreground text-[10px] font-body tracking-wider uppercase px-3 py-1 rounded-full">
                Best Seller
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-card text-foreground text-[10px] font-body tracking-wider uppercase px-3 py-1 rounded-full shadow-soft">
                New
              </span>
            )}
            {inStock ? (
              <span className="bg-green-500/90 text-white text-[10px] font-body tracking-wider uppercase px-3 py-1 rounded-full">
                In Stock
              </span>
            ) : (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-body tracking-wider uppercase px-3 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick add button */}
          {inStock && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.05 }}
              className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm p-3 rounded-full shadow-soft opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleQuickAdd}
            >
              <ShoppingBag size={18} className="text-foreground" />
            </motion.button>
          )}
        </div>

        <div className="px-1">
          {product.reviews > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <Star size={12} className="text-primary fill-primary" />
              <span className="text-xs text-muted-foreground font-body">{product.rating.toFixed(1)} ({product.reviews})</span>
            </div>
          )}
          <h3 className="font-display text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
             <p className="text-xs font-body text-muted-foreground mt-1 line-clamp-2">
               {product.description}
             </p>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm font-body text-primary font-medium">
              ${product.price}
            </p>
            <div className="flex flex-col items-end gap-1">
              {product.sizes && product.sizes.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {product.sizes.join(', ')}
                </p>
              )}
              {(product as any).colors && (product as any).colors.length > 0 && (
                <div className="flex items-center gap-1">
                  {(product as any).colors.slice(0, 4).map((color: string, i: number) => (
                    <span key={i} className="w-2.5 h-2.5 rounded-full border border-border/50 shadow-soft" style={{ backgroundColor: color }} title={color}></span>
                  ))}
                  {(product as any).colors.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">+{(product as any).colors.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
