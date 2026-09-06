"use client";

import React, { useState, useEffect } from "react";
import { PosCartItem, PosReceiptData } from "./types";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Loader2,
  Phone,
  Smartphone,
  User,
  X,
} from "lucide-react";
import { useCreatePosOrderMutation } from "@/components/Redux/RTK/posApi";
import { toast } from "sonner";

interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: PosCartItem[];
  subtotal: number;
  globalDiscount: { type: "fixed" | "percent"; value: number; coupon_code?: string };
  taxAmount: number;
  grandTotal: number;
  onSuccess: (receiptData: PosReceiptData) => void;
}

export function PosCheckoutModal({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  globalDiscount,
  taxAmount,
  grandTotal,
  onSuccess,
}: PosCheckoutModalProps) {
  const [createPosOrder, { isLoading }] = useCreatePosOrderMutation();

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bkash" | "nagad">("cash");
  const [tenderedAmount, setTenderedAmount] = useState<string>(String(grandTotal));
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setTenderedAmount(String(grandTotal));
    }
  }, [isOpen, grandTotal]);

  if (!isOpen) return null;

  const tendered = parseFloat(tenderedAmount) || 0;
  const changeAmount = paymentMethod === "cash" ? Math.max(0, tendered - grandTotal) : 0;
  const isExactCashShort = paymentMethod === "cash" && tendered < grandTotal;

  const quickCashAmounts = [grandTotal, Math.ceil(grandTotal / 100) * 100, Math.ceil(grandTotal / 500) * 500, 1000, 2000, 5000].filter(
    (v, i, a) => v >= grandTotal && a.indexOf(v) === i
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (isExactCashShort) {
      toast.error(`Cash given (৳${tendered}) is less than total (৳${grandTotal})`);
      return;
    }

    const discountAmount =
      globalDiscount.type === "percent"
        ? (subtotal * (globalDiscount.value || 0)) / 100
        : Math.min(globalDiscount.value || 0, subtotal);

    const payload = {
      customer_name: customerName.trim() || "Walk-in Customer",
      customer_phone: customerPhone.trim() || undefined,
      customer_email: customerEmail.trim() || undefined,
      items: cartItems,
      subtotal,
      discount: discountAmount,
      coupon_code: globalDiscount.coupon_code || undefined,
      tax: taxAmount,
      total: grandTotal,
      payment_method: paymentMethod,
      tendered_amount: paymentMethod === "cash" ? tendered : grandTotal,
      change_amount: changeAmount,
      note: note.trim() || undefined,
    };

    try {
      const res = await createPosOrder(payload).unwrap();
      const receipt = res?.data || res;
      toast.success("POS Sale completed successfully!");
      onSuccess(receipt);
    } catch (err: any) {
      console.error("POS Checkout error:", err);
      toast.error(err?.data?.message || "Failed to process POS order");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92dvh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black tracking-wide">COMPLETE POS SALE</h3>
              <p className="text-[11px] text-emerald-400 font-bold">
                Total Payable: ৳{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-black border transition-all flex flex-col items-center gap-1 cursor-pointer select-none ${
                  paymentMethod === "cash"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-black border transition-all flex flex-col items-center gap-1 cursor-pointer select-none ${
                  paymentMethod === "card"
                    ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bkash")}
                className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-black border transition-all flex flex-col items-center gap-1 cursor-pointer select-none ${
                  paymentMethod === "bkash"
                    ? "bg-pink-50 border-pink-500 text-pink-700 ring-2 ring-pink-500/20 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Smartphone className="w-4 h-4 text-pink-600 shrink-0" />
                <span>bKash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("nagad")}
                className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-black border transition-all flex flex-col items-center gap-1 cursor-pointer select-none ${
                  paymentMethod === "nagad"
                    ? "bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Nagad</span>
              </button>
            </div>
          </div>

          {/* Cash Tendered & Change Due Calculator */}
          {paymentMethod === "cash" && (
            <div className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Cash Received (৳)</label>
                {quickCashAmounts.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {quickCashAmounts.slice(0, 4).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTenderedAmount(String(amt))}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 cursor-pointer active:scale-95 transition-all"
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg font-mono">৳</span>
                <input
                  type="number"
                  step="any"
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-lg font-black font-mono text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs"
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-500">Change Due to Customer:</span>
                <span className={`text-sm sm:text-base font-black font-mono ${changeAmount > 0 ? "text-emerald-600" : "text-slate-800"}`}>
                  ৳{changeAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Customer Details (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Customer Name (Optional)</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || isExactCashShort}
              className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer select-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">Confirm Sale (৳{grandTotal.toLocaleString("en-US")})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
