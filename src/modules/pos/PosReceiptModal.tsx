"use client";

import React from "react";
import { PosReceiptData } from "./types";
import {
  CheckCircle,
  FileText,
  PlusCircle,
  Printer,
  ShoppingBag,
  X,
} from "lucide-react";

interface PosReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: PosReceiptData | null;
  onOpenFullInvoice: (data: PosReceiptData) => void;
}

export function PosReceiptModal({
  isOpen,
  onClose,
  receiptData,
  onOpenFullInvoice,
}: PosReceiptModalProps) {
  if (!isOpen || !receiptData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-0 sm:my-auto max-h-[94dvh] sm:max-h-[90dvh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-emerald-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700/60 flex items-center justify-center text-white shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black tracking-wide">SALE COMPLETED!</h3>
              <p className="text-[11px] text-emerald-100 font-mono">Receipt #{receiptData.receipt_number}</p>
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

        {/* 80mm Thermal Receipt Simulation View */}
        <div className="p-3 sm:p-4 bg-slate-100 overflow-y-auto max-h-[50vh] sm:max-h-[55vh] custom-scrollbar">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-dashed border-slate-300 font-mono text-[11px] text-slate-800 space-y-2.5 shadow-xs">
            <div className="text-center space-y-0.5">
              <h2 className="text-sm font-black text-slate-900 tracking-wide">MIMI SPHERE</h2>
              <p className="text-[10px] text-slate-500 font-medium">POS Sales Thermal Receipt</p>
              <p className="text-[9px] text-slate-400">Dhaka, Bangladesh</p>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-1.5 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold">{receiptData.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span>{receiptData.created_at}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold">{receiptData.customer_name || "Walk-in"}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-1.5">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receiptData.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1">
                        <div className="font-bold truncate max-w-[140px] sm:max-w-[170px]">{it.product_name}</div>
                        {it.combination_label && (
                          <div className="text-[9px] text-slate-400">{it.combination_label}</div>
                        )}
                      </td>
                      <td className="py-1 text-center font-bold">{it.quantity}</td>
                      <td className="py-1 text-right font-bold">৳{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-1.5 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span>৳{receiptData.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              {receiptData.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>-৳{receiptData.discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-xs text-slate-900 border-t border-slate-300 pt-1">
                <span>TOTAL PAID:</span>
                <span>৳{receiptData.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Payment Method:</span>
                <span className="uppercase font-bold">{receiptData.payment_method}</span>
              </div>
              {receiptData.payment_method === "cash" && (
                <>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Tendered:</span>
                    <span>৳{receiptData.tendered_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                    <span>Change Due:</span>
                    <span>৳{receiptData.change_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-dashed border-slate-300 pt-2 text-center text-[10px] text-slate-400">
              Thank You For Shopping With Us!
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOpenFullInvoice(receiptData)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              Full Invoice
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Thermal
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Start Next POS Sale
          </button>
        </div>
      </div>
    </div>
  );
}
