import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage("");
    try {
      const response = await axios.post('https://fluffy-atelier-vision-production.up.railway.app/api/v1/users/forgot-password', { email: email.trim().toLowerCase() });
      setMessage(response.data.message || "تم إرسال رابط إعادة التعيين بنجاح.");
    } catch (error: any) {
      if (error.message === "Network Error") {
        setMessage("السيرفر لا يعمل! تأكدي من تشغيل الباك-إند وتثبيت المكاتب.");
      } else {
        setMessage(error.response?.data?.message || "حدث خطأ. يرجى المحاولة مرة أخرى.");
      }
      console.error(error);
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
          <h1 className="font-display text-3xl text-foreground mb-2">Reset Password</h1>
          <p className="text-sm font-body text-muted-foreground">Enter your email and we'll send you a reset link</p>
        </div>

        {message ? (
          <div className="text-center p-6 bg-secondary rounded-2xl">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="font-body text-foreground">{message}</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-14 pl-12 pr-5 rounded-2xl bg-secondary border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <Button type="submit" size="lg" disabled={isLoading} className="w-full rounded-2xl font-body tracking-wider uppercase text-sm h-14">
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}

        <div className="text-center mt-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
