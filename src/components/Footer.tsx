import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card py-12 border-t border-border mt-auto">
      <div className="container mx-auto px-6 text-center">
        {/* اسم اللوجو */}
        <Link to="/" className="font-display text-3xl tracking-widest text-foreground inline-block mb-4">
          FLUFFY
        </Link>
        
        {/* وصف المتجر */}
        <p className="text-sm font-body text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
          Elegant, soft, feminine fashion for the modern woman. Designed with love and passion to make you feel effortlessly beautiful.
        </p>
        
        {/* أيقونات السوشيال ميديا */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <a 
            href="https://www.facebook.com/share/1JmeGquNVK/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Facebook"
          >
            <Facebook size={24} />
          </a>
          <a 
            href="https://www.instagram.com/fluffy.eg1?igsh=ZmY4Y2lqZHU5ZW5r" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Instagram"
          >
            <Instagram size={24} />
          </a>
        </div>
        
        {/* حقوق النشر */}
        <p className="text-xs font-body text-muted-foreground/60">
          © {new Date().getFullYear()} Fluffy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
