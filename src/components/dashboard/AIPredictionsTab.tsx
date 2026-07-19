import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Package, BrainCircuit, Palette, Ruler, AlertTriangle } from 'lucide-react';

interface AIPredictionsTabProps {
  orders: any[];
  wholesaleOrders: any[];
  products: any[];
}

const StatCard = ({ label, value, icon, note }: { label: string; value: string; icon: React.ReactNode; note: string; }) => (
  <div className="bg-background rounded-3xl border border-border p-6 shadow-card">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl bg-primary/10 text-primary">{icon}</div>
    </div>
    <p className="font-display text-3xl text-foreground">{value}</p>
    <p className="text-sm font-body text-muted-foreground mt-1">{label}</p>
    <p className="text-xs font-body text-muted-foreground/70 mt-3 pt-3 border-t border-border/50">{note}</p>
  </div>
);

const AIPredictionsTab = ({ orders, wholesaleOrders, products }: AIPredictionsTabProps) => {
  const [predictions, setPredictions] = useState({
    revenueForecast: 0,
    topRetailProduct: null as any | null,
    trends: null as { color: string, colorPct: number, size: string, sizePct: number } | null,
    atRiskProduct: null as any | null
  });

  useEffect(() => {
    const allOrdersForRevenue = [
      ...orders.map(o => ({ date: o.createdAt, total: o.totalAmount })),
      ...wholesaleOrders.filter(o => o.status === 'تم التسليم').map(o => ({ date: o.createdAt, total: o.totalPrice }))
    ];

    const monthlyRevenue: Record<string, number> = {};
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    allOrdersForRevenue.forEach(order => {
      const orderDate = new Date(order.date);
      if (orderDate >= threeMonthsAgo) {
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (order.total || 0);
      }
    });

    const revenueValues = Object.values(monthlyRevenue);
    const averageMonthlyRevenue = revenueValues.length > 0
      ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length
      : 0;
    
    const revenueForecast = averageMonthlyRevenue > 0 ? averageMonthlyRevenue * 1.05 : 5000;

    let topRetailProduct = null;
    if (products && products.length > 0) {
        const sortedProducts = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        if (sortedProducts.length > 0 && sortedProducts[0].soldCount > 0) {
            topRetailProduct = sortedProducts[0];
        }
    }

    let totalColorPieces = 0;
    let totalSizePieces = 0;
    const colorCounts: Record<string, number> = {};
    const sizeCounts: Record<string, number> = {};

    orders.forEach(o => {
      o.items?.forEach((item: any) => {
        const q = Number(item.quantity) || 0;
        if(item.color) { const c = item.color.trim(); colorCounts[c] = (colorCounts[c] || 0) + q; totalColorPieces += q; }
        if(item.size) { const s = item.size.trim(); sizeCounts[s] = (sizeCounts[s] || 0) + q; totalSizePieces += q; }
      });
    });

    wholesaleOrders.forEach(o => {
      const totalQ = Number(o.totalQuantity) || 0;
      if (o.quantityPerSize) {
        Object.entries(o.quantityPerSize).forEach(([size, qty]) => {
          const q = Number(qty) || 0;
          if (q > 0) { const s = size.trim(); sizeCounts[s] = (sizeCounts[s] || 0) + q; totalSizePieces += q; }
        });
      }
      if (o.colors && Array.isArray(o.colors) && o.colors.length > 0) {
        const qPerColor = totalQ / o.colors.length;
        o.colors.forEach((color: string) => { const c = color.trim(); colorCounts[c] = (colorCounts[c] || 0) + qPerColor; totalColorPieces += qPerColor; });
      }
    });

    let topColor = ""; let maxC = 0;
    Object.entries(colorCounts).forEach(([c, q]) => { if(q > maxC) { maxC = q; topColor = c; }});
    let topSize = ""; let maxS = 0;
    Object.entries(sizeCounts).forEach(([s, q]) => { if(q > maxS) { maxS = q; topSize = s; }});

    let trends = null;
    if (topColor && topSize) {
      trends = { color: topColor, colorPct: totalColorPieces > 0 ? Math.round((maxC / totalColorPieces) * 100) : 0, size: topSize, sizePct: totalSizePieces > 0 ? Math.round((maxS / totalSizePieces) * 100) : 0 };
    }

    let atRiskProduct = null;
    if (products && products.length > 0) {
      const riskyProducts = products.filter(p => p.stock > 0 && p.stock <= 15 && p.soldCount > 0);
      if (riskyProducts.length > 0) {
        riskyProducts.sort((a, b) => a.stock - b.stock);
        atRiskProduct = riskyProducts[0];
      }
    }

    setPredictions({ revenueForecast, topRetailProduct, trends, atRiskProduct });

  }, [orders, wholesaleOrders, products]);

  return (
    <motion.div 
      key="predictions" 
      className="bg-card rounded-3xl border border-border p-4 md:p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-xl text-foreground flex items-center gap-2"><BrainCircuit size={20}/> AI Sales & Revenue Predictions</h2>
          <p className="text-xs font-body text-muted-foreground mt-1">توقعات مستقبلية بناءً على بياناتك التاريخية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
        <StatCard 
          label="Next Month's Revenue Forecast"
          value={`${Math.round(predictions.revenueForecast).toLocaleString()} EGP`}
          icon={<DollarSign size={24} />}
          note="محسوبة بناءً على متوسط إيرادات آخر 3 أشهر مع إضافة نسبة نمو متوقعة."
        />
        
        {predictions.topRetailProduct ? (
          <div className="bg-background rounded-3xl border border-border p-6 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><Package size={24} /></div>
            </div>
            <p className="font-display text-2xl text-foreground truncate">{predictions.topRetailProduct.name}</p>
            <p className="text-sm font-body text-muted-foreground mt-1">Predicted Top Selling Retail Product</p>
            <p className="text-xs font-body text-muted-foreground/70 mt-3 pt-3 border-t border-border/50">
              هذا المنتج هو الأعلى مبيعاً تاريخياً في متجرك، ومن المتوقع أن يستمر نجاحه.
            </p>
          </div>
        ) : (
           <StatCard 
            label="Predicted Top Selling Product"
            value="No Data"
            icon={<Package size={24} />}
            note="لا توجد بيانات مبيعات كافية للتوقع. قم بإضافة بعض الطلبات أولاً."
          />
        )}

        {predictions.atRiskProduct ? (
          <div className="bg-background rounded-3xl border border-destructive/30 p-6 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-bl-full -mr-8 -mt-8" />
            <div className="flex items-start justify-between mb-4 relative">
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive"><AlertTriangle size={24} /></div>
              <span className="text-xs font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-full">متبقي {predictions.atRiskProduct.stock} فقط</span>
            </div>
            <p className="font-display text-xl text-foreground truncate relative">{predictions.atRiskProduct.name}</p>
            <p className="text-sm font-body text-muted-foreground mt-1 relative">خطر نفاذ المخزون</p>
            <p className="text-xs font-body text-muted-foreground/70 mt-3 pt-3 border-t border-border/50 relative">
              هذا المنتج يباع بسرعة ومخزونه أوشك على النفاذ! ننصحك ببدء تصنيع كمية جديدة منه الآن.
            </p>
          </div>
        ) : (
           <StatCard 
            label="Inventory Health"
            value="Safe"
            icon={<AlertTriangle size={24} />}
            note="لا توجد منتجات مهددة بنفاذ المخزون. حالة المستودع ممتازة."
          />
        )}
      </div>

      {predictions.trends && (
        <div className="mt-6 bg-background rounded-3xl border border-border p-6 shadow-card">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary flex gap-3">
              <Palette size={24} />
              <Ruler size={24} />
            </div>
          </div>
          <p className="font-display text-xl md:text-2xl text-foreground">
            اللون <span className="text-primary">{predictions.trends.color}</span> والمقاس <span className="text-primary">{predictions.trends.size}</span> هما الأكثر طلباً!
          </p>
          <p className="text-sm font-body text-muted-foreground mt-1">Fashion & Attributes Trends</p>
          <p className="text-xs md:text-sm font-body text-muted-foreground mt-3 pt-3 border-t border-border/50 leading-relaxed">
            تحليل الطلبات السابقة يوضح أن اللون <strong>({predictions.trends.color})</strong> يمثل <strong>{predictions.trends.colorPct}%</strong> من طلبات الألوان، والمقاس <strong>({predictions.trends.size})</strong> يمثل <strong>{predictions.trends.sizePct}%</strong> من طلبات المقاسات. <br/>
            <strong className="text-primary">نصيحة الذكاء الاصطناعي:</strong> ركزي في شراء القماش وعمليات القص القادمة على هذه المواصفات لتجنب الهدر المادي وزيادة سرعة المبيعات!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AIPredictionsTab;