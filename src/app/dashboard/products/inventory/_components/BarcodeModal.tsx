"use client";

import React, { useRef, useState } from "react";
import { Barcode, Printer, X, Copy, Check, Download, FileDown } from "lucide-react";
import { BarcodeSvg } from "./BarcodeSvg";

interface BarcodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: {
        id: number | string;
        sku?: string | null;
        barcode?: string;
        combination_label?: string | null;
        product: {
            name: string;
        };
        available_quantity: number;
        price?: number;
    } | null;
}

export function BarcodeModal({ isOpen, onClose, variant }: BarcodeModalProps) {
    const [copied, setCopied] = useState(false);
    const [labelSize, setLabelSize] = useState<"standard" | "compact">("compact");
    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !variant) return null;

    const barcodeValue = variant.barcode || variant.sku || `BAR-${String(variant.id).padStart(6, "0")}`;

    const copyBarcode = () => {
        navigator.clipboard.writeText(barcodeValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        const svgEl = printRef.current?.querySelector("svg");
        const svgHtml = svgEl ? svgEl.outerHTML : `<div style="font-family:monospace;font-weight:bold;font-size:16px">${barcodeValue}</div>`;

        const isCompact = labelSize === "compact";
        const widthMm = isCompact ? "40mm" : "50mm";
        const heightMm = isCompact ? "25mm" : "30mm";

        const win = window.open("", "_blank");
        if (!win) return;

        win.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Barcode - ${barcodeValue}</title>
                    <style>
                        @page {
                            size: ${widthMm} ${heightMm};
                            margin: 0;
                        }
                        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
                        body {
                            font-family: system-ui, -apple-system, sans-serif;
                            margin: 0;
                            padding: 2mm 3mm;
                            width: ${widthMm};
                            height: ${heightMm};
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            background: #fff;
                            color: #000;
                        }
                        .brand {
                            font-size: 7.5px;
                            font-weight: 800;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            color: #333;
                            margin-bottom: 1px;
                        }
                        .p-name {
                            font-size: 8.5px;
                            font-weight: 700;
                            line-height: 1.1;
                            max-height: 18px;
                            overflow: hidden;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            margin-bottom: 2px;
                        }
                        .barcode-box {
                            margin: 1px 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .barcode-box svg {
                            max-width: 100%;
                            height: ${isCompact ? "32px" : "38px"};
                        }
                        .footer {
                            font-size: 7.5px;
                            font-weight: 700;
                            margin-top: 1px;
                            display: flex;
                            justify-content: space-between;
                            width: 100%;
                            padding: 0 2px;
                        }
                    </style>
                </head>
                <body>
                    <div class="brand">MIMI SPHERE</div>
                    <div class="p-name">${variant.product.name} ${variant.combination_label ? `(${variant.combination_label})` : ""}</div>
                    <div class="barcode-box">
                        ${svgHtml}
                    </div>
                    <div class="footer">
                        <span>SKU: ${variant.sku || barcodeValue}</span>
                        ${variant.price ? `<span>৳${variant.price}</span>` : ""}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        }
                    </script>
                </body>
            </html>
        `);
        win.document.close();
    };

    // Download sticker as PDF / HTML file
    const handleDownloadPdf = () => {
        handlePrint(); // Native print allows saving directly as PDF via "Save as PDF" destination in 1 click
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                            <Barcode className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-black text-slate-800">Product Barcode Label</h3>
                            <p className="text-[10.5px] font-semibold text-slate-400">Compact Code-128 sticker</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body: Compact Barcode Sticker */}
                <div className="p-5 space-y-4">
                    {/* Size Selector Switch */}
                    <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setLabelSize("compact")}
                            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                                labelSize === "compact"
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Small (40×25mm)
                        </button>
                        <button
                            type="button"
                            onClick={() => setLabelSize("standard")}
                            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                                labelSize === "standard"
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Standard (50×30mm)
                        </button>
                    </div>

                    {/* Printable Compact Sticker Preview */}
                    <div
                        ref={printRef}
                        className="p-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-white max-w-[260px] mx-auto shadow-2xs"
                    >
                        <div>
                            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                                MIMI SPHERE
                            </span>
                            <p className="text-xs font-black text-slate-900 line-clamp-1 mt-0.5">
                                {variant.product.name}
                            </p>
                            {variant.combination_label && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded text-[9.5px] font-bold border border-blue-100">
                                    {variant.combination_label}
                                </span>
                            )}
                        </div>

                        {/* Generated Compact Barcode SVG */}
                        <div className="py-1 px-2 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                            <BarcodeSvg
                                value={barcodeValue}
                                height={labelSize === "compact" ? 34 : 40}
                                width={1.5}
                                fontSize={11}
                            />
                        </div>

                        <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-500 pt-0.5 border-t border-slate-100">
                            <span className="font-mono">SKU: {variant.sku || barcodeValue}</span>
                            {variant.available_quantity !== undefined && (
                                <span>Stock: {variant.available_quantity}</span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Print Sticker</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                title="Save as PDF using system print dialogue"
                            >
                                <FileDown className="w-4 h-4 text-amber-400" />
                                <span>PDF / Download</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={copyBarcode}
                            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            <span>{copied ? "Barcode Copied!" : "Copy Barcode Text"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
