"use client";

import React, { useState, useRef } from "react";
import { X, Printer, Barcode, Plus, Minus, Layers, Check, Copy, SlidersHorizontal, Sparkles, LayoutList } from "lucide-react";
import { BarcodeSvg } from "./BarcodeSvg";
import { Variant } from "./types";

interface BulkBarcodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    variants: Variant[];
    selectedIds?: number[];
    targetVariants?: Variant[];
}

export function BulkBarcodeModal({ isOpen, onClose, variants, selectedIds = [], targetVariants: customTargetVariants }: BulkBarcodeModalProps) {
    // Filter variants: if customTargetVariants provided, use it; otherwise fallback to selectedIds or page variants
    const targetVariants = (customTargetVariants && customTargetVariants.length > 0)
        ? customTargetVariants
        : (selectedIds.length > 0 ? variants.filter((v) => selectedIds.includes(v.id)) : variants);

    // State mapping variant id -> copy count
    const [countsMap, setCountsMap] = useState<Record<number, number>>({});

    const [columns, setColumns] = useState<number>(3); // 2, 3, or 4 columns per sheet row
    const [labelFormat, setLabelFormat] = useState<"only_barcode" | "variant_tag" | "full_title">("only_barcode");

    const printAreaRef = useRef<HTMLDivElement>(null);

    // Sync countsMap with targetVariants whenever modal opens or targetVariants update
    React.useEffect(() => {
        if (isOpen && targetVariants.length > 0) {
            setCountsMap((prev) => {
                const updated: Record<number, number> = {};
                targetVariants.forEach((v) => {
                    updated[v.id] = prev[v.id] !== undefined ? prev[v.id] : 1;
                });
                return updated;
            });
        }
    }, [isOpen, targetVariants]);

    if (!isOpen || targetVariants.length === 0) return null;

    const setAllCopies = (count: number) => {
        const updated: Record<number, number> = {};
        targetVariants.forEach((v) => {
            updated[v.id] = Math.max(1, count);
        });
        setCountsMap(updated);
    };

    const setAllToStock = () => {
        const updated: Record<number, number> = {};
        targetVariants.forEach((v) => {
            updated[v.id] = Math.max(1, v.available_quantity || 1);
        });
        setCountsMap(updated);
    };

    const updateCount = (id: number, val: number) => {
        setCountsMap((prev) => ({
            ...prev,
            [id]: Math.max(0, val),
        }));
    };

    // Calculate total labels across all variants
    const totalLabelsCount = targetVariants.reduce((acc, v) => acc + (countsMap[v.id] ?? 1), 0);

    const handlePrintSheet = () => {
        const printContent = printAreaRef.current?.innerHTML;
        if (!printContent) return;

        const win = window.open("", "_blank");
        if (!win) return;

        win.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Bulk Barcode Stickers Sheet (${totalLabelsCount} Labels)</title>
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 8mm;
                        }
                        * { box-sizing: border-box; }
                        body {
                            font-family: system-ui, -apple-system, sans-serif;
                            margin: 0;
                            padding: 0;
                            background: #fff;
                            color: #000;
                        }
                        .variant-group {
                            page-break-inside: auto;
                            break-inside: auto;
                            margin-bottom: 20px;
                        }
                        .variant-header {
                            page-break-after: avoid;
                            break-after: avoid;
                            border: 1px solid #cbd5e1;
                            background: #f8fafc;
                            padding: 8px 12px;
                            border-radius: 8px;
                            margin-bottom: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        }
                        .sheet-grid {
                            display: grid;
                            grid-template-columns: repeat(${columns}, 1fr);
                            gap: 5mm;
                            width: 100%;
                        }
                        .sticker-card {
                            border: 1px solid #cbd5e1;
                            border-radius: 8px;
                            padding: 8px;
                            text-align: center;
                            background: #fff;
                            page-break-inside: avoid;
                            break-inside: avoid;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 85px;
                        }
                        .sticker-title {
                            font-size: 10px;
                            font-weight: 800;
                            margin-bottom: 2px;
                            line-height: 1.2;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                        .sticker-variant {
                            font-size: 9px;
                            font-weight: 700;
                            color: #1e40af;
                            margin-bottom: 4px;
                        }
                        .sticker-barcode-box {
                            width: 100%;
                            display: flex;
                            justify-content: center;
                            margin: 4px 0;
                            padding: 4px 12px;
                            background: #ffffff;
                        }
                        .sticker-barcode-box svg {
                            max-width: 100%;
                            height: auto;
                        }
                        @media print {
                            body { margin: 0; }
                            .sheet-grid { gap: 4mm; }
                            .sticker-card { border: 1px solid #cbd5e1; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${printContent}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => window.close(), 600);
                        }
                    </script>
                </body>
            </html>
        `);
        win.document.close();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-2xs">
                            <Barcode className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-800">Bulk Barcode Label Generator</h2>
                            <p className="text-xs font-semibold text-slate-500">
                                Configure variant label quantities & print sheet layout on a single page
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Main Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-100/50">
                    {/* Left Column: Variant Quantity Controls & Presets (5 Cols) */}
                    <div className="lg:col-span-5 border-r border-slate-200 bg-white p-5 flex flex-col h-full overflow-hidden">
                        {/* Quick Presets Toolbar */}
                        <div className="space-y-3 pb-4 border-b border-slate-100">
                            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quantity Quick Presets
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setAllCopies(1)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all text-left cursor-pointer"
                                >
                                    1 Copy Each
                                </button>
                                <button
                                    onClick={() => setAllCopies(5)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all text-left cursor-pointer"
                                >
                                    5 Copies Each
                                </button>
                                <button
                                    onClick={() => setAllCopies(10)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all text-left cursor-pointer"
                                >
                                    10 Copies Each
                                </button>
                                <button
                                    onClick={setAllToStock}
                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-black transition-all text-left cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                    ⚡ Max Stock Qty (All)
                                </button>
                            </div>
                        </div>

                        {/* Layout Options */}
                        <div className="py-4 border-b border-slate-100 space-y-4">
                            <div>
                                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" /> Sheet Columns
                                </label>
                                <div className="flex items-center gap-2">
                                    {[2, 3, 4].map((col) => (
                                        <button
                                            key={col}
                                            onClick={() => setColumns(col)}
                                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                columns === col
                                                    ? "bg-slate-900 text-white shadow-xs"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {col} Columns
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                                    <LayoutList className="w-3.5 h-3.5 text-indigo-500" /> Sticker Content Format
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    <button
                                        onClick={() => setLabelFormat("only_barcode")}
                                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                                            labelFormat === "only_barcode"
                                                ? "bg-blue-600 text-white shadow-xs"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        Only Barcode
                                    </button>
                                    <button
                                        onClick={() => setLabelFormat("variant_tag")}
                                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                                            labelFormat === "variant_tag"
                                                ? "bg-blue-600 text-white shadow-xs"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        + Variant Tag
                                    </button>
                                    <button
                                        onClick={() => setLabelFormat("full_title")}
                                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                                            labelFormat === "full_title"
                                                ? "bg-blue-600 text-white shadow-xs"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        + Full Title
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Variant List with Quantity Inputs */}
                        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                Target Variants ({targetVariants.length})
                            </p>
                            {targetVariants.map((v) => {
                                const barcodeValue = v.barcode || v.sku || `BAR-${String(v.id).padStart(6, "0")}`;
                                const count = countsMap[v.id] ?? 1;

                                return (
                                    <div
                                        key={v.id}
                                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800 truncate">{v.product.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                {v.combination_label && (
                                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[9px] font-bold">
                                                        {v.combination_label}
                                                    </span>
                                                )}
                                                <span className="font-mono text-[10px] font-semibold text-slate-500 truncate">
                                                    {barcodeValue}
                                                </span>
                                                <span className="text-[9.5px] font-bold text-slate-400">
                                                    (Stock: {v.available_quantity})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {/* Quick MAX button for this variant */}
                                            <button
                                                onClick={() => updateCount(v.id, v.available_quantity || 1)}
                                                title={`Set to available stock (${v.available_quantity})`}
                                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black border border-amber-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
                                            >
                                                MAX
                                            </button>

                                            {/* Quantity Stepper Input */}
                                            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                                                <button
                                                    onClick={() => updateCount(v.id, count - 1)}
                                                    className="w-6 h-6 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={500}
                                                    value={count}
                                                    onChange={(e) => updateCount(v.id, parseInt(e.target.value) || 0)}
                                                    className="w-10 text-center text-xs font-black text-slate-800 outline-none"
                                                />
                                                <button
                                                    onClick={() => updateCount(v.id, count + 1)}
                                                    className="w-6 h-6 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Live Sheet Print Preview (7 Cols) */}
                    <div className="lg:col-span-7 p-6 flex flex-col h-full overflow-hidden bg-slate-200/60">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">Print Sheet Live Preview</h3>
                                <p className="text-[11px] font-bold text-slate-500">
                                    Total Labels: <span className="text-blue-600 font-black">{totalLabelsCount} Stickers</span>
                                </p>
                            </div>

                            <button
                                onClick={handlePrintSheet}
                                disabled={totalLabelsCount === 0}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer"
                            >
                                <Printer className="w-4 h-4" /> Print Sticker Sheet
                            </button>
                        </div>

                        {/* Scrollable Printable Page Container */}
                        <div className="flex-1 bg-white border border-slate-300 rounded-2xl p-6 shadow-inner overflow-y-auto">
                            <div ref={printAreaRef} className="space-y-6">
                                {targetVariants.map((v) => {
                                    const copies = countsMap[v.id] ?? 1;
                                    if (copies <= 0) return null;
                                    const barcodeValue = v.barcode || v.sku || `BAR-${String(v.id).padStart(6, "0")}`;

                                    return (
                                        <div key={v.id} className="variant-group space-y-3">
                                            {/* Section Header Banner for this variant */}
                                            <div className="variant-header p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-left">
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-800 leading-snug">{v.product.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {v.combination_label && (
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                                                                {v.combination_label}
                                                            </span>
                                                        )}
                                                        <span className="font-mono text-[10px] font-bold text-slate-500">
                                                            SKU/Barcode: {barcodeValue}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black shrink-0">
                                                    {copies} {copies === 1 ? 'Sticker' : 'Stickers'}
                                                </span>
                                            </div>

                                            {/* Grid of Physical Product Barcode Stickers (Only Barcode by default) */}
                                            <div
                                                className={`sheet-grid grid gap-3 ${
                                                    columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4"
                                                }`}
                                            >
                                                {Array.from({ length: copies }).map((_, idx) => (
                                                    <div
                                                        key={`${v.id}-${idx}`}
                                                        className="sticker-card p-3 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center shadow-2xs hover:border-blue-500 transition-all flex flex-col items-center justify-center min-h-[90px]"
                                                    >
                                                        {labelFormat === "full_title" && (
                                                            <div className="mb-1">
                                                                <div className="sticker-title text-[10px] font-black text-slate-800 line-clamp-2 leading-tight">
                                                                    {v.product.name}
                                                                </div>
                                                                {v.combination_label && (
                                                                    <div className="sticker-variant text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                                                        {v.combination_label}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {labelFormat === "variant_tag" && (
                                                            <div className="text-[9.5px] font-extrabold text-slate-700 truncate max-w-full px-1 mb-1">
                                                                {v.combination_label || v.product.name}
                                                            </div>
                                                        )}

                                                        {/* Pure Barcode Lines & Code String (100% Barcode Width Auto-Fit with Natural Font Ratio) */}
                                                        <div className="sticker-barcode-box py-1 w-full flex items-center justify-center overflow-hidden">
                                                            <BarcodeSvg value={barcodeValue} height={50} width={1.8} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalLabelsCount === 0 && (
                                <div className="py-20 text-center text-slate-400">
                                    <Barcode className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs font-bold">No barcode copies configured to print.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
