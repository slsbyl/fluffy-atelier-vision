import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Users, Factory, UserCheck, BarChart3, Plus, Edit, Trash2,
  TrendingUp, DollarSign, ShoppingBag, Sparkles, Download, Truck,
  ArrowUpRight, AlertTriangle, Award, Calendar, FileText, CheckCircle2, XCircle, RotateCcw, Wallet, Briefcase, Search, ArrowLeft, Building2, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import AddProductModal from "@/components/dashboard/AddProductModal";
import AddWorkerModal from "@/components/dashboard/AddWorkerModal";
import AddClientModal from "@/components/dashboard/AddClientModal";
import AIPredictionsTab from "@/components/dashboard/AIPredictionsTab";

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

type Tab = "products" | "clients" | "workers" | "orders" | "shipping" | "predictions";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "products", label: "Products", icon: <Package size={18} /> },
  { id: "clients", label: "Factory Clients", icon: <Factory size={18} /> },
  { id: "workers", label: "Workers", icon: <UserCheck size={18} /> },
  { id: "orders", label: "Orders", icon: <ShoppingBag size={18} /> },
  { id: "shipping", label: "Shipping Rates", icon: <Truck size={18} /> },
  { id: "predictions", label: "AI Predictions", icon: <Sparkles size={18} /> },
];

