import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddWorkerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (worker: any) => void;
  editWorker?: any;
}

const AddWorkerModal = ({ open, onClose, onSave, editWorker }: AddWorkerModalProps) => {
  const [name, setName] = useState(editWorker?.name || "");
  const [role, setRole] = useState(editWorker?.role || "");
  const [salary, setSalary] = useState(editWorker?.salary?.toString() || "");
  const [startDate, setStartDate] = useState(editWorker?.startDate || "");
  const [deductions, setDeductions] = useState(editWorker?.deductions?.toString() || "0");
  const [newDeduction, setNewDeduction] = useState("");
  const [notes, setNotes] = useState(editWorker?.notes || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editWorker?.name || "");
      setRole(editWorker?.role || "");
      setSalary(editWorker?.salary?.toString() || "");
      setStartDate(editWorker?.startDate || new Date().toISOString().split("T")[0]);
      setDeductions(editWorker?.deductions?.toString() || "0");
      setNewDeduction("");
      setNotes(editWorker?.notes || "");
    }
  }, [open, editWorker]);

  const currentSalary = Number(salary) || 0;
  const currentTotalDeductions = Number(deductions) || 0;
  const addedDeduction = Number(newDeduction) || 0;
  const finalDeductions = currentTotalDeductions + addedDeduction;
  const netSalary = currentSalary - finalDeductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave({
      _id: editWorker?._id,
      name,
      role,
      salary: currentSalary,
      startDate,
      deductions: finalDeductions,
      notes
    });
    setIsLoading(false);
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
                {editWorker ? "Edit Worker" : "Add Worker"}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50" disabled={isLoading}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Worker Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم العامل" className="rounded-xl mt-1" required disabled={isLoading} />
              </div>
              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Job Role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="الوظيفة (مثال: خياط، مكواة)" className="rounded-xl mt-1" required disabled={isLoading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Salary ($)</Label>
                  <Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="الراتب الأساسي" className="rounded-xl mt-1" required disabled={isLoading} />
                </div>
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl mt-1" required disabled={isLoading} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Total Deductions (إجمالي السحوبات)</Label>
                  <Input type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} placeholder="0" className="rounded-xl mt-1" disabled={isLoading} />
                </div>
                {editWorker && (
                  <div>
                    <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">+ Add Deduction (سحب جديد)</Label>
                    <Input type="number" value={newDeduction} onChange={(e) => setNewDeduction(e.target.value)} placeholder="مبلغ السحب" className="rounded-xl mt-1" disabled={isLoading} />
                  </div>
                )}
              </div>

              <div className="p-3 bg-secondary/50 rounded-xl border border-border mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">الراتب الصافي المستحق:</span>
                  <span className={`font-bold ${netSalary < 0 ? 'text-destructive' : 'text-primary'}`}>
                    {netSalary} ج.م
                  </span>
                </div>
                {addedDeduction > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    بعد الحفظ، سيصبح إجمالي السحوبات {finalDeductions} ج.م
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Notes (ملاحظات)</Label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي ملاحظات عن العامل..." rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-body mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" disabled={isLoading} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full font-body text-xs" disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-full font-body text-xs" disabled={isLoading}>
                  {isLoading ? "Saving..." : (editWorker ? "Save Changes" : "Add Worker")}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddWorkerModal;
