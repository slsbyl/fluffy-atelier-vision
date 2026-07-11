import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

interface AddProductionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (record: any) => Promise<void>;
  editRecord?: any;
}

const statusOptions = ["Pending", "Cutting", "Sewing", "Finished"];

const API_BASE_URL = 'https://fluffy-atelier-vision-production.up.railway.app/api/v1';

const AddProductionModal = ({ open, onClose, onSave, editRecord }: AddProductionModalProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("Pending");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingProducts, setFetchingProducts] = useState(false);

 
  useEffect(() => {
    if (open && products.length === 0) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      setFetchingProducts(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      if (response.data.status === 'success') {
        setProducts(response.data.data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setFetchingProducts(false);
    }
  };

  
  useEffect(() => {
    if (open) {
      if (editRecord) {
        setSelectedProductId(editRecord.product || "");
        setSelectedProduct(editRecord.productName || "");
        setQuantity(String(editRecord.quantity) || "");
        setStatus(editRecord.status || "Pending");
        setStartDate(editRecord.startDate?.split("T")[0] || new Date().toISOString().split("T")[0]);
      } else {
        setSelectedProductId("");
        setSelectedProduct("");
        setQuantity("");
        setStatus("Pending");
        setStartDate(new Date().toISOString().split("T")[0]);
      }
      setError(null);
      setIsLoading(false);
    }
  }, [open, editRecord]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    const product = products.find(p => p._id === productId);
    if (product) {
      setSelectedProductId(productId);
      setSelectedProduct(product.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProductId) {
      setError("Please select a product");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    const productionData = {
      product: selectedProductId,
      productName: selectedProduct,
      quantity: Number(quantity),
      status: status,
      startDate: startDate
    };

    try {
      setIsLoading(true);
      await onSave(productionData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save production record");
      setIsLoading(false);
    }
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
                {editRecord ? "Edit Production" : "Create Production"}
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2">
                <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs font-body text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">
                  Select Product *
                </Label>
                {fetchingProducts ? (
                  <div className="h-10 rounded-xl border border-input bg-background flex items-center px-3 text-sm text-muted-foreground">
                    Loading products...
                  </div>
                ) : (
                  <select
                    value={selectedProductId}
                    onChange={handleProductChange}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-body mt-1 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    disabled={isLoading || products.length === 0}
                    required
                  >
                    <option value="">Choose a product...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">
                  Quantity to Produce *
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 100"
                  className="rounded-xl mt-1"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">
                  Status *
                </Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-body mt-1 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  disabled={isLoading}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-full font-body text-xs"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full font-body text-xs"
                  disabled={isLoading || products.length === 0}
                >
                  {isLoading ? "Saving..." : editRecord ? "Save Changes" : "Create Production"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddProductionModal;
