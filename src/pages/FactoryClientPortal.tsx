import { useState } from "react";
import { motion } from "framer-motion";
import { Package, DollarSign, Minus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Piece {
  id: string;
  name: string;
  totalStock: number;
  currentStock: number;
  sold: number;
  manufacturingDate: string;
  totalCost: number;
  paidAmount: number;
  remainingAmount: number;
}

const initialPieces: Piece[] = [
  { id: "1", name: "Silk Blush Blouse", totalStock: 200, currentStock: 180, sold: 20, manufacturingDate: "2026-02-01", totalCost: 10000, paidAmount: 8000, remainingAmount: 2000 },
  { id: "2", name: "Rose Pleated Skirt", totalStock: 150, currentStock: 140, sold: 10, manufacturingDate: "2026-02-10", totalCost: 7500, paidAmount: 6000, remainingAmount: 1500 },
  { id: "3", name: "Camel Wool Coat", totalStock: 100, currentStock: 85, sold: 15, manufacturingDate: "2026-01-15", totalCost: 12000, paidAmount: 12000, remainingAmount: 0 },
];

const FactoryClientPortal = () => {
  const [pieces, setPieces] = useState<Piece[]>(initialPieces);

  const handleDecrease = (id: string) => {
    setPieces(prev => prev.map(p => p.id === id && p.currentStock > 0 ? { ...p, currentStock: p.currentStock - 1, sold: p.sold + 1 } : p));
  };

  const totalPieces = pieces.reduce((s, p) => s + p.totalStock, 0);
  const totalSold = pieces.reduce((s, p) => s + p.sold, 0);
  const totalRemaining = pieces.reduce((s, p) => s + p.currentStock, 0);
  const totalPaid = pieces.reduce((s, p) => s + p.paidAmount, 0);
  const totalBalance = pieces.reduce((s, p) => s + p.remainingAmount, 0);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-1">Factory Client Portal</p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Your Production Overview</h1>
          <p className="text-sm font-body text-muted-foreground">Track your production, stock, and financial summary</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Produced", value: totalPieces, icon: <Package size={18} /> },
            { label: "Total Sold", value: totalSold, icon: <TrendingUp size={18} /> },
            { label: "Remaining", value: totalRemaining, icon: <Package size={18} /> },
            { label: "Total Paid", value: `$${totalPaid.toLocaleString()}`, icon: <DollarSign size={18} /> },
            { label: "Balance Due", value: `$${totalBalance.toLocaleString()}`, icon: <DollarSign size={18} /> },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl border border-border p-4 shadow-card">
              <div className="p-2 rounded-xl bg-primary/10 text-primary mb-2 w-fit">{stat.icon}</div>
              <p className="font-display text-xl text-foreground">{stat.value}</p>
              <p className="text-[11px] font-body text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-card rounded-3xl border border-border p-4 md:p-6 shadow-card">
          <h2 className="font-display text-xl text-foreground mb-6">Pieces Inventory</h2>
          <div className="space-y-4">
            {pieces.map(piece => (
              <div key={piece.id} className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-body text-foreground font-medium">{piece.name}</p>
                    <p className="text-xs font-body text-muted-foreground mt-1">
                      Produced: {piece.totalStock} · Sold: <span className="text-green-600">{piece.sold}</span> · Remaining: <span className="text-primary">{piece.currentStock}</span>
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full ml-4 gap-1 font-body text-xs" onClick={() => handleDecrease(piece.id)} disabled={piece.currentStock === 0}>
                    <Minus size={14} /> Sell 1
                  </Button>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(piece.sold / piece.totalStock) * 100}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs font-body">
                  <div>
                    <p className="text-muted-foreground">Mfg Date</p>
                    <p className="text-foreground">{piece.manufacturingDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Paid</p>
                    <p className="text-green-600">${piece.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p className={piece.remainingAmount > 0 ? "text-destructive" : "text-green-600"}>${piece.remainingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryClientPortal;
