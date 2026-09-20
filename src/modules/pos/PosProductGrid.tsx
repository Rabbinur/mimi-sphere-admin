"use client";

import React, { useState } from "react";
import { PosProductItem } from "./types";
import {
  Barcode,
  Camera,
  Layers,
  Package,
  Plus,
  Search,
  Zap,
} from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface PosProductGridProps {
  products: PosProductItem[];
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
}

export function PosProductGrid({
  products,
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
}: PosProductGridProps) {
  const [manualBarcodeInput, setManualBarcodeInput] = useState("");

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
      {/* Top Controls: Search Bar & Scanner Status */}
      <div className="p-2.5 sm:p-3 bg-white border-b border-slate-200/90 space-y-2 shrink-0 shadow-xs">
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

                return (
                  <div
                    key={prod.product_id}
                    onClick={() => !isOutOfStock && handleProductCardClick(prod)}
                    className={`group bg-white rounded-2xl border overflow-hidden flex flex-col transition-all duration-150 relative select-none ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                        : "border-slate-200/90 hover:border-blue-500 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                    }`}
                  >
                    {/* Full-bleed image */}
                    <div className="relative w-full aspect-square bg-slate-100 shrink-0 overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={prod.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <Package className="w-6 h-6 text-slate-300" />
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wide">
                            {prod.product_name.substring(0, 8)}
                          </span>
                        </div>
                      )}

                      {/* Variant badge — top left */}
                      {prod.has_variants && optionsCount > 0 && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-blue-600/90 backdrop-blur-sm text-white text-[8px] font-black rounded-md flex items-center gap-0.5 shadow">
                          <Zap className="w-2 h-2 fill-white" />
                          {optionsCount} OPT
                        </div>
                      )}

                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="text-[9px] font-black text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200 shadow-xs">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info & Action */}
                    <div className="p-2 flex flex-col gap-1.5 flex-1">
                      {/* Product name */}
                      <h4 className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {prod.product_name}
                      </h4>

                      {/* Variant label or SKU */}
                      {(prod.combination_label || prod.sku) && (
                        <span className="text-[8.5px] font-mono text-slate-400 truncate">
                          {prod.combination_label || `SKU: ${prod.sku}`}
                        </span>
                      )}

                      {/* Bottom: Price + stock pill + add button */}
                      <div className="flex items-center justify-between mt-auto pt-1 border-t border-slate-100">
                        {/* Left: price */}
                        <span className="text-[13px] font-black font-mono text-slate-950 leading-none">
                          ৳{prod.price.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Stock pill */}
                          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8.5px] font-bold ${
                            prod.stock_quantity > 10
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : prod.stock_quantity > 0
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-600 border border-rose-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              prod.stock_quantity > 10 ? "bg-emerald-500" : prod.stock_quantity > 0 ? "bg-amber-500" : "bg-rose-500"
                            }`} />
                            {prod.stock_quantity > 0 ? prod.stock_quantity : "0"}
                          </span>

                          {/* Add button */}
                          <button
                            type="button"
                            aria-label="Add to cart"
                            className="w-6 h-6 rounded-full bg-slate-900 hover:bg-blue-600 text-white flex items-center justify-center transition-all active:scale-90 shrink-0 cursor-pointer shadow-sm"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
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
