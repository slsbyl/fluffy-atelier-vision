import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, DollarSign, LogOut, Factory, Send, Upload, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

const FactoryDashboard = () => {
  const [client, setClient] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [orders, setOrders] = useState<any[]>([]);
  
  const [productName, setProductName] = useState("");
  const [details, setDetails] = useState("");
  const [colors, setColors] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<Record<string, number>>({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const savedClient = localStorage.getItem("factory_client");
    if (savedClient) {
      setClient(JSON.parse(savedClient));
      fetchInitialData(JSON.parse(savedClient)._id);
    }
  }, []);

  const fetchInitialData = async (clientId: string) => {
    try {
      const clientRes = await axios.get(`http://localhost:3000/api/v1/factory-clients/${clientId}`);
      if (clientRes.data.status === 'success') {
        setClient(clientRes.data.data.client);
        localStorage.setItem("factory_client", JSON.stringify(clientRes.data.data.client));
      }

      const ordersRes = await axios.get(`http://localhost:3000/api/v1/wholesale-orders?clientId=${clientId}`);
      setOrders(ordersRes.data.data.orders);
    } catch (err) {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/v1/factory-clients/login', { username, password });
      setClient(res.data.data.client);
      localStorage.setItem("factory_client", JSON.stringify(res.data.data.client));
      fetchInitialData(res.data.data.client._id);
    } catch (err) {
      alert("بيانات الدخول غير صحيحة");
    }
  };

  const handleLogout = () => {
    setClient(null);
    localStorage.removeItem("factory_client");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditClick = (order: any) => {
    setEditingOrderId(order._id);
    setProductName(order.productName);
    setDetails(order.details || "");
    setColors(order.colors?.join(', ') || "");
    setUploadedImages(order.productImages?.length > 0 ? order.productImages : (order.productImage ? [order.productImage] : []));
    setSizes({ S: 0, M: 0, L: 0, XL: 0, XXL: 0, ...order.quantityPerSize });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingOrderId(null);
    setProductName(""); setDetails(""); setColors(""); setUploadedImages([]);
    setSizes({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
  };

  const submitOrder = async () => {
    if(!productName.trim()) return alert("الرجاء كتابة اسم أو وصف للمنتج");
    const totalQty = Object.values(sizes).reduce((a,b) => a+b, 0);
    if(totalQty === 0) return alert("أدخل كميات صحيحة للمقاسات");
    if(uploadedImages.length === 0) return alert("الرجاء رفع صورة واحدة على الأقل للمنتج المطلوب");
    
    try {
      const payload = {
        clientId: client._id,
        productName,
        productImages: uploadedImages,
        details,
        colors: colors.split(',').map(c => c.trim()).filter(Boolean),
        quantityPerSize: sizes,
        totalQuantity: totalQty
      };

      if (editingOrderId) {
        await axios.put(`http://localhost:3000/api/v1/wholesale-orders/${editingOrderId}`, payload);
        alert("تم تعديل الطلب بنجاح");
      } else {
        await axios.post('http://localhost:3000/api/v1/wholesale-orders', payload);
        alert("تم إرسال الطلب للمصنع بنجاح، في انتظار تسعير الأونر");
      }
      
      cancelEdit();
      fetchInitialData(client._id);
    } catch (err) {
      alert("فشل الإرسال");
    }
  };

  if (!client) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-secondary/30">
        <div className="bg-card p-8 rounded-3xl shadow-card max-w-sm w-full text-center border border-border">
          <Factory size={48} className="mx-auto text-primary mb-4" />
          <h2 className="font-display text-2xl mb-6">تسجيل دخول المصانع</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="اسم المستخدم" required />
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" required />
            <Button type="submit" className="w-full rounded-full">دخول</Button>
          </form>
        </div>
      </div>
    );
  }

  const remainingDebt = client.totalDebt - client.paidAmount; // Removed Math.max to allow showing credit!

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background" dir="rtl">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-border pb-6">
          <div>
            <h1 className="font-display text-3xl mb-1">أهلاً بك، {client.companyName}</h1>
            <p className="text-sm text-muted-foreground">بوابة الجملة الخاصة بك</p>
          </div>
          <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            <div className="flex items-center gap-4 bg-secondary/30 px-5 py-3 rounded-2xl border border-border">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground font-bold mb-1">إجمالي البضاعة</p>
                <p className="font-display text-base">${client.totalDebt.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground font-bold mb-1">المدفوع</p>
                <p className="font-display text-base text-green-600">${client.paidAmount.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground font-bold mb-1">{remainingDebt < 0 ? 'رصيد دائن لك' : 'المديونية'}</p>
                <p className={`font-display text-base ${remainingDebt > 0 ? 'text-destructive' : 'text-green-600'}`}>${Math.abs(remainingDebt).toLocaleString()}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="rounded-full gap-2">
              خروج <LogOut size={14}/>
            </Button>
          </div>
        </div>

        <div className="bg-secondary/20 rounded-3xl p-6 border border-border mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl flex items-center gap-2">
                <Package size={20}/> {editingOrderId ? "تعديل الطلب" : "طلب تشغيل منتج جديد"}
              </h2>
              {editingOrderId && (
                <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-destructive hover:bg-destructive/10 rounded-full text-xs">
                  <X size={14} className="mr-1"/> إلغاء التعديل
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">اسم الموديل / الصنف *</Label>
                <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="مثال: فستان سهرة صيفي" className="h-10 mt-1 bg-background rounded-xl" />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">صور التصميم *</Label>
                <div className="mt-1 flex flex-col gap-3">
                  <label className="flex items-center justify-center h-12 border border-dashed border-primary/50 text-primary hover:bg-primary/5 rounded-xl cursor-pointer transition-colors text-xs font-body">
                    <Upload size={16} className="mr-2" /> اضغط لرفع صور الموديل
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <img src={img} alt="preview" className="w-full h-full rounded-xl object-cover border border-border shadow-soft" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"><X size={10}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">الألوان المطلوبة (افصل بينها بفاصلة)</Label>
                <Input value={colors} onChange={e => setColors(e.target.value)} placeholder="مثال: أحمر، أسود، أبيض" className="h-10 mt-1 bg-background rounded-xl" />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">تفاصيل القماش وملاحظات</Label>
                <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="اكتب أي تفاصيل إضافية أو ملاحظات للتصنيع..." className="w-full h-20 p-3 mt-1 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="bg-background p-4 rounded-2xl border border-border/50">
                <p className="text-xs text-muted-foreground font-bold mb-3">توزيع الكميات على المقاسات *</p>
                <div className="grid grid-cols-5 gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <div key={size} className="text-center">
                      <span className="text-[10px] block mb-1 font-display">{size}</span>
                      <Input type="number" min="0" value={sizes[size]} onChange={(e) => setSizes({...sizes, [size]: Number(e.target.value)})} className="text-center h-9 px-1 text-xs rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={submitOrder} className={`w-full rounded-xl gap-2 mt-2 h-12 text-sm ${editingOrderId ? "bg-green-600 hover:bg-green-700" : ""}`}>
                {editingOrderId ? <><Edit size={16}/> حفظ التعديلات</> : <><Send size={16}/> إرسال الطلب للمصنع للتسعير</>}
              </Button>
            </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
          <h2 className="font-display text-xl mb-4">سجل الطلبيات الحالية والسابقة</h2>
          {orders.length === 0 ? <p className="text-muted-foreground text-sm">لا توجد طلبات سابقة.</p> : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="flex justify-between items-center p-4 border border-border/50 rounded-2xl bg-background">
                  <div className="flex justify-between w-full">
                    <div className="flex gap-4 items-center">
                      <div className="flex -space-x-3">
                        {(order.productImages?.length > 0 ? order.productImages : (order.productImage ? [order.productImage] : [])).map((img: string, i: number) => (
                          <img key={i} src={img} className="w-12 h-16 object-cover rounded-lg border-2 border-background shadow-soft" alt="img"/>
                        ))}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{order.productName}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">المقاسات: {Object.entries(order.quantityPerSize).map(([s,q])=>`${s}:${q}`).join(' | ')} (إجمالي {order.totalQuantity})</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        {order.status !== 'تم التسليم' && (
                          <button onClick={() => handleEditClick(order)} className="p-1.5 text-muted-foreground hover:text-primary bg-secondary rounded-full transition-colors" title="تعديل">
                            <Edit size={12} />
                          </button>
                        )}
                        <span className="text-[10px] bg-secondary px-3 py-1 rounded-full">{order.status}</span>
                      </div>
                      {order.pricePerPiece && order.pricePerPiece > 0 ? (
                        <div className="text-right">
                          <p className="font-display text-primary text-lg">${order.totalPrice}</p>
                          <p className="text-[10px] text-muted-foreground font-body">${order.pricePerPiece} للقطعة</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200">في انتظار التسعير</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FactoryDashboard;
