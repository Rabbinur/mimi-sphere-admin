"use client";

import React, { useRef, useState } from "react";
import Pagination from "@/components/Common/Pagination";
import { getImageUrl } from "@/lib/api";
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Barcode,
    Box,
    CheckCircle2,
    Download,
    Layers,
    Package,
    Printer,
    RotateCcw,
    Search,
    TrendingUp,
    Upload,
    X,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { InventorySortDropdown } from "./_components/InventorySortDropdown";
import { QuantityInput } from "./_components/QuantityInput";
import { useInventoryTable } from "./_components/useInventoryTable";
import { BarcodeModal } from "./_components/BarcodeModal";
import { BulkStockModal } from "./_components/BulkStockModal";
import { BulkBarcodeModal } from "./_components/BulkBarcodeModal";

function SortableHeader({
    label, field, sortBy, sortOrder, onSort, className = ""
}: {
    label: string;
    field: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSort: (f: string) => void;
    className?: string;
}) {
    const active = sortBy === field;
    return (
        <th
            onClick={() => onSort(field)}
            className={`py-4 px-6 text-[12px] font-black uppercase tracking-wider cursor-pointer select-none group transition-colors
                ${active ? "text-primary bg-primary/5" : "text-[#718096] hover:text-primary hover:bg-[#F1F5F9]"} ${className}`}
        >
            <div className="flex items-center gap-2">
                {label}
                <span className={`transition-all ${active ? "opacity-100 text-primary" : "opacity-20 group-hover:opacity-60"}`}>
                    {active ? (
                        sortOrder === "asc"
                            ? <ArrowUp className="w-3.5 h-3.5" />
                            : <ArrowDown className="w-3.5 h-3.5" />
                    ) : (
                        <ArrowUpDown className="w-3.5 h-3.5" />
                    )}
                </span>
            </div>
        </th>
    );
}

