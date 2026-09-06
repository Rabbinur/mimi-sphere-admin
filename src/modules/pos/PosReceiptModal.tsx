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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-sm font-black">Sale Completed!</h3>
              <p className="text-[11px] text-emerald-100">Receipt #{receiptData.receipt_number}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Simulation View */}
        <div className="p-4 bg-slate-100 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300 font-mono text-[11px] text-slate-800 space-y-2.5 shadow-xs">
            <div className="text-center space-y-0.5">
              <h2 className="text-sm font-black text-slate-900">MIMI SPHERE</h2>
              <p className="text-[10px] text-slate-500">Official POS Sales Receipt</p>
              <p className="text-[9px] text-slate-400">Dhaka, Bangladesh</p>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-1.5 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Receipt:</span>
                <span className="font-bold">{receiptData.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{receiptData.created_at}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{receiptData.customer_name || "Walk-in"}</span>
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
                        <div className="font-bold truncate max-w-[150px]">{it.product_name}</div>
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
                <span>Subtotal:</span>
                <span>৳{receiptData.subtotal}</span>
              </div>
              {receiptData.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>-৳{receiptData.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-xs text-slate-900 border-t border-slate-300 pt-1">
                <span>TOTAL PAID:</span>
                <span>৳{receiptData.total}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Payment:</span>
                <span className="uppercase font-bold">{receiptData.payment_method}</span>
              </div>
              {receiptData.payment_method === "cash" && (
                <>
                  <div className="flex justify-between text-[10px]">
                    <span>Tendered:</span>
                    <span>৳{receiptData.tendered_amount}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                    <span>Change Due:</span>
                    <span>৳{receiptData.change_amount}</span>
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
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOpenFullInvoice(receiptData)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Full Invoice
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Thermal
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Start Next POS Sale
          </button>
        </div>
      </div>
    </div>
  );
}
