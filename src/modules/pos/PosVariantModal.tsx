"use client";

import React from "react";
import { PosProductItem } from "./types";
import { Check, Layers, Tag, X } from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface PosVariantModalProps {
  product: PosProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectVariant: (variantItem: any) => void;
}

export function PosVariantModal({
  product,
  isOpen,
  onClose,
  onSelectVariant,
}: PosVariantModalProps) {
  if (!isOpen || !product) return null;

  const variants = product.variants || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92dvh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black truncate max-w-[200px] sm:max-w-[320px]">
                {product.product_name}
              </h3>
              <p className="text-[11px] text-slate-400">Select option to add to cart</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Variants Grid / List */}
        <div className="p-4 sm:p-5 space-y-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {variants.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No variant options configured</p>
          ) : (
            variants.map((v) => {
              const img = getImageUrl(v.image || product.image);
              const isOut = v.stock_quantity <= 0;

              return (
                <div
                  key={v.variant_id}
                  onClick={() => {
                    if (!isOut) {
                      onSelectVariant({
                        product_id: product.product_id,
                        variant_id: v.variant_id,
                        product_name: product.product_name,
                        combination_label: v.combination_label,
                        sku: v.sku || product.sku,
                        barcode: v.barcode || v.sku || product.barcode,
                        price: v.price,
                        cost_price: v.cost_price,
                        stock_quantity: v.stock_quantity,
                        image: v.image || product.image,
                      });
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all select-none ${
                    isOut
                      ? "opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed"
                      : "bg-white hover:border-primary hover:bg-blue-50/40 border-slate-200 shadow-2xs cursor-pointer active:scale-99"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      {img ? (
                        <img src={img} alt={v.combination_label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {product.product_name.substring(0, 2)}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {v.combination_label}
                      </h4>
                      {v.sku && (
                        <span className="text-[10px] font-mono text-slate-400">{v.sku}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-sm font-black font-mono text-slate-900 block">
                      ৳{v.price.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                    </span>
                    <span
                      className={`text-[10px] font-bold block ${
                        v.stock_quantity > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {v.stock_quantity > 0 ? `${v.stock_quantity} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
