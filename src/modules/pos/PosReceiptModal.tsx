"use client";

import React from "react";
import { PosReceiptData } from "./types";
import {
  CheckCircle,
  FileText,
  PlusCircle,
  Printer,
  Sparkles,
  X,
} from "lucide-react";

interface PosReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: PosReceiptData | null;
  onOpenFullInvoice: (data: PosReceiptData) => void;
  onOpenThermalReceipt?: (data: PosReceiptData) => void;
}

export function PosReceiptModal({
  isOpen,
  onClose,
  receiptData,
  onOpenFullInvoice,
  onOpenThermalReceipt,
}: PosReceiptModalProps) {
  if (!isOpen || !receiptData) return null;

  const handleThermalPrint = () => {
    if (onOpenThermalReceipt) {
      onOpenThermalReceipt(receiptData);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-0 sm:my-auto max-h-[92dvh] sm:max-h-[88dvh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-emerald-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700/60 flex items-center justify-center text-white shrink-0 shadow-xs">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black tracking-wide">POS SALE COMPLETED</h3>
              <p className="text-[10.5px] text-emerald-100 font-mono">Receipt #{receiptData.receipt_number}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Simulation View (Scrollable area) */}
        <div className="p-3 sm:p-4 bg-slate-50/70 overflow-y-auto flex-1 custom-scrollbar">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-dashed border-slate-300 font-mono text-[11px] text-slate-800 space-y-2.5 shadow-sm">
            
            {/* Store Brand Header */}
            <div className="text-center space-y-0.5">
              <h2 className="text-sm font-black text-slate-900 tracking-wider">MIMI SPHERE</h2>
              <p className="text-[10px] text-slate-500 font-medium">POS Thermal Sales Receipt</p>
              <p className="text-[9px] text-slate-400">Dhaka, Bangladesh</p>
            </div>

            {/* Receipt Meta */}
            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[10px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold font-mono">{receiptData.receipt_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Date & Time:</span>
                <span>{receiptData.created_at}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold">{receiptData.customer_name || "Walk-in Customer"}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-t border-dashed border-slate-300 pt-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] text-slate-400 uppercase border-b border-slate-200">
                    <th className="py-1">Item Description</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receiptData.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 pr-1.5 align-top">
                        <div className="font-bold text-slate-900 leading-tight">{it.product_name}</div>
                        {it.combination_label && (
                          <div className="text-[9.5px] text-slate-500 font-sans mt-0.5">Var: {it.combination_label}</div>
                        )}
                        {it.sku && (
                          <div className="text-[8.5px] text-slate-400 font-mono">SKU: {it.sku}</div>
                        )}
                      </td>
                      <td className="py-1.5 text-center font-bold text-slate-700 align-top">{it.quantity}</td>
                      <td className="py-1.5 text-right font-bold text-slate-900 align-top whitespace-nowrap">
                        ৳{it.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Calculations */}
            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Subtotal:</span>
                <span>৳{receiptData.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>

              {receiptData.discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>-৳{receiptData.discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-black text-xs text-blue-700 border-t border-slate-300 pt-1.5 mt-1">
                <span>TOTAL PAID:</span>
                <span className="text-sm">৳{receiptData.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                <span>Payment Method:</span>
                <span className="uppercase font-bold text-slate-800">{receiptData.payment_method}</span>
              </div>

              {receiptData.payment_method === "cash" && (
                <>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Cash Received:</span>
                    <span>৳{receiptData.tendered_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600">
                    <span>Change Due:</span>
                    <span>৳{receiptData.change_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Note */}
            <div className="border-t border-dashed border-slate-300 pt-2 text-center text-[9.5px] text-slate-400 space-y-0.5">
              <div className="font-bold text-slate-600">Thank You For Shopping With Us!</div>
              <div>Please keep this receipt for any exchange.</div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Sticky at bottom) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOpenFullInvoice(receiptData)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Full Invoice</span>
            </button>

            <button
              type="button"
              onClick={handleThermalPrint}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Thermal</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Start Next POS Sale</span>
          </button>
        </div>
      </div>
    </div>
  );
}
