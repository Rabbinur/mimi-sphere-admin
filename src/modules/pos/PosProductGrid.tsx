"use client";

import React, { useState } from "react";
import { PosProductItem } from "./types";
import {
  Barcode,
  Camera,
  Check,
  Layers,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface PosProductGridProps {
  products: PosProductItem[];
  cartItems?: any[];
  isLoading: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSelectProduct: (product: PosProductItem) => void;
  onOpenVariantModal: (product: PosProductItem) => void;
  onOpenCameraScanner: () => void;
  onBarcodeScan: (barcode: string) => void;
  onSearchChange: (search: string) => void;
  searchValue: string;
  categories: any[];
  selectedCategory: string | number | null;
  onSelectCategory: (catId: string | number | null) => void;
  onOpenOrdersModal?: () => void;
  onResetCart?: () => void;
  onOpenTransactionsModal?: () => void;
}

export function PosProductGrid({
  products,
  cartItems = [],
  isLoading,
  isFetchingMore,
  hasMore,
  onLoadMore,
  onSelectProduct,
  onOpenVariantModal,
  onOpenCameraScanner,
  onBarcodeScan,
  onSearchChange,
  searchValue,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenOrdersModal,
  onResetCart,
  onOpenTransactionsModal,
}: PosProductGridProps) {
  const [manualBarcodeInput, setManualBarcodeInput] = useState("");

  const cartProductIds = new Set((cartItems || []).map((i: any) => i.product_id));

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcodeInput.trim()) {
      onBarcodeScan(manualBarcodeInput.trim());
      setManualBarcodeInput("");
    }
  };

  const handleProductCardClick = (product: PosProductItem) => {
    if (product.has_variants && product.variants && product.variants.length > 0) {
      onOpenVariantModal(product);
    } else {
      onSelectProduct(product);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F6F9] border-r border-slate-200">
      {/* Top Controls: Dreams POS Action Bar (View Orders | Reset | Transaction) + Search */}
      <div className="p-2.5 sm:p-3 bg-white border-b border-slate-200/90 space-y-2.5 shrink-0 shadow-xs">
        {/* Quick Action Bar matching Dreams POS Image 1 */}
        <div className="flex items-center gap-2 pb-0.5">
          <button
            type="button"
            onClick={() => (onOpenOrdersModal ? onOpenOrdersModal() : null)}
            className="px-3.5 py-1.5 rounded-lg bg-[#009688] hover:bg-[#00897b] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            style={{ backgroundColor: "#009688", color: "#ffffff" }}
            title="View Recent POS Orders"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-white" />
            <span>View Orders</span>
          </button>
          <button
            type="button"
            onClick={() => (onResetCart ? onResetCart() : null)}
            className="px-3.5 py-1.5 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            style={{ backgroundColor: "#4f46e5", color: "#ffffff" }}
            title="Reset Cart & Start Fresh"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={() => (onOpenTransactionsModal ? onOpenTransactionsModal() : null)}
            className="px-3.5 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
            title="Recent Transactions & Payments"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            <span>Transaction</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Search Bar with embedded SCAN READY badge */}
          <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Scan barcode [USB/Bluetooth] or type name/SKU..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
            />
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-slate-200/80 rounded-md text-[10px] font-black text-slate-600 uppercase tracking-wider shrink-0 select-none">
              Scan Ready
            </div>
          </div>

          {/* Camera Scanner Action Button */}
          <button
            type="button"
            onClick={onOpenCameraScanner}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Open Camera Scanner"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Camera Scan</span>
          </button>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar text-xs font-bold select-none">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all text-xs cursor-pointer ${
              selectedCategory === null
                ? "bg-slate-900 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
            }`}
          >
            All Items
          </button>
          {categories.map((cat: any) => {
            const catId = cat._id || cat.id;
            const isSelected = selectedCategory === catId;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => onSelectCategory(catId)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all text-xs cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Touch Product Grid */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 custom-scrollbar">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-slate-200 animate-pulse space-y-2">
                <div className="w-full aspect-square bg-slate-100 rounded-xl" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Package className="w-8 h-8 text-slate-300 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No products found</h3>
            <p className="text-xs text-slate-400 mt-1">Try another search keyword or category filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3">
              {products.map((prod) => {
                const img = getImageUrl(prod.image);
                const isOutOfStock = prod.stock_quantity <= 0 && !prod.has_variants;
                const optionsCount = prod.variants_count || (prod.variants ? prod.variants.length : 0);

                const isInCart = cartProductIds.has(prod.product_id);

                return (
                  <div
                    key={prod.product_id}
                    onClick={() => !isOutOfStock && handleProductCardClick(prod)}
                    className={`group bg-white rounded-2xl border p-2.5 sm:p-3 flex flex-col transition-all duration-150 relative select-none ${
                      isInCart
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                        : isOutOfStock
                        ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                        : "border-slate-200/90 hover:border-slate-300 hover:shadow-md active:scale-[0.98] cursor-pointer"
                    }`}
                  >
                    {/* Centered product image in soft rounded container */}
                    <div className="relative w-full aspect-square bg-[#f8f9fa] rounded-xl flex items-center justify-center p-3 shrink-0 overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={prod.product_name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <Package className="w-7 h-7 text-slate-300" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            {prod.product_name.substring(0, 8)}
                          </span>
                        </div>
                      )}

                      {/* Active in cart checkmark badge — top right (Screenshot 1) */}
                      {isInCart && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs z-10">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Variant badge — top left */}
                      {prod.has_variants && optionsCount > 0 && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-600/90 backdrop-blur-xs text-white text-[8px] font-black rounded-md flex items-center gap-0.5 shadow-xs z-10">
                          <Zap className="w-2 h-2 fill-white" />
                          {optionsCount} OPT
                        </div>
                      )}

                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <span className="text-[9px] font-black text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200 shadow-xs">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info matching Screenshot 1 */}
                    <div className="flex flex-col flex-1 mt-2.5">
                      {/* Category name */}
                      <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate leading-none">
                        {prod.category_name || "General"}
                      </span>

                      {/* Product name */}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 mt-1 leading-snug group-hover:text-primary transition-colors">
                        {prod.product_name}
                      </h4>

                      {/* Bottom line: Stock in Pink + Price in Teal */}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/80">
                        <span className="text-[11px] sm:text-xs font-bold text-pink-500">
                          {prod.stock_quantity > 0 ? `${prod.stock_quantity} Pcs` : "0 Pcs"}
                        </span>

                        <span className="text-xs sm:text-sm font-black font-mono text-teal-600">
                          ৳{prod.price.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Trigger */}
            {hasMore && onLoadMore && (
              <div className="pt-2 pb-4 text-center">
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={isFetchingMore}
                  className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isFetchingMore ? "Loading more products..." : "Load More Products ↓"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
