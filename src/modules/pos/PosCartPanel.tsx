"use client";

import React, { useState } from "react";
import { PosCartItem } from "./types";
import {
  CreditCard,
  Minus,
  Percent,
  Plus,
  Receipt,
  ShoppingCart,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface PosCartPanelProps {
  cartItems: PosCartItem[];
  onUpdateQuantity: (itemKey: string, quantity: number) => void;
  onRemoveItem: (itemKey: string) => void;
  onClearCart: () => void;
  subtotal: number;
  grandTotal: number;
  totalItemCount: number;
  globalDiscount: { type: "fixed" | "percent"; value: number; coupon_code?: string };
  onSetGlobalDiscount: (discount: { type: "fixed" | "percent"; value: number; coupon_code?: string }) => void;
  onOpenCheckout: () => void;
}

export function PosCartPanel({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  grandTotal,
  totalItemCount,
  globalDiscount,
  onSetGlobalDiscount,
  onOpenCheckout,
}: PosCartPanelProps) {
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountVal, setDiscountVal] = useState<string>(globalDiscount.value ? String(globalDiscount.value) : "");
  const [discountType, setDiscountType] = useState<"fixed" | "percent">(globalDiscount.type || "fixed");
  const [couponCode, setCouponCode] = useState<string>(globalDiscount.coupon_code || "");

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(discountVal) || 0;
    onSetGlobalDiscount({
      type: discountType,
      value: val,
      coupon_code: couponCode.trim(),
    });
    setIsDiscountOpen(false);
  };

  const discountAmount =
    globalDiscount.type === "percent"
      ? (subtotal * (globalDiscount.value || 0)) / 100
      : Math.min(globalDiscount.value || 0, subtotal);

  return (
    <div className="w-full lg:w-96 xl:w-104 bg-white h-full flex flex-col justify-between border-l border-slate-200 select-none shadow-xs">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Current Order</h3>
            <span className="text-[11px] font-bold text-slate-500">
              {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingCart className="w-6 h-6 text-slate-300 stroke-1" />
            </div>
            <p className="text-xs font-bold text-slate-600">Cart is empty</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
              Tap products or scan barcodes to begin sale
            </p>
          </div>
        ) : (
          cartItems.map((item) => {
            const itemKey = item.variant_id || item.product_id;
            const img = getImageUrl(item.image);

            return (
              <div
                key={itemKey}
                className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 flex items-center gap-2.5 transition-all group"
              >
                {/* Thumbnail */}
                <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                  {img ? (
                    <img src={img} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {item.product_name.substring(0, 2)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{item.product_name}</h4>
                  {item.combination_label && (
                    <span className="inline-block text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                      {item.combination_label}
                    </span>
                  )}
                  <p className="text-[11px] font-mono font-bold text-slate-500">
                    ৳{item.price} × {item.quantity} = <span className="text-slate-900 font-extrabold">৳{item.total}</span>
                  </p>
                </div>

                {/* Stepper (+ / -) */}
                <div className="flex items-center gap-1 shrink-0 bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove item button */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(itemKey)}
                  className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                  title="Remove from cart"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Footer: Discount, Subtotal, Grand Total & Checkout */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/80 space-y-3 shrink-0">
        {/* Quick Discount Toggle Bar */}
        {isDiscountOpen ? (
          <form onSubmit={handleApplyDiscount} className="p-2.5 bg-white border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Apply Discount / Coupon</span>
              <button
                type="button"
                onClick={() => setIsDiscountOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={`px-2 py-1 text-[10px] font-bold rounded ${
                    discountType === "fixed" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  ৳ Flat
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("percent")}
                  className={`px-2 py-1 text-[10px] font-bold rounded ${
                    discountType === "percent" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  % Off
                </button>
              </div>

              <input
                type="number"
                step="any"
                placeholder="Discount value"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Coupon code (optional)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-none uppercase font-mono font-bold"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsDiscountOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50/80 px-2.5 py-1 rounded-lg hover:bg-blue-100/80 transition-colors"
            >
              <Tag className="w-3 h-3" />
              {globalDiscount.value > 0
                ? `Discount: ${globalDiscount.type === "percent" ? `${globalDiscount.value}%` : `৳${globalDiscount.value}`}`
                : "+ Add Discount / Coupon"}
            </button>

            {globalDiscount.value > 0 && (
              <button
                type="button"
                onClick={() => onSetGlobalDiscount({ type: "fixed", value: 0, coupon_code: "" })}
                className="text-[10px] font-bold text-rose-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span className="font-mono font-bold text-slate-900">৳{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between font-bold text-emerald-600">
              <span>Discount</span>
              <span className="font-mono">-৳{discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Payable</span>
            <span className="font-mono text-primary text-lg">
              ৳{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          disabled={cartItems.length === 0}
          onClick={onOpenCheckout}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-black transition-all shadow-md active:scale-99 flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay Now (F9) →</span>
        </button>
      </div>
    </div>
  );
}