export default function InventoryPage() {
    const {
        currentPage,
        setCurrentPage,
        searchInput,
        setSearchInput,
        sortBy,
        sortOrder,
        statusFilter,
        setStatusFilter,
        selectedIds,
        updatingIds,
        toast,
        loading,
        variants,
        lastPage,
        totalItems,
        counts,
        from,
        to,
        handleSortChange,
        toggleSort,
        updateStock,
        bulkUpdateStock,
        handleExportCsv,
        handleImportCsv,
        toggleSelectAll,
        toggleSelectOne,
        perPage,
        handlePerPageChange,
        refetch,
    } = useInventoryTable();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [barcodeModalVariant, setBarcodeModalVariant] = useState<any>(null);
    const [singleBarcodeVariant, setSingleBarcodeVariant] = useState<any>(null);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isBulkBarcodeModalOpen, setIsBulkBarcodeModalOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImportCsv(file);
            e.target.value = "";
        }
    };

    const openBulkBarcodeModalForSingle = (variant: any) => {
        setSingleBarcodeVariant(variant);
        setIsBulkBarcodeModalOpen(true);
    };

    const openBulkBarcodeModalForGroup = () => {
        setSingleBarcodeVariant(null);
        setIsBulkBarcodeModalOpen(true);
    };

    return (
        <div className="max-w-full mx-auto pb-24 sm:pb-12 pt-1 sm:pt-4 px-2 sm:px-4 space-y-3 sm:space-y-6">
            {/* Hidden File Input for CSV Import */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Header Information */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                        <Box className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">Stock Inventory</h1>
                            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200/80">
                                {counts.total} items
                            </span>
                        </div>
                        <p className="text-[11px] sm:text-[13px] font-medium text-slate-500 line-clamp-1">
                            Live inventory quantities, barcode stickers & stock adjustments
                        </p>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                    <button
                        onClick={openBulkBarcodeModalForGroup}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2.5 bg-slate-900 text-white rounded-xl text-xs sm:text-[13px] font-bold hover:bg-slate-800 transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
                    >
                        <Barcode className="w-3.5 h-3.5 text-blue-400" />
                        <span>Bulk Barcodes</span>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-[13px] font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
                    >
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Import</span>
                    </button>

                    <button
                        onClick={handleExportCsv}
                        className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-[13px] font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
                    >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Export</span>
                    </button>

                    <Link
                        href="/dashboard/products/import/history"
                        className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-[13px] font-bold hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap active:scale-95"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Queue</span>
                    </Link>
                </div>
            </div>

            {/* Desktop Metrics Cards (Hidden on Mobile) */}
            <div className="hidden md:grid md:grid-cols-4 gap-4">
                <div
                    onClick={() => setStatusFilter("all")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                        statusFilter === "all"
                            ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50 shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Variants</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2">{counts.total}</p>
                </div>

                <div
                    onClick={() => setStatusFilter("low_stock")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                        statusFilter === "low_stock"
                            ? "bg-amber-50/70 border-amber-400 ring-2 ring-amber-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50 shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Low Stock (≤5)</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <RotateCcw className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-amber-600 mt-2">{counts.low_stock}</p>
                </div>

                <div
                    onClick={() => setStatusFilter("out_of_stock")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                        statusFilter === "out_of_stock"
                            ? "bg-rose-50/70 border-rose-400 ring-2 ring-rose-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50 shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Out of Stock</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-rose-600 mt-2">{counts.out_of_stock}</p>
                </div>

                <div
                    onClick={() => setStatusFilter("in_stock")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                        statusFilter === "in_stock"
                            ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50 shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">In Stock (&gt;5)</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 mt-2">{counts.in_stock}</p>
                </div>
            </div>

            {/* Ultra-Clean Mobile Horizontal Filter Pills (< md) */}
            <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        statusFilter === "all"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                    <span>All</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${statusFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {counts.total}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter("low_stock")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        statusFilter === "low_stock"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-amber-700 hover:bg-amber-50/50"
                    }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Low Stock</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${statusFilter === "low_stock" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700 border border-amber-200/50"}`}>
                        {counts.low_stock}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter("out_of_stock")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        statusFilter === "out_of_stock"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-rose-700 hover:bg-rose-50/50"
                    }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>Out of Stock</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${statusFilter === "out_of_stock" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-700 border border-rose-200/50"}`}>
                        {counts.out_of_stock}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter("in_stock")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        statusFilter === "in_stock"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50/50"
                    }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>In Stock</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${statusFilter === "in_stock" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200/50"}`}>
                        {counts.in_stock}
                    </span>
                </button>
            </div>

            {/* Desktop Batch Toolbar (Hidden on Mobile) */}
            {selectedIds.length > 0 && (
                <div className="hidden md:flex p-3.5 bg-slate-900 text-white rounded-2xl items-center justify-between gap-3 shadow-xl animate-in fade-in slide-in-from-top-2 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 bg-blue-600 text-white rounded-xl text-xs font-black shrink-0">
                            {selectedIds.length} Selected
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                            Batch actions
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={openBulkBarcodeModalForGroup}
                            className="px-3.5 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                            <Barcode className="w-3.5 h-3.5 text-blue-400" />
                            <span>Print Barcodes</span>
                        </button>
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Bulk Stock</span>
                        </button>
                        <button
                            onClick={() => bulkUpdateStock("set", 0)}
                            className="px-3.5 py-2 bg-rose-600/30 border border-rose-500/50 text-rose-200 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                        >
                            Set Out of Stock
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
                {/* Search Bar & Mobile Controls */}
                <div className="p-2.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-50/50">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search product, SKU, barcode..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 shadow-2xs"
                        />
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                        {/* Select All on Mobile */}
                        <div className="md:hidden flex items-center">
                            <label className="flex items-center gap-1.5 px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer select-none shadow-2xs">
                                <input
                                    type="checkbox"
                                    checked={variants.length > 0 && selectedIds.length === variants.length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 accent-primary cursor-pointer rounded"
                                />
                                <span>Select All</span>
                            </label>
                        </div>

                        <InventorySortDropdown
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortChange={handleSortChange}
                        />
                    </div>
                </div>

                {/* Desktop & Laptop Wide Data Table (hidden on mobile < md) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200">
                                <th className="py-3.5 px-4 lg:px-6 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={variants.length > 0 && selectedIds.length === variants.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 accent-primary cursor-pointer rounded"
                                    />
                                </th>
                                <SortableHeader label="Product & Variant" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="px-4 lg:px-6" />
                                <th className="py-3.5 px-4 lg:px-6 text-[12px] font-black text-slate-500 uppercase tracking-wider">SKU / Barcode</th>
                                <SortableHeader label="Available Stock" field="available_quantity" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="px-4 lg:px-6" />
                                <SortableHeader label="Total Sold" field="total_sale" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="px-4 lg:px-6" />
                                <th className="py-3.5 px-4 lg:px-6 text-[12px] font-black text-slate-500 uppercase tracking-wider text-center">Stock Status</th>
                                <th className="py-3.5 px-4 lg:px-6 text-[12px] font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-6 h-16 bg-slate-50/40" />
                                    </tr>
                                ))
                            ) : variants.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                                <Box className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-[15px] font-bold text-slate-800">No inventory records found</p>
                                            <p className="text-[12px] text-slate-400">Try adjusting your search or status filter criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                variants.map((variant) => {
                                    const isSelected = selectedIds.includes(variant.id);
                                    const isUpdating = updatingIds.includes(variant.id);
                                    const imgUrl = getImageUrl(variant.product_image);
                                    const barcodeVal = variant.barcode || variant.sku || `BAR-${String(variant.id).padStart(6, "0")}`;

                                    return (
                                        <tr
                                            key={variant.id}
                                            className={`hover:bg-slate-50/80 transition-colors group ${isSelected ? "bg-blue-50/40" : ""}`}
                                        >
                                            <td className="py-3.5 px-4 lg:px-6 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOne(variant.id)}
                                                    className="w-4 h-4 accent-primary cursor-pointer rounded"
                                                />
                                            </td>

                                            {/* Variant Info */}
                                            <td className="py-3.5 px-4 lg:px-6">
                                                <div className="flex items-center gap-3 max-w-[280px]">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                                                        {imgUrl ? (
                                                            <img
                                                                src={imgUrl}
                                                                alt={variant.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                                                {variant.product.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                                                            {variant.product.name}
                                                        </p>
                                                        {variant.combination_label && (
                                                            <span className="inline-block mt-0.5 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                                                {variant.combination_label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* SKU & Printable Barcode */}
                                            <td className="py-3.5 px-4 lg:px-6">
                                                <div className="space-y-1">
                                                    <p className="text-[12px] font-mono font-bold text-slate-700">
                                                        {variant.sku || "—"}
                                                    </p>
                                                    <button
                                                        onClick={() => openBulkBarcodeModalForSingle(variant)}
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-all cursor-pointer"
                                                        title="Print Barcode Labels"
                                                    >
                                                        <Barcode className="w-3.5 h-3.5 text-blue-600" />
                                                        {barcodeVal}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Quantity (Edit-in-Place) */}
                                            <td className="py-3.5 px-4 lg:px-6">
                                                {isUpdating ? (
                                                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                        Updating...
                                                    </div>
                                                ) : (
                                                    <QuantityInput
                                                        value={variant.available_quantity}
                                                        onUpdate={(newVal) => updateStock(variant.id, newVal)}
                                                    />
                                                )}
                                            </td>

                                            {/* Total Sales */}
                                            <td className="py-3.5 px-4 lg:px-6">
                                                <span className="inline-flex items-center justify-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-black text-slate-700 font-mono">
                                                    {variant.total_sale ?? 0}
                                                </span>
                                            </td>

                                            {/* Stock Status Badge */}
                                            <td className="py-3.5 px-4 lg:px-6 text-center">
                                                {variant.available_quantity > 5 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        In Stock
                                                    </span>
                                                ) : variant.available_quantity > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Low Stock ({variant.available_quantity})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 lg:px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openBulkBarcodeModalForSingle(variant)}
                                                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer shadow-2xs"
                                                        title="Print Barcode Labels"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </button>
                                                    <Link
                                                        href={`/dashboard/products/edit/${variant.product_id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-700 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all shadow-2xs"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modern App-Style Mobile Cards (< md) */}
                <div className="md:hidden divide-y divide-slate-100 p-2 space-y-2.5">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-3.5 bg-white rounded-2xl border border-slate-100 space-y-3 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="w-11 h-11 min-w-[44px] max-w-[44px] h-[44px] bg-slate-200 rounded-xl shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : variants.length === 0 ? (
                        <div className="py-12 text-center space-y-2">
                            <Box className="w-10 h-10 text-slate-300 mx-auto" />
                            <p className="text-sm font-bold text-slate-800">No inventory records found</p>
                            <p className="text-xs text-slate-400">Try changing search or filter</p>
                        </div>
                    ) : (
                        variants.map((variant) => {
                            const isSelected = selectedIds.includes(variant.id);
                            const isUpdating = updatingIds.includes(variant.id);
                            const imgUrl = getImageUrl(variant.product_image);
                            const barcodeVal = variant.barcode || variant.sku || `BAR-${String(variant.id).padStart(6, "0")}`;

                            return (
                                <div
                                    key={variant.id}
                                    className={`p-3 rounded-2xl border transition-all space-y-2.5 ${
                                        isSelected
                                            ? "bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20 shadow-sm"
                                            : "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
                                    }`}
                                >
                                    {/* Card Header: Checkbox + Big Image + Title + Status Pill */}
                                    <div className="flex items-start gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelectOne(variant.id)}
                                            className="w-4 h-4 mt-1 accent-primary cursor-pointer rounded shrink-0"
                                        />

                                        <div className="w-11 h-11 min-w-[44px] max-w-[44px] h-[44px] max-h-[44px] rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 relative shadow-2xs">
                                            {imgUrl ? (
                                                <img
                                                    src={imgUrl}
                                                    alt={variant.product.name}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400">
                                                    {variant.product.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[13px] font-black text-slate-900 leading-tight line-clamp-2">
                                                {variant.product.name}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                {variant.combination_label && (
                                                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200/70 px-1.5 py-0.5 rounded-md">
                                                        {variant.combination_label}
                                                    </span>
                                                )}

                                                {variant.available_quantity > 5 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        In Stock
                                                    </span>
                                                ) : variant.available_quantity > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Low ({variant.available_quantity})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Metadata Strip: SKU / Barcode & Sold count */}
                                    <div className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-[10px] font-bold text-slate-400">Barcode:</span>
                                            <button
                                                onClick={() => openBulkBarcodeModalForSingle(variant)}
                                                className="inline-flex items-center gap-1 font-mono font-bold text-blue-600 hover:text-blue-800 text-[11px] truncate"
                                                title="Print barcode stickers"
                                            >
                                                <Barcode className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{barcodeVal}</span>
                                            </button>
                                        </div>

                                        <div className="text-[11px] text-slate-500 font-bold shrink-0">
                                            Sold: <span className="font-mono font-black text-slate-800">{variant.total_sale ?? 0}</span>
                                        </div>
                                    </div>

                                    {/* Card Bottom: Stock Stepper & Quick Actions */}
                                    <div className="flex items-center justify-between pt-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-black uppercase text-slate-400">Stock:</span>
                                            {isUpdating ? (
                                                <span className="text-xs font-bold text-blue-600 animate-pulse">Saving...</span>
                                            ) : (
                                                <QuantityInput
                                                    value={variant.available_quantity}
                                                    onUpdate={(newVal) => updateStock(variant.id, newVal)}
                                                    showStepper={true}
                                                />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => openBulkBarcodeModalForSingle(variant)}
                                                className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 hover:bg-blue-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
                                                title="Print Barcode Labels"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                            </button>
                                            <Link
                                                href={`/dashboard/products/edit/${variant.product_id}`}
                                                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-xs"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Modern Pagination */}
                <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    onPageChange={(p: number) => setCurrentPage(p)}
                    from={from}
                    to={to}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPerPageChange={handlePerPageChange}
                    perPageOptions={[10, 25, 50, 100, 200]}
                />
            </div>

            {/* Mobile Floating Sticky Batch Action Bar */}
            {selectedIds.length > 0 && (
                <div className="md:hidden fixed bottom-4 left-3 right-3 z-40 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-lg text-xs font-black">
                            {selectedIds.length}
                        </span>
                        <button
                            onClick={toggleSelectAll}
                            className="text-[11px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                        >
                            Deselect
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={openBulkBarcodeModalForGroup}
                            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95"
                        >
                            <Barcode className="w-3.5 h-3.5 text-blue-400" />
                            <span>Stickers</span>
                        </button>
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="px-2.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Stock</span>
                        </button>
                        <button
                            onClick={() => bulkUpdateStock("set", 0)}
                            className="px-2 py-1.5 bg-rose-600/40 border border-rose-500/50 text-rose-200 rounded-xl text-xs font-bold active:scale-95"
                        >
                            0
                        </button>
                    </div>
                </div>
            )}

            {/* Single Barcode Sticker Modal */}
            <BarcodeModal
                isOpen={!!barcodeModalVariant}
                onClose={() => setBarcodeModalVariant(null)}
                variant={barcodeModalVariant}
            />

            {/* Bulk / Single Barcode Printing & Multiple Quantities Modal */}
            <BulkBarcodeModal
                isOpen={isBulkBarcodeModalOpen}
                onClose={() => {
                    setIsBulkBarcodeModalOpen(false);
                    setSingleBarcodeVariant(null);
                }}
                variants={variants}
                selectedIds={selectedIds}
                targetVariants={singleBarcodeVariant ? [singleBarcodeVariant] : undefined}
            />

            {/* Bulk Stock Adjustment Modal */}
            <BulkStockModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                selectedCount={selectedIds.length}
                onConfirm={async (action, qty) => {
                    await bulkUpdateStock(action, qty);
                }}
            />

            {/* Toast Notification Overlay */}
            {toast && (
                <div className={`fixed bottom-16 sm:bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-5 z-50 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-xs sm:text-[14px] font-bold">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
