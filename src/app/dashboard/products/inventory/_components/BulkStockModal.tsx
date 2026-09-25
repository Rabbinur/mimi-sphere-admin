"use client";

import React, { useState } from "react";
import { X, Layers, Plus, Minus, Check, Loader2 } from "lucide-react";

interface BulkStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (action: "set" | "add" | "subtract", quantity: number) => Promise<void>;
}

export function BulkStockModal({ isOpen, onClose, selectedCount, onConfirm }: BulkStockModalProps) {
  const [action, setAction] = useState<"add" | "subtract" | "set">("add");
  const [quantity, setQuantity] = useState<string>("10");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum < 0) return;

    setIsSubmitting(true);
    try {
      await onConfirm(action, qtyNum);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Bulk Stock Adjustment</h3>
              <p className="text-[11px] font-semibold text-slate-400">
                Updating {selectedCount} selected product variant{selectedCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Adjustment Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAction("add")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  action === "add"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-500/20"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAction("subtract")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  action === "subtract"
                    ? "bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-500/20"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                Reduce
              </button>
              <button
                type="button"
                onClick={() => setAction("set")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  action === "set"
                    ? "bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Set Fixed
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Quantity Amount</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-600 transition-all"
              required
            />
            <p className="text-[11px] font-medium text-slate-400">
              {action === "add"
                ? `Will add +${quantity || 0} units to all ${selectedCount} selected items.`
                : action === "subtract"
                ? `Will subtract -${quantity || 0} units from all ${selectedCount} selected items.`
                : `Will overwrite available stock to exactly ${quantity || 0} units for all ${selectedCount} items.`}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Apply to {selectedCount} Items
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
