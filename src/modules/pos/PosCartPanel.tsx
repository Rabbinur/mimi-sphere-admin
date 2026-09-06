"use client";

import React, { useState } from "react";
import { PosCartItem } from "./types";
import {
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
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
    <div className="w-full lg:w-80 xl:w-92 2xl:w-96 bg-white h-full flex flex-col justify-between border-l border-slate-200 select-none shadow-xs">
      {/* Panel Header */}
      <div className="p-3 sm:p-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
              Current Order Cart
            </h3>
            <span className="text-[10.5px] font-bold text-slate-500">
              {totalItemCount} {totalItemCount === 1 ? "item selected" : "items selected"}
            </span>
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5 custom-scrollbar bg-slate-50/50">
        {cartItems.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-slate-300 stroke-1" />
            </div>
            <p className="text-xs font-bold text-slate-700">Cart is empty</p>
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
                className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col gap-2 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      {img ? (
                        <img src={img} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {item.product_name.substring(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Title & Variant */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                        {item.product_name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {item.combination_label && (
                          <span className="text-[9.5px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                            {item.combination_label}
                          </span>
                        )}
                        {item.sku && (
                          <span className="text-[9px] font-mono text-slate-400">
                            {item.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and Quantity row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs font-mono font-bold text-slate-700">
                    ৳{item.price.toLocaleString("en-US", { minimumFractionDigits: 0 })} × {item.quantity}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Stepper (+ / -) */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-600 transition-colors cursor-pointer active:scale-95"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black font-mono text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-600 transition-colors cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove icon */}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(itemKey)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Footer: Discount, Subtotal, Grand Total & Checkout */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white space-y-2.5 shrink-0 shadow-sm">
        {/* Quick Discount Toggle Bar */}
        {isDiscountOpen ? (
          <form onSubmit={handleApplyDiscount} className="p-2.5 bg-slate-50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Apply Discount / Coupon</span>
              <button
                type="button"
                onClick={() => setIsDiscountOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={`px-2 py-1 text-[10px] font-bold rounded ${
                    discountType === "fixed" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500"
                  }`}
                >
                  ৳ Flat
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("percent")}
                  className={`px-2 py-1 text-[10px] font-bold rounded ${
                    discountType === "percent" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500"
                  }`}
                >
                  % Off
                </button>
              </div>

              <input
                type="number"
                step="any"
                placeholder="Discount"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-600 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Coupon code (optional)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-none uppercase font-mono font-bold bg-white"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
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
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50/80 px-2.5 py-1 rounded-lg hover:bg-blue-100/80 transition-colors cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>
                {globalDiscount.value > 0
                  ? `Discount: ${globalDiscount.type === "percent" ? `${globalDiscount.value}%` : `৳${globalDiscount.value}`}`
                  : "+ Add Discount / Coupon"}
              </span>
            </button>

            {globalDiscount.value > 0 && (
              <button
                type="button"
                onClick={() => onSetGlobalDiscount({ type: "fixed", value: 0, coupon_code: "" })}
                className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-0.5">
          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span className="font-mono font-bold text-slate-900">৳{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between font-bold text-emerald-600">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Discount
            </span>
            <span className="font-mono">
              -৳{discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
            <span>Grand Total</span>
            <span className="font-mono text-slate-950 text-xl font-black">
              ৳{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          disabled={cartItems.length === 0}
          onClick={onOpenCheckout}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-black transition-all shadow-md active:scale-99 flex items-center justify-center gap-2 cursor-pointer shadow-emerald-600/20"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay / Checkout (F9) →</span>
        </button>
      </div>
    </div>
  );
}
