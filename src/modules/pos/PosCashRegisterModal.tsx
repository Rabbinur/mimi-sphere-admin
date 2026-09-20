"use client";

import React from "react";
import { X } from "lucide-react";

interface PosCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData?: any;
}

export function PosCashRegisterModal({
  isOpen,
  onClose,
  shiftData,
}: PosCashRegisterModalProps) {
  if (!isOpen) return null;

  const totalSales = Number(shiftData?.total_sales || 0);
  const cashSales = Number(shiftData?.cash_sales || 0);
  const cardSales = Number(shiftData?.card_sales || 0);
  const digitalSales = Number(shiftData?.digital_sales || 0);
  const totalPayment = Number(shiftData?.total_payment || (cashSales + cardSales + digitalSales));
  
  // Real cash in hand & totals from backend
  const cashInHand = Number(shiftData?.cash_in_hand ?? cashSales);
  const totalSaleReturn = Number(shiftData?.total_returns || 0);
  const totalExpense = Number(shiftData?.total_expense || 0);
  const totalCash = cashInHand;

  const formatAmount = (num: number) => {
    return `৳${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const rows = [
    { label: "Cash in Hand", value: formatAmount(cashInHand), bg: "bg-slate-50" },
    { label: "Total Sale Amount", value: formatAmount(totalSales), bg: "bg-white" },
    { label: "Total Payment", value: formatAmount(totalPayment), bg: "bg-slate-50" },
    { label: "Cash Payment", value: formatAmount(cashSales), bg: "bg-white" },
    { label: "Total Sale Return", value: formatAmount(totalSaleReturn), bg: "bg-slate-50" },
    { label: "Total Expense", value: formatAmount(totalExpense), bg: "bg-white" },
    { label: "Total Cash", value: formatAmount(totalCash), bg: "bg-slate-200/80", isHighlight: true },
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
          className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
            <h3 className="text-base font-bold text-slate-800">
              Cash Register Details
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

        {/* Rows Table */}
        <div className="p-5">
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200/80">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-4 py-3 text-xs sm:text-sm ${row.bg} ${
                  row.isHighlight ? "font-bold text-slate-900 font-mono" : "text-slate-700"
                }`}
              >
                <span className={row.isHighlight ? "font-bold text-slate-900" : "text-slate-600 font-medium"}>
                  {row.label}
                </span>
                <span className={`font-mono ${row.isHighlight ? "font-black text-slate-950 text-sm" : "font-semibold text-slate-800"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#ff9f43] hover:bg-[#f39c12] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
