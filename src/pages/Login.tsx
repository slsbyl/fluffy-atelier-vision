import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_BASE_URL = 'https://fluffy-atelier-vision-production.up.railway.app/api/v1';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email: email.trim().toLowerCase(),
      password,
    });

    if (response.data.status === 'success') {
      const userData = response.data.data?.user || response.data.user;
      const token = response.data.token || response.data.data?.token;
      const userRole = userData?.role || response.data.role;

      if (token) localStorage.setItem('token', token);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userRole);
      }

      if (userRole === 'owner' || userRole === 'admin') {
        navigate('/owner'); 
      } else {
        navigate('/');
      }
    }
  } catch (err: any) {
    console.error("تفاصيل خطأ اللوجين:", err);
    alert(err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
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
          <h1 className="font-display text-3xl text-foreground mb-2">Welcome Back</h1>
          <p className="text-sm font-body text-muted-foreground">Sign in to your Fluffy account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-5 rounded-2xl bg-secondary border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-12 rounded-2xl bg-secondary border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs font-body text-primary hover:underline">Forgot password?</Link>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-2xl font-body tracking-wider uppercase text-sm h-14">
            Sign In
          </Button>
        </form>

        <div className="mt-8 space-y-3">
          <Button type="button" variant="secondary" size="lg" className="w-full rounded-2xl font-body text-sm h-14 bg-secondary border border-border" onClick={() => navigate('/factory-dashboard')}>
            <Factory className="w-4 h-4 mr-3" />
            Factory / B2B Login (بوابة الجملة)
          </Button>
        </div>

        <p className="text-center text-sm font-body text-muted-foreground mt-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-bold">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;