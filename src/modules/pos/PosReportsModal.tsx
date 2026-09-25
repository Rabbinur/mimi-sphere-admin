"use client";

import React from "react";
import { X, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";

interface PosReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData?: any;
}

export function PosReportsModal({
  isOpen,
  onClose,
  shiftData,
}: PosReportsModalProps) {
  if (!isOpen) return null;

  const totalSales = Number(shiftData?.total_sales || 0);
  const totalProfit = Number(shiftData?.total_profit || 0);
  const totalOrders = Number(shiftData?.total_orders || 0);

  const formatAmount = (num: number) => {
    return `৳${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const rows = [
    { label: "Today's Total Sales", bangla: "আজকের মোট বিক্রি", value: formatAmount(totalSales), bg: "bg-slate-50", isHighlight: true, color: "text-emerald-700" },
    { label: "Today's Net Profit", bangla: "আজকের নিট লাভ", value: formatAmount(totalProfit), bg: "bg-white", isHighlight: true, color: "text-indigo-700" },
    { label: "Total Orders Count", bangla: "মোট অর্ডার সংখ্যা", value: totalOrders.toString(), bg: "bg-slate-50", isHighlight: false, color: "text-slate-800" },
  ];

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6"
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
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-800">
                Quick Reports
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Card 1: Total Sale */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Today's Sales</span>
                <span className="text-[9px] text-slate-500 mb-1.5">(আজকের বিক্রি)</span>
                <span className="text-sm sm:text-base font-black text-emerald-600 font-mono">{formatAmount(totalSales)}</span>
              </div>
              
              {/* Card 2: Total Orders */}
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Total Orders</span>
                <span className="text-[9px] text-slate-500 mb-1.5">(মোট অর্ডার)</span>
                <span className="text-sm sm:text-base font-black text-rose-600 font-mono">{totalOrders}</span>
              </div>

              {/* Card 3: Total Profit */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Net Profit</span>
                <span className="text-[9px] text-slate-500 mb-1.5">(আজকের লাভ)</span>
                <span className="text-sm sm:text-base font-black text-blue-600 font-mono">{formatAmount(totalProfit)}</span>
              </div>
            </div>

            {/* Detailed Breakdown List */}
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 mb-6 bg-white max-h-[300px] overflow-y-auto custom-scrollbar">
              {[
                { label: "Product Revenue", value: shiftData?.product_revenue || totalSales },
                { label: "Product Cost", value: shiftData?.product_cost || 0 },
                { label: "Expense", value: shiftData?.expense || 0 },
                { label: "Total Stock Adjustment", value: shiftData?.stock_adjustment || 0 },
                { label: "Deposit Payment", value: shiftData?.deposit_payment || 0 },
                { label: "Total Purchase Shipping Cost", value: shiftData?.purchase_shipping || 0 },
                { label: "Total Sell Discount", value: shiftData?.total_discount || 0 },
                { label: "Total Sell Return", value: shiftData?.total_return || 0 },
                { label: "Closing Stock", value: shiftData?.closing_stock || 0 },
                { label: "Total Sales", value: shiftData?.total_sales || totalSales },
                { label: "Total Sale Return", value: shiftData?.total_sale_return || 0 },
                { label: "Total Expense", value: shiftData?.total_expense || 0 },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between px-4 py-2.5 text-[11px] sm:text-xs ${idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"}`}>
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatAmount(Number(item.value))}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/reports/profit-loss"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                onClick={onClose}
              >
                <span>See Full Details (Profit & Loss)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/reports/sales"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                onClick={onClose}
              >
                <span>See Full Details (Sales)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
