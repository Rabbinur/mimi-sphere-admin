"use client";

import React, { useRef, useState } from "react";
import { Barcode, Printer, X, Copy, Check } from "lucide-react";
import { BarcodeSvg } from "./BarcodeSvg";

interface BarcodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: {
        id: number;
        sku?: string | null;
        barcode?: string;
        combination_label?: string | null;
        product: {
            name: string;
        };
        available_quantity: number;
    } | null;
}

export function BarcodeModal({ isOpen, onClose, variant }: BarcodeModalProps) {
    const [copied, setCopied] = useState(false);
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
        const svgHtml = svgEl ? svgEl.outerHTML : `<div style="font-family:monospace;font-weight:bold;font-size:18px">${barcodeValue}</div>`;

        const win = window.open("", "_blank");
        if (!win) return;

        win.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Barcode Label - ${barcodeValue}</title>
                    <style>
                        @page { size: auto; margin: 10mm; }
                        body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fff; }
                        .ticket { border: 1px solid #cbd5e1; padding: 20px; text-align: center; border-radius: 12px; max-width: 320px; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                        .p-name { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px; word-break: break-word; }
                        .v-badge { display: inline-block; padding: 2px 8px; background: #eff6ff; color: #1d4ed8; border-radius: 4px; font-size: 10px; font-weight: 700; margin-bottom: 12px; }
                        .barcode-container { margin: 12px 0; padding: 10px 16px; background: #ffffff; display: flex; justify-content: center; border-radius: 8px; }
                        .barcode-container svg { max-width: 100%; height: auto; }
                        .meta { font-size: 10px; font-weight: 700; color: #64748b; margin-top: 6px; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <div class="p-name">${variant.product.name}</div>
                        ${variant.combination_label ? `<div class="v-badge">${variant.combination_label}</div>` : ""}
                        <div class="barcode-container">
                            ${svgHtml}
                        </div>
                        <div class="meta">Stock Qty: ${variant.available_quantity} units</div>
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

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Barcode className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800">Scannable Barcode Label</h3>
                            <p className="text-[11px] font-semibold text-slate-400">Valid Code-128 physical sticker</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body: Printable Barcode Ticket */}
                <div className="p-6 space-y-5">
                    <div
                        ref={printRef}
                        className="p-5 border border-slate-200 rounded-2xl text-center space-y-3 bg-white"
                    >
                        <div>
                            <p className="text-xs font-black text-slate-800 line-clamp-2">{variant.product.name}</p>
                            {variant.combination_label && (
                                <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                                    {variant.combination_label}
                                </span>
                            )}
                        </div>

                        {/* Generated Valid Barcode SVG */}
                        <div className="py-2 px-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden">
                            <BarcodeSvg value={barcodeValue} height={50} width={1.8} />
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                Available Stock: {variant.available_quantity} Units
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyBarcode}
                            className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                            {copied ? "Copied!" : "Copy Code"}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            Print Label
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
