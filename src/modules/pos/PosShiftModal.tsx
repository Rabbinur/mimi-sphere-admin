"use client";

import React from "react";
import {
  Banknote,
  CreditCard,
  FileSpreadsheet,
  Loader2,
  Smartphone,
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

  const totalSales = Number(data.total_sales || 0);
  const totalOrders = Number(data.total_orders || 0);
  const cashSales = Number(data.cash_sales || 0);
  const cardSales = Number(data.card_sales || 0);
  const digitalSales = Number(data.digital_sales || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92dvh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 pb-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Cashier Shift & Sales Report
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Daily POS counter sales summary
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 pt-2 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
              <span className="text-xs font-bold">Calculating shift statistics...</span>
            </div>
          ) : (
            <>
              {/* Dark Hero Card */}
              <div className="bg-[#181938] rounded-2xl p-5 text-white shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Today's POS Sales
                  </span>
                  <p className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                    ৳{totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">
                    Total Orders
                  </span>
                  <p className="text-lg font-black text-white">
                    {totalOrders} {totalOrders === 1 ? "Completed" : "Completed"}
                  </p>
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block px-1">
                  Payment Method Breakdown
                </span>

                {/* Cash Row */}
                <div className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">Cash Payments</span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                    ৳{cashSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Card Row */}
                <div className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">Card Payments</span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                    ৳{cardSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* bKash / MFS Row */}
                <div className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-100/70 text-pink-600 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">bKash / MFS</span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                    ৳{digitalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Footer Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[#181938] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
