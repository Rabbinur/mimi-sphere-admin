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
    Zap,
} from "lucide-react";
import Link from "next/link";
import { InventorySortDropdown } from "./_components/InventorySortDropdown";
import { QuantityInput } from "./_components/QuantityInput";
import { useInventoryTable } from "./_components/useInventoryTable";
import { BarcodeModal } from "./_components/BarcodeModal";
import { BulkStockModal } from "./_components/BulkStockModal";
import { BulkBarcodeModal } from "./_components/BulkBarcodeModal";
import { BarcodeSvg } from "./_components/BarcodeSvg";

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
        <div className="max-w-full mx-auto pb-10 pt-2 px-2 space-y-6">
            {/* Hidden File Input for CSV Import */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Header Information */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Box className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-[26px] font-black text-heading leading-tight">Stock Inventory & Barcodes</h1>
                        <p className="text-[13px] font-bold text-[#A0AEC0]">Manage product quantities, barcode stickers, bulk stock adjustments & CSV sync.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openBulkBarcodeModalForGroup}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-bold hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
                    >
                        <Barcode className="w-4 h-4 text-blue-400" /> Bulk Barcode Sheet
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#4A5568] hover:bg-[#F7FAFC] transition-all shadow-xs cursor-pointer"
                    >
                        <Upload className="w-4 h-4 text-blue-600" /> Import CSV
                    </button>
                    <button
                        onClick={handleExportCsv}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#4A5568] hover:bg-[#F7FAFC] transition-all shadow-xs cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-emerald-600" /> Export CSV
                    </button>
                    <Link
                        href="/products/import/history"
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-all shadow-sm"
                    >
                        <Zap className="w-4 h-4" /> Import Queue
                    </Link>
                </div>
            </div>

            {/* Quick Metrics Bar (Reflects total DB counts) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div
                    onClick={() => setStatusFilter("all")}
                    className={`p-5 rounded-2xl border shadow-xs flex items-center gap-4 transition-all cursor-pointer ${
                        statusFilter === "all" ? "bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20" : "bg-white border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                >
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-[#A0AEC0] uppercase tracking-wider">Total Variants</p>
                        <p className="text-2xl font-black text-heading mt-0.5">{counts.total}</p>
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter("low_stock")}
                    className={`p-5 rounded-2xl border shadow-xs flex items-center gap-4 transition-all cursor-pointer ${
                        statusFilter === "low_stock" ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/20" : "bg-white border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                >
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                        <RotateCcw className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-[#A0AEC0] uppercase tracking-wider">Low Stock (≤5)</p>
                        <p className="text-2xl font-black text-amber-600 mt-0.5">{counts.low_stock}</p>
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter("out_of_stock")}
                    className={`p-5 rounded-2xl border shadow-xs flex items-center gap-4 transition-all cursor-pointer ${
                        statusFilter === "out_of_stock" ? "bg-rose-50/60 border-rose-300 ring-2 ring-rose-500/20" : "bg-white border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                >
                    <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-[#A0AEC0] uppercase tracking-wider">Out of Stock</p>
                        <p className="text-2xl font-black text-rose-600 mt-0.5">{counts.out_of_stock}</p>
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter("in_stock")}
                    className={`p-5 rounded-2xl border shadow-xs flex items-center gap-4 transition-all cursor-pointer ${
                        statusFilter === "in_stock" ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20" : "bg-white border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                >
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-[#A0AEC0] uppercase tracking-wider">In Stock (&gt;5)</p>
                        <p className="text-2xl font-black text-emerald-600 mt-0.5">{counts.in_stock}</p>
                    </div>
                </div>
            </div>

            {/* Selection Action Toolbar (Appears when items checked) */}
            {selectedIds.length > 0 && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-black">
                            {selectedIds.length} Selected
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                            Perform batch operations on selected inventory variants
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={openBulkBarcodeModalForGroup}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                            <Barcode className="w-4 h-4 text-blue-400" /> Print Selected Barcodes
                        </button>
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                            <Layers className="w-4 h-4" /> Bulk Adjust Stock
                        </button>
                        <button
                            onClick={() => bulkUpdateStock("set", 0)}
                            className="px-4 py-2 bg-rose-600/30 border border-rose-500/50 text-rose-200 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                            Set Out of Stock
                        </button>
                    </div>
                </div>
            )}

            {/* Main Table Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
                {/* Status Filter Tabs & Action Bar */}
                <div className="p-4 border-b border-[#F1F5F9] flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 w-full lg:w-auto overflow-x-auto">
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                statusFilter === "all" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            All Variants
                        </button>
                        <button
                            onClick={() => setStatusFilter("low_stock")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                statusFilter === "low_stock" ? "bg-amber-600 text-white shadow-xs" : "text-amber-700 hover:bg-amber-50"
                            }`}
                        >
                            Low Stock (≤5)
                        </button>
                        <button
                            onClick={() => setStatusFilter("out_of_stock")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                statusFilter === "out_of_stock" ? "bg-rose-600 text-white shadow-xs" : "text-rose-700 hover:bg-rose-50"
                            }`}
                        >
                            Out of Stock
                        </button>
                        <button
                            onClick={() => setStatusFilter("in_stock")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                statusFilter === "in_stock" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                        >
                            In Stock (&gt;5)
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                        <div className="relative flex-1 lg:w-72">
                            <Search className="w-4 h-4 text-[#A0AEC0] absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search product, SKU, barcode..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-11 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-medium outline-none focus:border-primary transition-all placeholder:text-[#A0AEC0]"
                            />
                        </div>

                        <InventorySortDropdown
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortChange={handleSortChange}
                        />
                    </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                                <th className="py-4 px-6 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={variants.length > 0 && selectedIds.length === variants.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 accent-primary cursor-pointer rounded"
                                    />
                                </th>
                                <SortableHeader label="Product & Variant" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                                <th className="py-4 px-6 text-[12px] font-black text-[#718096] uppercase tracking-wider">SKU / Barcode</th>
                                <SortableHeader label="Available Stock" field="available_quantity" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                                <SortableHeader label="Total Sold" field="total_sale" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                                <th className="py-4 px-6 text-[12px] font-black text-[#718096] uppercase tracking-wider text-center">Stock Status</th>
                                <th className="py-4 px-6 text-[12px] font-black text-[#718096] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-6 h-16 bg-gray-50/50" />
                                    </tr>
                                ))
                            ) : variants.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                                <Box className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-[15px] font-bold text-heading">No inventory records found</p>
                                            <p className="text-[12px] text-[#A0AEC0]">Try adjusting your search or status filter criteria.</p>
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
                                            className={`hover:bg-[#F8FAFC] transition-colors group ${isSelected ? "bg-blue-50/40" : ""}`}
                                        >
                                            <td className="py-4 px-6 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOne(variant.id)}
                                                    className="w-4 h-4 accent-primary cursor-pointer rounded"
                                                />
                                            </td>

                                            {/* Variant Info */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3 max-w-[280px]">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-[#E2E8F0] overflow-hidden shrink-0 relative">
                                                        {imgUrl ? (
                                                            <img
                                                                src={imgUrl}
                                                                alt={variant.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#A0AEC0]">
                                                                {variant.product.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-bold text-heading truncate group-hover:text-primary transition-colors">
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
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    <p className="text-[12px] font-mono font-bold text-slate-700">
                                                        {variant.sku || "—"}
                                                    </p>
                                                    <button
                                                        onClick={() => openBulkBarcodeModalForSingle(variant)}
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-all cursor-pointer"
                                                        title="Print Barcode Labels (Set Copies & Sheet Layout)"
                                                    >
                                                        <Barcode className="w-3.5 h-3.5 text-blue-600" />
                                                        {barcodeVal}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Quantity (Edit-in-Place) */}
                                            <td className="py-4 px-6">
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
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center justify-center px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[13px] font-black text-[#4A5568]">
                                                    {variant.total_sale ?? 0}
                                                </span>
                                            </td>

                                            {/* Stock Status Badge */}
                                            <td className="py-4 px-6 text-center">
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
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openBulkBarcodeModalForSingle(variant)}
                                                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                                                        title="Print Barcode Labels (Select Copies & Layout)"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </button>
                                                    <Link
                                                        href={`/products/edit/${variant.product_id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-[12px] font-bold text-[#4A5568] hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                                                    >
                                                        Edit Product
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

                {/* Modern Pagination Component with Per Page Selector */}
                <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    onPageChange={(p) => setCurrentPage(p)}
                    from={from}
                    to={to}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPerPageChange={handlePerPageChange}
                    perPageOptions={[10, 25, 50, 100, 200]}
                />
            </div>

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
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-5 z-50 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-[14px] font-bold">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
