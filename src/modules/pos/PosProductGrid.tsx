"use client";

import React, { useState } from "react";
import { PosProductItem } from "./types";
import {
  Barcode,
  Camera,
  Layers,
  Package,
  Search,
  SlidersHorizontal,
  Tag,
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 border-r border-slate-200">
      {/* Top Controls: Search Bar & Barcode Scanner Input */}
      <div className="p-3 bg-white border-b border-slate-200 space-y-2.5 shrink-0">
        <div className="flex items-center gap-2">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, SKU, variant..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-primary focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Barcode Fast Scan Input */}
          <form onSubmit={handleBarcodeSubmit} className="relative w-40 sm:w-56 hidden sm:block">
            <Barcode className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan Barcode ↵"
              value={manualBarcodeInput}
              onChange={(e) => setManualBarcodeInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-blue-50/60 border border-blue-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-blue-900 outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-blue-400"
            />
          </form>

          {/* Camera Scanner Trigger (Mobile/Tablet button) */}
          <button
            type="button"
            onClick={onOpenCameraScanner}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
            title="Open Camera Barcode Scanner"
          >
            <Camera className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs font-bold select-none">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === null
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Items
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat._id || cat.id}
              type="button"
              onClick={() => onSelectCategory(cat._id || cat.id)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === (cat._id || cat.id)
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Touch Grid Container */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 pb-28 lg:pb-6 custom-scrollbar">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-slate-200 animate-pulse space-y-2">
                <div className="w-full h-24 sm:h-28 bg-slate-100 rounded-xl" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <Package className="w-12 h-12 mb-3 stroke-1 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No products found</h3>
            <p className="text-xs text-slate-400 mt-1">Try another search keyword or category filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
              {products.map((prod) => {
                const img = getImageUrl(prod.image);
                const isOutOfStock = prod.stock_quantity <= 0 && !prod.has_variants;

                return (
                  <div
                    key={prod.product_id}
                    onClick={() => !isOutOfStock && handleProductCardClick(prod)}
                    className={`group bg-white rounded-2xl border border-slate-200/80 p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-150 relative select-none ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed bg-slate-50"
                        : "hover:border-primary hover:shadow-md active:scale-98 cursor-pointer"
                    }`}
                  >
                    {/* Top Image & Badges */}
                    <div className="relative w-full h-24 sm:h-32 rounded-xl bg-slate-50 overflow-hidden mb-1.5 sm:mb-2 shrink-0 border border-slate-100">
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

                      {/* Variant Badge */}
                      {prod.has_variants && (
                        <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1.5 sm:px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold rounded-md flex items-center gap-1 shadow-xs">
                          <Layers className="w-2.5 h-2.5 text-blue-400" />
                          <span>{prod.variants_count || "Variants"}</span>
                        </span>
                      )}

                      {/* Stock Badge */}
                      <span
                        className={`absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black rounded-md shadow-xs ${
                          prod.stock_quantity > 5
                            ? "bg-emerald-600/90 text-white"
                            : prod.stock_quantity > 0
                            ? "bg-amber-500/90 text-white"
                            : "bg-rose-600/90 text-white"
                        }`}
                      >
                        {prod.stock_quantity > 0 ? `${prod.stock_quantity} left` : "Out of stock"}
                      </span>
                    </div>

                    {/* Title & SKU */}
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs sm:text-[13px] font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {prod.product_name}
                      </h4>
                      {prod.sku && (
                        <p className="text-[9px] sm:text-[10px] font-mono font-semibold text-slate-400 truncate">
                          {prod.sku}
                        </p>
                      )}
                    </div>

                    {/* Price & Action Button */}
                    <div className="pt-1.5 sm:pt-2 mt-1 border-t border-slate-100 flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm font-black font-mono text-slate-900 truncate">
                        ৳{prod.price.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                      </span>

                      <button
                        type="button"
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-600 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all shrink-0"
                      >
                        {prod.has_variants ? "Options" : "+ Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Pagination Trigger */}
            {hasMore && onLoadMore && (
              <div className="pt-2 pb-6 text-center">
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={isFetchingMore}
                  className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
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
