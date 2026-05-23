import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: any) => void;
}

const AddClientModal = ({ open, onClose, onSave }: AddClientModalProps) => {
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave({
      companyName,
      ownerName,
      phone,
      username,
      password
    });
    setIsLoading(false);
    setCompanyName(""); setOwnerName(""); setPhone(""); setUsername(""); setPassword("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-foreground">
                Add Factory Client
              </h2>
              <button onClick={onClose} disabled={isLoading} className="p-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Company Name</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="اسم المصنع/الشركة" className="rounded-xl mt-1" required disabled={isLoading} />
                </div>
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Owner Name</Label>
                  <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="اسم المالك" className="rounded-xl mt-1" required disabled={isLoading} />
                </div>
              </div>

              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Contact Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الهاتف" className="rounded-xl mt-1" required disabled={isLoading} />
              </div>

              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-4">
                <p className="text-xs font-body font-bold text-primary">Login Credentials (بيانات دخول العميل)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Username</Label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="اسم المستخدم" className="rounded-xl mt-1 text-left" dir="ltr" required disabled={isLoading} />
                  </div>
                  <div>
                    <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Password</Label>
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="rounded-xl mt-1 text-left" dir="ltr" required disabled={isLoading} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full font-body text-xs" disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-full font-body text-xs" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Create Account"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddClientModal;
