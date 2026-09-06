"use client";

import React, { useState } from "react";
import { PosProductItem } from "./types";
import {
  Barcode,
  Camera,
  Flame,
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
                    className={`group bg-white rounded-2xl border border-slate-200/90 p-2 flex flex-col justify-between transition-all duration-150 relative select-none ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed bg-slate-50"
                        : "hover:border-blue-500 hover:shadow-md active:scale-98 cursor-pointer"
                    }`}
                  >
                    {/* Top Image & Badges */}
                    <div className="relative w-full aspect-square rounded-xl bg-slate-50 overflow-hidden mb-1.5 shrink-0 border border-slate-100">
                      {img ? (
                        <img
                          src={img}
                          alt={prod.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 text-xs uppercase">
                          {prod.product_name.substring(0, 2)}
                        </div>
                      )}

                      {/* Top-Left Badge (Orange TOP) */}
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8.5px] font-black rounded flex items-center gap-0.5 shadow-xs uppercase">
                        <Flame className="w-2.5 h-2.5 fill-white" />
                        TOP
                      </span>

                      {/* Top-Right Badge (Green QTY) */}
                      <span
                        className={`absolute top-1 right-1 px-1.5 py-0.5 text-[8.5px] font-black rounded shadow-xs uppercase ${
                          prod.stock_quantity > 0
                            ? "bg-teal-700/90 text-white"
                            : "bg-rose-600/90 text-white"
                        }`}
                      >
                        QTY: {prod.stock_quantity || 0}
                      </span>
                    </div>

                    {/* Title & Information */}
                    <div className="space-y-1 min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[11.5px] font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {prod.product_name}
                        </h4>

                        {/* Optional Sub-tag / Category pill */}
                        {prod.combination_label && (
                          <div className="mt-1">
                            <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded">
                              {prod.combination_label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 pt-1">
                        {/* Options button if variants exist */}
                        {prod.has_variants && optionsCount > 0 && (
                          <div className="w-full py-1 px-1.5 bg-blue-600 text-white text-[9.5px] font-black rounded-lg flex items-center justify-center gap-1 shadow-xs">
                            <Zap className="w-2.5 h-2.5 fill-white" />
                            <span>{optionsCount} OPTIONS</span>
                          </div>
                        )}

                        {/* SKU pill */}
                        {prod.sku && (
                          <div className="text-[8.5px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded px-1 py-0.5 truncate text-center">
                            SKU: {prod.sku}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Price & Circular + Button */}
                    <div className="pt-2 mt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-[13px] font-black font-mono text-slate-950 truncate">
                        ৳{prod.price.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                      </span>

                      <button
                        type="button"
                        aria-label="Add to cart"
                        className="w-7 h-7 rounded-full bg-slate-950 hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-xs active:scale-90 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
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
