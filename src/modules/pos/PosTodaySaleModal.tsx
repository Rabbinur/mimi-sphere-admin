"use client";

import React from "react";
import { X } from "lucide-react";

interface PosTodaySaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData?: any;
}

export function PosTodaySaleModal({
  isOpen,
  onClose,
  shiftData,
}: PosTodaySaleModalProps) {
  if (!isOpen) return null;

  const totalSales = Number(shiftData?.total_sales || 0);
  const cashSales = Number(shiftData?.cash_sales || 0);
  const cardSales = Number(shiftData?.card_sales || 0);
  const digitalSales = Number(shiftData?.digital_sales || 0);

  const formatAmount = (num: number) => {
    return `৳${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const rows = [
    { label: "Total Sale Amount", bangla: "আজকের মোট বিক্রি", value: formatAmount(totalSales), bg: "bg-slate-50" },
    { label: "Cash Payment", bangla: "নগদ ক্যাশ গ্রহণ", value: formatAmount(cashSales), bg: "bg-white" },
    { label: "Credit Card Payment", bangla: "কার্ডে পেমেন্ট", value: formatAmount(cardSales), bg: "bg-slate-50" },
    { label: "Cheque Payment", bangla: "চেক পেমেন্ট", value: formatAmount(0), bg: "bg-white" },
    { label: "Deposit Payment", bangla: "অগ্রিম / ডিপোজিট", value: formatAmount(Number(shiftData?.deposit_payment || 0)), bg: "bg-slate-50" },
    { label: "Points Payment", bangla: "পয়েন্ট দিয়ে পরিশোধ", value: formatAmount(0), bg: "bg-white" },
    { label: "Gift Card Payment", bangla: "গিফট কার্ড", value: formatAmount(0), bg: "bg-slate-50" },
    { label: "Scan & Pay", bangla: "বিকাশ / নগদ / এমএফএস", value: formatAmount(digitalSales), bg: "bg-white" },
    { label: "Pay Later", bangla: "বাকি / পরে পরিশোধ", value: formatAmount(0), bg: "bg-slate-50" },
    { label: "Total Payment", bangla: "মোট সংগৃহীত টাকা", value: formatAmount(totalSales), bg: "bg-slate-100", isHighlight: true },
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
          className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                Today's Sale
              </h3>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                আজকের বিক্রি বিবরণী
              </span>
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

        {/* Rows Table */}
        <div className="p-5">
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200/80">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm ${row.bg} ${
                  row.isHighlight ? "font-bold text-slate-900 font-mono" : "text-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
                  <span className={row.isHighlight ? "font-bold text-slate-950" : "text-slate-800 font-semibold"}>
                    {row.label}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium font-sans">
                    ({row.bangla})
                  </span>
                </div>
                <span className={`font-mono shrink-0 ml-3 ${row.isHighlight ? "font-black text-slate-950 text-sm" : "font-semibold text-slate-800"}`}>
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
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
