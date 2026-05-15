import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/users/signup', {
        name,
        email: email.trim().toLowerCase(),
        phone,
        password,
        role: 'customer' // دور المستخدم الافتراضي
      });
      
      if (response.data.status === 'success') {
        alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        navigate('/login');
      }
    } catch (err: any) {
      // طباعة تفاصيل الخطأ في الكونسول لتسهيل حله
      console.error("🔴 تفاصيل خطأ إنشاء الحساب:", err);
      
      if (err.message === "Network Error") {
        alert("لا يمكن الاتصال بالسيرفر! تأكدي من تشغيل الـ Backend على بورت 3000.");
      } else {
        alert(err.response?.data?.message || 'فشل في إنشاء الحساب. تأكدي من تشغيل السيرفر وقاعدة البيانات.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl text-foreground mb-2">Join Fluffy</h1>
          <p className="text-sm font-body text-muted-foreground">Create your account and start shopping</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="Full name" 
              className="w-full h-14 pl-12 pr-5 rounded-2xl bg-secondary border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" 
            />
          </div>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Email address" 
              className="w-full h-14 pl-12 pr-5 rounded-2xl bg-secondary border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" 
            />
          </div>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="Phone number" 
              className="w-full h-14 pl-12 pr-5 rounded-2xl bg-secondary border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" 
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full h-14 pl-12 pr-12 rounded-2xl bg-secondary border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" size="lg" disabled={isLoading} className="w-full rounded-2xl font-body tracking-wider uppercase text-sm h-14">
            {isLoading ? "جاري إنشاء الحساب..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm font-body text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-bold">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