const StatCard = ({ label, value, icon, trend, accent }: { label: string; value: string; icon: React.ReactNode; trend?: string; accent?: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-4 md:p-5 shadow-card">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${accent || "bg-primary/10 text-primary"}`}>{icon}</div>
      {trend && (
        <span className="text-xs font-body text-green-600 flex items-center gap-1">
          <ArrowUpRight size={12} /> {trend}
        </span>
      )}
    </div>
    <p className="font-display text-xl md:text-2xl text-foreground">{value}</p>
    <p className="text-[11px] font-body text-muted-foreground mt-1">{label}</p>
  </motion.div>
);

const API_BASE_URL = 'https://fluffy-atelier-vision-production.up.railway.app/api/v1';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [managedProducts, setManagedProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [factoryClients, setFactoryClients] = useState<any[]>([]);
  const [wholesaleOrders, setWholesaleOrders] = useState<any[]>([]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClientDetails, setSelectedClientDetails] = useState<any>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [editWholesaleOrder, setEditWholesaleOrder] = useState<any>(null);
  const [wOrderForm, setWOrderForm] = useState<any>({ name: '', details: '', colors: '', price: 0, sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 } });
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);
  const [shippingRates, setShippingRates] = useState<Record<string, number>>({});

  const EGYPT_GOVERNORATES = [
    "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم",
    "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد",
    "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
    "جنوب سيناء", "شمال سيناء", "سوهاج", "قنا", "كفر الشيخ", "مطروح", "الأقصر"
  ];

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      if (response.data.status === 'success') {
        setManagedProducts(response.data.data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      if (response.data.status === 'success') {
        setOrders(response.data.data.orders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/workers`);
      if (response.data.status === 'success') {
        setWorkers(response.data.data.workers);
      }
    } catch (err) {
      console.error("Error fetching workers:", err);
    }
  };

  const fetchFactoryClients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/factory-clients`);
      if (response.data.status === 'success') {
        setFactoryClients(response.data.data.clients);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const fetchWholesaleOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wholesale-orders`);
      if (response.data.status === 'success') {
        setWholesaleOrders(response.data.data.orders);
      }
    } catch (err) {
      console.error("Error fetching wholesale orders:", err);
    }
  };

  const fetchShippingRates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shipping-rates`);
      if (response.data.status === 'success') {
        setShippingRates(response.data.data.rates || {});
      }
    } catch (err) {
      console.error("Error fetching shipping rates:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchWorkers();
    fetchFactoryClients();
    fetchWholesaleOrders();
    fetchShippingRates();
  }, []);

const handleSaveProduct = async (productData: any) => {
  try {
    let response;

    if (editingProduct?._id) {
      response = await axios.put(
        `${API_BASE_URL}/products/${editingProduct._id}`,
        productData
      );
      console.log("Product Update Response:", response.data);
    } else {
      response = await axios.post(`${API_BASE_URL}/products`, productData);
      console.log("Product Create Response:", response.data);
    }

    if (response.data.status === 'success') {
      await fetchProducts();
      setShowProductModal(false);
      setEditingProduct(null);
    } else {
      throw new Error(response.data.message || "Failed to save product");
    }
  } catch (err: any) {
    console.error("Error saving product:", err);
    const errorMessage = err.response?.data?.message || err.message || "Failed to save product";
    alert(errorMessage);
    throw new Error(errorMessage);
  }
};

  const handleDeleteOrder = async (orderId: string) => {
    // رسالة تأكيد قبل الحذف
    if (!window.confirm('هل أنتِ متأكدة من رغبتك في حذف هذا الطلب نهائياً؟')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/orders/${orderId}`);
      // تحديث القائمة فوراً لإخفاء الطلب المحذوف
      setOrders(currentOrders => currentOrders.filter(order => order._id !== orderId));
      alert('تم حذف الطلب بنجاح.');
    } catch (error) {
      console.error('Failed to delete order', error);
      alert('حدث خطأ أثناء حذف الطلب.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setManagedProducts(prev => prev.filter(p => (p._id || p.id) !== id));

        await axios.delete(`${API_BASE_URL}/products/${id}`);

        await fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product. Please try again.");
        await fetchProducts();
      }
    }
  };

  const handleSaveWorker = async (workerData: any) => {
    try {
      if (workerData._id) {
        await axios.put(`${API_BASE_URL}/workers/${workerData._id}`, workerData);
      } else {
        await axios.post(`${API_BASE_URL}/workers`, workerData);
      }
      await fetchWorkers();
    } catch (err: any) {
      console.error("Error saving worker:", err);
      const errorMessage = err.response?.data?.message || err.message || "فشل في حفظ بيانات العامل.";
      alert(errorMessage);
      // Re-throw the error to be caught by the modal
      throw new Error(errorMessage);
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا العامل نهائياً؟")) {
      try {
        setWorkers(prev => prev.filter(w => w._id !== id));
        await axios.delete(`${API_BASE_URL}/workers/${id}`);
      } catch (err) {
        console.error("Error deleting worker:", err);
        await fetchWorkers();
      }
    }
  };

  const updateWorkerStat = async (worker: any, field: 'presentDays' | 'absentDays', increment: number) => {
    try {
      const newValue = Math.max(0, (worker[field] || 0) + increment);
      setWorkers(prev => prev.map(w => w._id === worker._id ? { ...w, [field]: newValue } : w));
      await axios.put(`${API_BASE_URL}/workers/${worker._id}`, { [field]: newValue });
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      await fetchWorkers();
    }
  };

  const resetWorkerMonth = async (worker: any) => {
    if (window.confirm(`هل تريدين تصفير حسابات وحضور (${worker.name}) لبدء شهر جديد؟`)) {
      try {
        const resetData = { presentDays: 0, absentDays: 0, deductions: 0 };
        setWorkers(prev => prev.map(w => w._id === worker._id ? { ...w, ...resetData } : w));
        await axios.put(`${API_BASE_URL}/workers/${worker._id}`, resetData);
      } catch (err) {
        console.error("Error resetting worker:", err);
        await fetchWorkers();
      }
    }
  };

  const handleSaveClient = async (clientData: any) => {
    try {
      await axios.post(`${API_BASE_URL}/factory-clients`, clientData);
      await fetchFactoryClients();
    } catch (err: any) {
      console.error("Error saving client:", err);
      const errorMessage = err.response?.data?.message || err.message || "فشل في حفظ العميل.";
      alert(errorMessage);
      // Re-throw the error to be caught by the modal
      throw new Error(errorMessage);
    }
  };

  const handleDeleteFactoryClient = async (clientId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening the client details view
    if (window.confirm('هل أنتِ متأكدة من حذف هذا العميل وجميع طلباته نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        await axios.delete(`${API_BASE_URL}/factory-clients/${clientId}`);
        setFactoryClients(currentClients => currentClients.filter(client => client._id !== clientId));
        // Also remove their orders from the state to keep UI consistent
        setWholesaleOrders(currentOrders => currentOrders.filter(order => order.clientId !== clientId));
        alert('تم حذف العميل وطلباته بنجاح.');
      } catch (error) {
        console.error('Failed to delete factory client', error);
        alert('حدث خطأ أثناء حذف العميل.');
      }
    }
  };

  const recordClientPayment = async (clientId: string) => {
    const amount = window.prompt(`أدخلي المبلغ الذي سدده العميل:`);
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      try {
        await axios.post(`${API_BASE_URL}/factory-clients/${clientId}/payment`, { amount });
        alert("تم تسجيل الدفعة بنجاح، وتم تحديث رصيد العميل اللحظي.");
        await fetchFactoryClients();
        if(selectedClientDetails) {
           setSelectedClientDetails(prev => ({...prev, paidAmount: prev.paidAmount + Number(amount)}));
        }
      } catch (err) {
        alert("فشل في تسجيل الدفعة.");
      }
    }
  };

  const updateWholesaleOrder = async (orderId: string, updates: any) => {
    try {
      await axios.put(`${API_BASE_URL}/wholesale-orders/${orderId}`, updates);
      setEditWholesaleOrder(null);
      await fetchWholesaleOrders();
      await fetchFactoryClients();
        
        if (selectedClientDetails) {
           const clientRes = await axios.get(`${API_BASE_URL}/factory-clients/${selectedClientDetails._id}`);
           if (clientRes.data.status === 'success') {
             setSelectedClientDetails(clientRes.data.data.client);
           }
        }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("فشل في التحديث");
    }
  };

  const openEditWOrder = (order: any) => {
    setEditWholesaleOrder(order);
    setWOrderForm({
      name: order.productName,
      details: order.details || '',
      colors: order.colors ? order.colors.join('، ') : '',
      price: order.pricePerPiece || 0,
      sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, ...order.quantityPerSize }
    });
  };

  const saveShippingRates = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/shipping-rates`, { rates: shippingRates });
      alert("تم حفظ أسعار التوصيل بنجاح!");
      // Update state with the response from the server to be sure
      if (response.data.status === 'success') setShippingRates(response.data.data.rates);
    } catch (err: any) {
      console.error("Error saving shipping rates:", err);
      const errorMessage = err.response?.data?.message || err.message || "فشل في حفظ أسعار التوصيل.";
      alert(errorMessage);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const outOfStockCount = managedProducts.filter(p => (p.stock || 0) === 0).length;
  const totalWorkersSalary = workers.reduce((sum, w) => sum + (w.salary || 0), 0);
  const totalFactoryDebt = factoryClients.reduce((sum, c) => sum + (c.totalDebt - c.paidAmount), 0);
  
  const filteredClients = factoryClients.filter(c => 
    c.companyName.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.ownerName.toLowerCase().includes(clientSearch.toLowerCase())
  );
  const dynamicCategories = Array.from(new Set(managedProducts.map(p => p.category).filter(Boolean)));

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Owner Dashboard</h1>
          <p className="text-sm font-body text-muted-foreground">Manage your brand, factory, and production</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard label="Total Orders" value={String(orders.length)} icon={<ShoppingBag size={18} />} trend="+8%" />
          <StatCard label="Revenue" value={`${totalRevenue.toLocaleString()} EGP`} icon={<DollarSign size={18} />} trend="+12%" />
          <StatCard label="Products" value={String(managedProducts.length)} icon={<Package size={18} />} />
          <StatCard label="Workers" value={String(workers.length)} icon={<Users size={18} />} />
          <StatCard label="Factory Debts" value={`${totalFactoryDebt.toLocaleString()} EGP`} icon={<Wallet size={18} />} accent="bg-destructive/10 text-destructive" />
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-body tracking-wider uppercase whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeTab === "products" && (
              <div className="bg-card rounded-3xl border border-border p-4 md:p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl text-foreground">Product Management</h2>
                  <Button size="sm" className="rounded-full font-body text-xs gap-2" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
                    <Plus size={14} /> Add Product
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Product", "Category", "Price", "Actions"].map(h => (
                          <th key={h} className="text-left text-xs font-body tracking-wider uppercase text-muted-foreground py-3 px-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {managedProducts.map(product => {
                        const productId = product._id || product.id;
                        return (
                          <tr key={productId} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover" />
                                <span className="text-sm font-body text-foreground">{product.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm font-body text-muted-foreground">{product.category}</td>
                            <td className="py-3 px-2 text-sm font-body text-foreground">{product.price} EGP</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setEditingProduct(product); setShowProductModal(true); }}
                                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(productId)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <AddProductModal open={showProductModal} onClose={() => setShowProductModal(false)} onSave={handleSaveProduct} editProduct={editingProduct} categories={dynamicCategories.length > 0 ? dynamicCategories : ["Tops", "Dresses", "Outerwear", "Bottoms", "Knitwear"]} />
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-card rounded-3xl border border-border p-4 md:p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl text-foreground">Customer Orders</h2>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground font-body">No orders received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-border rounded-2xl p-4 md:p-6 bg-secondary/10 relative overflow-hidden">
                        <div className="absolute top-4 right-4">
                          <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDeleteOrder(order._id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                        <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-border/50 pb-4 mb-4 pr-12">
                          <div>
                            <h3 className="font-display text-lg">Order #{String(order._id).slice(-6).toUpperCase()}</h3>
                            <p className="text-xs text-muted-foreground font-body mt-1">
                              Date: {new Date(order.createdAt || order.date).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-left md:text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-body tracking-wider uppercase ${
                              order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              order.status === 'Processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              order.status === 'Shipped' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {order.status || 'Pending'}
                            </span>
                            <p className="font-display text-xl text-primary mt-2">{order.totalAmount} EGP</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <p className="text-xs font-body tracking-wider uppercase text-muted-foreground mb-3">Customer Details</p>
                            <div className="bg-background rounded-xl p-4 border border-border/50 space-y-2">
                              <p className="text-sm font-body"><span className="text-muted-foreground inline-block w-20">Name:</span> <span className="font-medium text-foreground">{order.customerName}</span></p>
                              <p className="text-sm font-body"><span className="text-muted-foreground inline-block w-20">Phone:</span> <span className="font-medium text-foreground" dir="ltr">{order.phone}</span></p>
                              <p className="text-sm font-body"><span className="text-muted-foreground inline-block w-20">Address:</span> <span className="font-medium text-foreground">{order.address}</span></p>
                              {order.governorate && (
                                <>
                                  <div className="border-t border-border/50 my-2"></div>
                                  <p className="text-sm font-body"><span className="text-muted-foreground inline-block w-20">Gov/City:</span> <span className="font-medium text-foreground">{order.governorate}</span></p>
                                  <p className="text-sm font-body"><span className="text-muted-foreground inline-block w-20">Shipping:</span> <span className="font-medium text-foreground">{order.shippingFee} EGP</span></p>
                                </>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-body tracking-wider uppercase text-muted-foreground mb-3">Order Items ({order.items?.length || 0})</p>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-background p-3 rounded-xl border border-border/50">
                                  <div>
                                    <p className="text-sm font-body font-medium">{item.productName}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-body">
                                      <span>Size: <span className="font-medium text-foreground">{item.size || 'N/A'}</span></span>
                                      {item.color && (
                                        <>
                                          <span>|</span>
                                          <span className="flex items-center gap-1">
                                            Color: 
                                            <span className="w-3 h-3 rounded-full border border-border/50 shadow-soft inline-block ml-1" style={{ backgroundColor: getColorCode(item.color) }} title={item.color}></span>
                                            <span className="font-medium text-foreground">{item.color}</span>
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-body text-muted-foreground mb-1">Qty: <span className="font-medium text-foreground text-sm">{item.quantity}</span></p>
                                    <p className="text-sm text-primary font-display">{item.price * item.quantity} EGP</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "clients" && (
              <div className="bg-card rounded-3xl border border-border p-4 md:p-6 shadow-card">
                {!selectedClientDetails ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-display text-xl text-foreground">Factory Clients</h2>
                        <p className="text-xs font-body text-muted-foreground mt-1">Manage B2B accounts and debts</p>
                      </div>
                      <Button size="sm" className="rounded-full font-body text-xs gap-2" onClick={() => setShowClientModal(true)}>
                        <Plus size={14} /> Add Client
                      </Button>
                    </div>
                    
                    <div className="relative mb-6">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text"
                        placeholder="Search by company or owner name..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {filteredClients.map(client => {
                        const remainingDebt = Math.max(0, client.totalDebt - client.paidAmount);
                        const clientOrdersCount = wholesaleOrders.filter(o => o.clientId === client._id).length;
                        return (
                          <div key={client._id} onClick={() => setSelectedClientDetails(client)} className="border border-border rounded-2xl p-5 bg-secondary/10 cursor-pointer hover:border-primary/50 transition-colors group relative">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => handleDeleteFactoryClient(client._id, e)}
                                    className="p-2 bg-background border border-border rounded-full text-muted-foreground hover:text-destructive shadow-soft"
                                    title="Delete Client"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <h3 className="font-display text-lg text-foreground flex items-center gap-2 mb-1"><Building2 size={16}/> {client.companyName}</h3>
                            <p className="text-xs font-body text-muted-foreground mb-4">{client.ownerName}</p>

                            <div className="flex justify-between items-end border-t border-border/50 pt-3">
                              <div>
                                <p className="text-[10px] uppercase text-muted-foreground">{remainingDebt < 0 ? 'Client Credit' : 'Debt Due'}</p>
                                <p className={`font-display text-lg ${remainingDebt > 0 ? 'text-destructive' : 'text-green-600'}`}>{Math.abs(remainingDebt).toLocaleString()} EGP</p>
                              </div>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-body">{clientOrdersCount} orders</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                    <button onClick={() => setSelectedClientDetails(null)} className="flex items-center gap-2 text-xs font-body text-muted-foreground hover:text-foreground mb-6">
                      <ArrowLeft size={14}/> Back to Client List
                    </button>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-border pb-6">
                      <div>
                        <h2 className="font-display text-3xl text-foreground">{selectedClientDetails.companyName}</h2>
                        <p className="text-sm font-body text-muted-foreground mt-1">Owner: {selectedClientDetails.ownerName} | Phone: {selectedClientDetails.phone}</p>
                    <div className="mt-3 flex gap-4 text-xs font-body bg-primary/5 p-2.5 rounded-xl border border-primary/20 w-fit">
                      <p><span className="text-muted-foreground">Username:</span> <span className="font-bold tracking-wider" dir="ltr">{selectedClientDetails.username}</span></p>
                      <div className="w-px h-4 bg-primary/20"></div>
                      <p><span className="text-muted-foreground">Password:</span> <span className="font-bold tracking-wider" dir="ltr">{selectedClientDetails.password}</span></p>
                    </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-2xl border border-border shadow-soft">
                           <div className="text-center">
                             <p className="text-[10px] text-muted-foreground uppercase">Total Billed</p>
                             <p className="font-bold text-sm">{selectedClientDetails.totalDebt.toLocaleString()} EGP</p>
                           </div>
                           <div className="w-px h-6 bg-border"></div>
                           <div className="text-center">
                             <p className="text-[10px] text-muted-foreground uppercase">Total Paid</p>
                             <p className="font-bold text-sm text-green-600">{selectedClientDetails.paidAmount.toLocaleString()} EGP</p>
                           </div>
                           <div className="w-px h-6 bg-border"></div>
                           <div className="text-center">
                             <p className="text-[10px] text-muted-foreground uppercase">{(selectedClientDetails.totalDebt - selectedClientDetails.paidAmount) < 0 ? 'Credit Balance' : 'Debt'}</p>
                             <p className={`font-bold text-sm ${(selectedClientDetails.totalDebt - selectedClientDetails.paidAmount) > 0 ? 'text-destructive' : 'text-green-600'}`}>{Math.abs(selectedClientDetails.totalDebt - selectedClientDetails.paidAmount).toLocaleString()} EGP</p>
                           </div>
                        </div>
                        <Button onClick={() => recordClientPayment(selectedClientDetails._id)} className="rounded-full gap-2 text-xs h-9">
                          <Wallet size={14}/> Record Payment
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="font-display text-xl mb-4">Order History</h3>
                      <div className="space-y-4">
                        {wholesaleOrders.filter(o => o.clientId === selectedClientDetails._id).map(order => (
                          <div key={order._id} className="border border-border rounded-2xl p-4 bg-background flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div 
                                className="flex -space-x-3 cursor-pointer group relative"
                                onClick={() => setViewingImages(order.productImages?.length > 0 ? order.productImages : (order.productImage ? [order.productImage] : []))}
                                title="Click to view and download images"
                              >
                                {(order.productImages?.length > 0 ? order.productImages : (order.productImage ? [order.productImage] : [])).map((img: string, i: number) => (
                                  <img key={i} src={img} className="w-16 h-20 object-cover rounded-xl border-2 border-background shadow-soft group-hover:border-primary transition-colors" alt="img"/>
                                ))}
                                <div className="absolute inset-0 bg-black/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Search size={16} className="text-white drop-shadow-md"/>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-bold text-base text-foreground">{order.productName}</p>
                                  <button onClick={() => openEditWOrder(order)} className="p-1.5 bg-secondary text-muted-foreground hover:text-primary rounded-full transition-colors shadow-soft">
                                    <Edit size={14} />
                                  </button>
                                </div>
                                <div className="bg-secondary/20 p-3 rounded-xl border border-border/50 space-y-2 max-w-md w-full">
                                  {order.details && (
                                    <p className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Details/Notes:</span> {order.details}</p>
                                  )}
                                  {order.colors && order.colors.length > 0 && (
                                    <div className="flex flex-wrap gap-1 items-center">
                                      <span className="text-[10px] font-bold text-foreground">Colors:</span>
                                      {order.colors.map((c: string, i: number) => <span key={i} className="bg-background border border-border px-2 py-0.5 rounded-md text-[10px]">{c}</span>)}
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-1 items-center mt-1">
                                    <span className="text-[10px] font-bold text-foreground">Sizes:</span>
                                    {Object.entries(order.quantityPerSize).map(([s, q]) => Number(q) > 0 && (
                                      <span key={s} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] font-display">{s}: {q as number}</span>
                                    ))}
                                    <span className="bg-background border border-border px-2 py-0.5 rounded-md text-[10px] font-bold mr-auto">Total: {order.totalQuantity} pieces</span>
                                  </div>
                                </div>
                                
                                <div className="mt-3">
                                  {!order.pricePerPiece || order.pricePerPiece === 0 ? (
                                    <div className="flex gap-2">
                                      <input type="number" id={`price-${order._id}`} placeholder="Price per piece (EGP)" className="w-32 h-8 px-2 text-xs border border-border rounded-lg bg-background" />
                                      <Button size="sm" className="h-8 text-[10px] rounded-lg" onClick={() => {
                                        const val = (document.getElementById(`price-${order._id}`) as HTMLInputElement).value;
                                        if(val && Number(val) > 0) updateWholesaleOrder(order._id, { pricePerPiece: Number(val) });
                                      }}>Set Price</Button>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-foreground mt-1">Price: <span className="text-primary font-bold">{order.pricePerPiece} EGP</span>/piece | Total: <span className="text-primary font-bold">{order.totalPrice} EGP</span></p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <select 
                              value={order.status} 
                              onChange={(e) => updateWholesaleOrder(order._id, { status: e.target.value })}
                              disabled={!order.pricePerPiece || order.pricePerPiece === 0}
                              className="text-xs font-body px-3 py-2 rounded-xl border border-input bg-background focus:outline-none disabled:opacity-50"
                            >
                              <option value="في انتظار التسعير">Pending Pricing</option>
                              <option value="قيد الانتظار">Pending</option>
                              <option value="جاري القص">Cutting</option>
                              <option value="جاري الخياطة">Sewing</option>
                              <option value="تم التسليم">Delivered (Adds to Debt)</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                    </div>

                  <AnimatePresence>
                    {editWholesaleOrder && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm" onClick={() => setEditWholesaleOrder(null)}>
                        <div className="bg-card rounded-3xl p-6 w-full max-w-sm border border-border shadow-elevated" onClick={e => e.stopPropagation()}>
                          <h3 className="font-display text-xl mb-4">Edit Order Details</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs text-muted-foreground">Model Name</label>
                              <Input value={wOrderForm.name} onChange={e => setWOrderForm({...wOrderForm, name: e.target.value})} className="h-10 mt-1 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-muted-foreground">Price per piece (EGP)</label>
                                <Input type="number" min="0" value={wOrderForm.price} onChange={e => setWOrderForm({...wOrderForm, price: Number(e.target.value)})} className="h-10 mt-1 rounded-xl" />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Colors (comma separated)</label>
                                <Input value={wOrderForm.colors} onChange={e => setWOrderForm({...wOrderForm, colors: e.target.value})} className="h-10 mt-1 rounded-xl" />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Details/Notes</label>
                              <textarea value={wOrderForm.details} onChange={e => setWOrderForm({...wOrderForm, details: e.target.value})} className="w-full p-3 mt-1 text-sm border border-input rounded-xl bg-background resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Adjusted Quantities</label>
                              <div className="grid grid-cols-5 gap-2 mt-1">
                                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                  <div key={size} className="text-center">
                                    <span className="text-[10px] block mb-1 font-display">{size}</span>
                                    <Input type="number" min="0" value={wOrderForm.sizes[size]} onChange={(e) => setWOrderForm({...wOrderForm, sizes: {...wOrderForm.sizes, [size]: Number(e.target.value)}})} className="text-center h-8 px-1 text-xs rounded-lg" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" onClick={() => setEditWholesaleOrder(null)} className="flex-1 rounded-full text-xs h-10">Cancel</Button>
                              <Button onClick={() => updateWholesaleOrder(editWholesaleOrder._id, { 
                                productName: wOrderForm.name, 
                                details: wOrderForm.details,
                                colors: wOrderForm.colors.split('،').map((c:string) => c.trim()).filter(Boolean),
                                pricePerPiece: wOrderForm.price,
                                quantityPerSize: wOrderForm.sizes, 
                                totalQuantity: Object.values(wOrderForm.sizes).reduce((a:any,b:any)=>a+b, 0) 
                              })} className="flex-1 rounded-full text-xs h-10 bg-green-600 hover:bg-green-700 text-white">Save Changes</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {viewingImages && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm" onClick={() => setViewingImages(null)}>
                        <button className="absolute top-6 right-6 p-2 bg-card rounded-full shadow-elevated text-foreground" onClick={() => setViewingImages(null)}>
                          <X size={20} />
                        </button>
                        <div className="flex flex-col items-center gap-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 custom-scrollbar" onClick={e => e.stopPropagation()}>
                          {viewingImages.map((img, i) => (
                            <div key={i} className="relative group rounded-2xl overflow-hidden bg-secondary/20 border border-border shadow-elevated">
                              <img src={img} alt="model" className="w-full max-w-2xl object-contain max-h-[70vh]" />
                              <button 
                                onClick={() => {
                                  fetch(img).then(r => r.blob()).then(blob => {
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(blob);
                                    a.download = `model-image-${i+1}.jpg`;
                                    a.click();
                                  });
                                }}
                                className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-body shadow-soft opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
                              >
                                <Download size={16} /> Download Image
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                  </>
                )}
                <AddClientModal open={showClientModal} onClose={() => setShowClientModal(false)} onSave={handleSaveClient} />
              </div>
            )}

            {activeTab === "workers" && (
              <div className="bg-card rounded-3xl border border-border p-4 md:p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-xl text-foreground">Team & Payroll</h2>
                    <p className="text-xs font-body text-muted-foreground mt-1">Total Payroll: {totalWorkersSalary.toLocaleString()} EGP</p>
                  </div>
                  <Button size="sm" className="rounded-full font-body text-xs gap-2" onClick={() => { setEditingWorker(null); setShowWorkerModal(true); }}>
                    <Plus size={14} /> Add Worker
                  </Button>
                </div>

                {workers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-body">No workers registered yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workers.map((worker) => {
                      const netSalary = Math.max(0, (worker.salary || 0) - (worker.deductions || 0));
                      return (
                        <div key={worker._id} className="border border-border rounded-3xl p-5 bg-secondary/10 relative group">
                          <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingWorker(worker); setShowWorkerModal(true); }} className="p-2 bg-background border border-border rounded-full text-muted-foreground hover:text-primary shadow-soft" title="Edit">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteWorker(worker._id)} className="p-2 bg-background border border-border rounded-full text-muted-foreground hover:text-destructive shadow-soft" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="mb-4">
                            <h3 className="font-display text-xl text-foreground flex items-center gap-2">
                              {worker.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-xs font-body text-muted-foreground">
                              <span className="flex items-center gap-1 bg-background px-2 py-1 rounded-md border border-border/50"><Briefcase size={12} className="text-primary"/> {worker.role}</span>
                              <span className="flex items-center gap-1"><Calendar size={12} /> {worker.startDate}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-4 bg-background p-3 rounded-2xl border border-border/50 text-center">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Salary</p>
                              <p className="font-display text-sm">{worker.salary} EGP</p>
                            </div>
                            <div className="border-x border-border/50">
                              <p className="text-[10px] uppercase tracking-wider text-destructive mb-1">Deductions</p>
                              <p className="font-display text-sm text-destructive">-{worker.deductions} EGP</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-green-600 mb-1">Net</p>
                              <p className="font-display text-sm text-green-600 font-bold">{netSalary} EGP</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-background p-3 rounded-2xl border border-border/50 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span className="text-sm font-body font-bold">{worker.presentDays || 0} <span className="text-[10px] text-muted-foreground font-normal">Present</span></span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <button onClick={() => updateWorkerStat(worker, 'presentDays', 1)} className="w-6 h-4 bg-secondary hover:bg-green-100 text-green-700 flex items-center justify-center rounded text-xs transition-colors">+</button>
                                <button onClick={() => updateWorkerStat(worker, 'presentDays', -1)} className="w-6 h-4 bg-secondary hover:bg-red-100 text-red-700 flex items-center justify-center rounded text-xs transition-colors">-</button>
                              </div>
                            </div>
                            <div className="w-px h-8 bg-border/50"></div>
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col gap-1">
                                <button onClick={() => updateWorkerStat(worker, 'absentDays', 1)} className="w-6 h-4 bg-secondary hover:bg-green-100 text-green-700 flex items-center justify-center rounded text-xs transition-colors">+</button>
                                <button onClick={() => updateWorkerStat(worker, 'absentDays', -1)} className="w-6 h-4 bg-secondary hover:bg-red-100 text-red-700 flex items-center justify-center rounded text-xs transition-colors">-</button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-body font-bold">{worker.absentDays || 0} <span className="text-[10px] text-muted-foreground font-normal">Absent</span></span>
                                <XCircle size={16} className="text-destructive" />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-end justify-between mt-2">
                            <div className="flex-1 pr-4">
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1"><FileText size={12}/> Notes:</p>
                              <p className="text-xs font-body text-foreground line-clamp-2">{worker.notes || 'No notes'}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => resetWorkerMonth(worker)} className="shrink-0 h-8 rounded-full text-[10px] gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors">
                              <RotateCcw size={12} /> Reset Month
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <AddWorkerModal open={showWorkerModal} onClose={() => setShowWorkerModal(false)} onSave={handleSaveWorker} editWorker={editingWorker} />
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="bg-card rounded-3xl border border-border p-4 md:p-6 shadow-card">
                <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
                  <div>
                    <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Truck size={20}/> Shipping Rates for Governorates</h2>
                    <p className="text-xs font-body text-muted-foreground mt-1">Set the shipping cost for each governorate to be automatically added to the customer's order total.</p>
                  </div>
                  <Button onClick={saveShippingRates} className="rounded-full gap-2">
                    <Check size={16} /> Save Changes
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {EGYPT_GOVERNORATES.map(gov => (
                    <div key={gov} className="flex items-center justify-between p-3 rounded-2xl border border-border/50 bg-secondary/20">
                      <span className="text-sm font-bold text-foreground w-28 truncate">{gov}</span>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          min="0"
                          value={shippingRates[gov] || 0} 
                          onChange={(e) => setShippingRates({...shippingRates, [gov]: Number(e.target.value)})}
                          className="w-16 h-8 text-center text-xs font-bold rounded-lg border-border"
                        />
                        <span className="text-muted-foreground text-sm">EGP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "predictions" && (
              <AIPredictionsTab
                orders={orders}
                wholesaleOrders={wholesaleOrders}
                products={managedProducts}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OwnerDashboard;