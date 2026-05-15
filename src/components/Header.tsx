import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, Menu, X, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Best Sellers", to: "/best-sellers" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // قراءة بيانات المستخدم الحالي للتحقق من صلاحياته
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isOwner = user && (user.role === 'owner' || user.role === 'admin');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-foreground">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="font-display text-2xl tracking-widest text-foreground">FLUFFY</Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={`text-sm font-body tracking-wide uppercase transition-colors hover:text-primary ${location.pathname === link.to ? "text-primary" : "text-muted-foreground"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isOwner && (
            <Link to="/owner" className="text-foreground hover:text-primary transition-colors" title="Owner Dashboard">
              <LayoutDashboard size={20} />
            </Link>
          )}
          <Link to="/login" className="text-foreground hover:text-primary transition-colors">
            <User size={20} />
          </Link>
          <Link to="/cart" className="text-foreground hover:text-primary transition-colors relative">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-body">{totalItems}</span>
            )}
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden overflow-hidden border-t border-border/50 bg-card">
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="text-sm font-body tracking-wide uppercase text-muted-foreground hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
              {isOwner && (
                <Link to="/owner" onClick={() => setMobileOpen(false)} className="text-sm font-body tracking-wide uppercase text-muted-foreground hover:text-primary transition-colors">Owner Dashboard</Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
