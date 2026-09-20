"use client";

import React from "react";
import { X } from "lucide-react";

interface PosTodayProfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData?: any;
}

export function PosTodayProfitModal({
  isOpen,
  onClose,
  shiftData,
}: PosTodayProfitModalProps) {
  if (!isOpen) return null;

  const totalSales = Number(shiftData?.total_sales || 0);
  const totalDiscount = Number(shiftData?.total_discount || 0);
  const productCost = Number(shiftData?.product_cost ?? (Math.round(totalSales * 0.7 * 100) / 100));
  const expense = Number(shiftData?.total_expense || 0);
  const totalProfit = Number(shiftData?.net_profit ?? Math.max(0, totalSales - productCost - expense));
  const closingStock = Number(shiftData?.closing_stock || 0);

  const formatAmount = (num: number) => {
    return `৳${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const rows = [
    { label: "Product Revenue", value: formatAmount(totalSales), bg: "bg-slate-50" },
    { label: "Product Cost", value: formatAmount(productCost), bg: "bg-white" },
    { label: "Expense", value: formatAmount(expense), bg: "bg-slate-50" },
    { label: "Total Stock Adjustment", value: formatAmount(0), bg: "bg-white" },
    { label: "Deposit Payment", value: formatAmount(0), bg: "bg-slate-50" },
    { label: "Total Purchase Shipping Cost", value: formatAmount(0), bg: "bg-white" },
    { label: "Total Sell Discount", value: formatAmount(totalDiscount), bg: "bg-slate-50" },
    { label: "Total Sell Return", value: formatAmount(0), bg: "bg-white" },
    { label: "Closing Stock", value: formatAmount(closingStock), bg: "bg-slate-50" },
  ];

  return (
    <div 
      className="fixed top-16 inset-x-0 bottom-0 z-[90] bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4">
        <div 
          className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
            <h3 className="text-base font-bold text-slate-800">
              Today's Profit
            </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Top 3 Stat Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Total Sale - Green */}
            <div className="p-3.5 rounded-xl border-2 border-emerald-400/80 bg-emerald-50/40 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-600">Total Sale</span>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-600 mt-1 truncate">
                ৳{Math.round(totalSales).toLocaleString("en-US")}
              </span>
            </div>

            {/* Expense - Red */}
            <div className="p-3.5 rounded-xl border-2 border-rose-400/80 bg-rose-50/40 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-600">Expense</span>
              <span className="text-base sm:text-lg font-black font-mono text-rose-500 mt-1 truncate">
                ৳{Math.round(expense).toLocaleString("en-US")}
              </span>
            </div>

            {/* Total Profit - Blue */}
            <div className="p-3.5 rounded-xl border-2 border-blue-400/80 bg-blue-50/40 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-600">Total Profit</span>
              <span className="text-base sm:text-lg font-black font-mono text-blue-600 mt-1 truncate">
                ৳{Math.round(totalProfit).toLocaleString("en-US")}
              </span>
            </div>
          </div>

          {/* Rows Breakdown Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200/80">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-4 py-2 text-xs sm:text-sm ${row.bg} text-slate-700`}
              >
                <span className="text-slate-600 font-medium">
                  {row.label}
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#ff9f43] hover:bg-[#f39c12] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
