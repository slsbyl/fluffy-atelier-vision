import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: any) => Promise<void>;
  editProduct?: any;
  categories?: string[];
}

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

const getColorCode = (colorName: string) => {
  const colorsMap: Record<string, string> = {
    "أحمر": "red", "احمر": "red", "أزرق": "blue", "ازرق": "blue",
    "أخضر": "green", "اخضر": "green", "أسود": "black", "اسود": "black",
    "أبيض": "white", "ابيض": "white", "أصفر": "yellow", "اصفر": "yellow",
    "برتقالي": "orange", "وردي": "pink", "بمبي": "pink", "بنفسجي": "purple",
    "رمادي": "gray", "رصاصي": "gray", "بني": "brown", "كحلي": "navy",
    "بيج": "beige", "ذهبي": "gold", "فضي": "silver"
  };
  return colorsMap[colorName.trim().toLowerCase()] || colorName;
};

const AddProductModal = ({ open, onClose, onSave, editProduct, categories = ["Tops", "Dresses", "Outerwear", "Bottoms", "Knitwear"] }: AddProductModalProps) => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Fluffy");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Tops");
  const [description, setDescription] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editProduct) {
        setName(editProduct.name || "");
        setBrand(editProduct.brand || "Fluffy");
        setPrice(editProduct.price?.toString() || "");
        setStock(editProduct.stock?.toString() || "");
        setCategory(editProduct.category || "Tops");
        setDescription(editProduct.description || "");
        setSelectedSizes(editProduct.sizes || []);
        setSelectedColors(editProduct.colors || []);
        setImagePreviews(editProduct.images && editProduct.images.length > 0 ? editProduct.images : (editProduct.image ? [editProduct.image] : []));
      } else {
        setName("");
        setBrand("Fluffy");
        setPrice("");
        setStock("");
        setCategory("Tops");
        setDescription("");
        setSelectedSizes([]);
        setSelectedColors([]);
        setImagePreviews([]);
      }
      setError(null);
    }
  }, [open, editProduct]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddColor = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const trimmed = customColor.trim();
    if (trimmed && !selectedColors.includes(trimmed)) {
      setSelectedColors([...selectedColors, trimmed]);
    }
    setCustomColor("");
  };

  const removeColor = (colorToRemove: string) => {
    setSelectedColors(selectedColors.filter((c) => c !== colorToRemove));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!category.trim()) {
      setError("Category is required");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (!stock || Number(stock) < 0) {
      setError("Stock must be 0 or greater");
      return;
    }
    if (selectedSizes.length === 0) {
      setError("Please select at least one size");
      return;
    }

    const stockNum = Number(stock);
    const priceNum = Number(price);

    const productData = {
      _id: editProduct ? editProduct._id : undefined,
      id: editProduct ? (editProduct.id || editProduct._id) : undefined,
      name: name.trim(),
      price: priceNum,
      category: category,
      description: description.trim() || "No description",
      brand: brand.trim() || "Fluffy",
      stock: stockNum,
      sizes: selectedSizes,
      colors: selectedColors,
      image: imagePreviews.length > 0 ? imagePreviews[0] : "https://via.placeholder.com/150",
      images: imagePreviews,
      inStock: stockNum > 0
    };

    try {
      setIsLoading(true);
      console.log("بيانات المنتج المرسلة للباك-إند:", productData); // 👈 أضف هذا السطر
      await onSave(productData);
      // Reset form after successful save
      setName("");
      setBrand("Fluffy");
      setPrice("");
      setStock("");
      setCategory("Tops");
      setDescription("");
      setSelectedSizes([]);
      setSelectedColors([]);
      setImagePreviews([]);
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
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
            className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-foreground">
                {editProduct ? "Edit Product" : "Add Product"}
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
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Product Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Silk Blush Blouse"
                  className="rounded-xl mt-1"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Brand</Label>
                  <Input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Fluffy"
                    className="rounded-xl mt-1"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Category *</Label>
                  <Input
                    list="category-options"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="اكتبي القسم أو اختاري من القائمة"
                    className="rounded-xl mt-1"
                    disabled={isLoading}
                  />
                  <datalist id="category-options">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Price ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="129"
                    className="rounded-xl mt-1"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Stock Qty *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="100"
                    className="rounded-xl mt-1"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Sizes *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 rounded-full text-xs font-body transition-all disabled:opacity-50 ${
                        selectedSizes.includes(size)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

          <div>
            <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Colors *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={customColor.startsWith('#') ? customColor : '#000000'}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-14 h-10 p-1 rounded-xl cursor-pointer shadow-soft border-border"
                title="اختر أي لون من لوحة الألوان"
              />
              <Input
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddColor();
                  }
                }}
                placeholder="اكتب لوناً أو اختر من المربع الجانبي"
                className="rounded-xl"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={handleAddColor}
                disabled={isLoading || !customColor.trim()}
                className="rounded-xl font-body text-xs px-4"
              >
                إضافة
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedColors.map((color) => (
                <span
                  key={color}
                  className="px-3 py-1.5 rounded-full text-xs font-body bg-primary text-primary-foreground flex items-center gap-2 shadow-soft"
                >
                  <span className="w-3 h-3 rounded-full border border-border/50 bg-white" style={{ backgroundColor: getColorCode(color) }}></span>
                  {color}
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="hover:text-red-300 focus:outline-none"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-body mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-xs font-body tracking-wider uppercase text-muted-foreground">Product Images *</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-2xl border border-border shadow-sm">
                      <img src={img} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-soft" disabled={isLoading}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer bg-secondary/30">
                    <Upload size={20} className="text-muted-foreground mb-1" />
                    <span className="text-[10px] font-body text-muted-foreground">Add Image</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" disabled={isLoading} />
                  </label>
                </div>
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
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : editProduct ? "Save Changes" : "Add Product"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal;
