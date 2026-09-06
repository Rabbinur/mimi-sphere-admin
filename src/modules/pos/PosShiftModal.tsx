"use client";

import React from "react";
import {
  Banknote,
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  Package,
  Receipt,
  Smartphone,
  TrendingUp,
  X,
} from "lucide-react";
import { useGetPosShiftSummaryQuery } from "@/components/Redux/RTK/posApi";

interface PosShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PosShiftModal({ isOpen, onClose }: PosShiftModalProps) {
  const { data: shiftResponse, isLoading, refetch } = useGetPosShiftSummaryQuery(undefined, {
    skip: !isOpen,
  });

  if (!isOpen) return null;

  const data = (shiftResponse as any)?.data || shiftResponse || {
    date: new Date().toISOString().split("T")[0],
    total_orders: 0,
    total_sales: 0,
    cash_sales: 0,
    card_sales: 0,
    digital_sales: 0,
    total_discount: 0,
    total_items_sold: 0,
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92dvh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black">Daily POS Shift Summary</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Date: {data.date}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs font-bold">Calculating shift statistics...</span>
            </div>
          ) : (
            <>
              {/* Grand Total Highlight */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Total In-Store Sales (Today)
                  </span>
                  <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-0.5">
                    ৳{data.total_sales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">Cash in Drawer</span>
                  </div>
                  <p className="text-lg font-black font-mono text-slate-900">
                    ৳{data.cash_sales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold">Card Collections</span>
                  </div>
                  <p className="text-lg font-black font-mono text-slate-900">
                    ৳{data.card_sales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Smartphone className="w-4 h-4 text-pink-600" />
                    <span className="text-xs font-bold">bKash / Nagad</span>
                  </div>
                  <p className="text-lg font-black font-mono text-slate-900">
                    ৳{data.digital_sales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Receipt className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold">Completed Orders</span>
                  </div>
                  <p className="text-lg font-black font-mono text-slate-900">
                    {data.total_orders} orders
                  </p>
                </div>
              </div>

              {/* Quick stats footer */}
              <div className="p-3 bg-slate-100 rounded-xl text-xs font-medium text-slate-600 flex justify-between">
                <span>Items Sold: <strong>{data.total_items_sold} pcs</strong></span>
                <span>Discounts Given: <strong>৳{data.total_discount}</strong></span>
              </div>
            </>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Refresh Stats
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
