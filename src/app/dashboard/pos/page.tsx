"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
    PosHeader,
    PosProductGrid,
    PosCartPanel,
    PosCheckoutModal,
    PosReceiptModal,
    PosShiftModal,
    PosVariantModal,
    PosCameraScannerModal,
    playBeepSound,
    usePosCart,
    useBarcodeScanner,
    PosProductItem,
    PosReceiptData,
} from "@/modules/pos";
import { useGetPosProductsQuery, useScanBarcodeMutation } from "@/components/Redux/RTK/posApi";
import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi";

export default function PosTerminalPage() {
    // POS Cart State Management Hook
    const {
        cartItems,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        taxAmount,
        grandTotal,
        totalItemCount,
        globalDiscount,
        setGlobalDiscount,
    } = usePosCart();

    // Filters & Pagination for Product Touch Grid
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
    const [page, setPage] = useState<number>(1);
    const [allProducts, setAllProducts] = useState<PosProductItem[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // Camera Scanner Modal State
    const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

    // Variant Selection Modal State
    const [selectedProductForVariantModal, setSelectedProductForVariantModal] = useState<PosProductItem | null>(null);

    // Scanner Status Message
    const [barcodeStatusMessage, setBarcodeStatusMessage] = useState<string | null>(null);
    const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);

    // Mobile Drawer State
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    // Modal States
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<PosReceiptData | null>(null);

    // RTK Query API Hooks
    const { data: productsData, isLoading: isProductsLoading, isFetching: isProductsFetching, refetch: refetchProducts } = useGetPosProductsQuery({
        search: searchValue,
        category_id: selectedCategory || undefined,
        per_page: 24,
        page: page,
    });

    const { data: categoriesData } = useAllCategoryQuery(undefined);
    const [scanBarcode, { isLoading: isScanning }] = useScanBarcodeMutation();

    const categoriesList = categoriesData?.data || categoriesData || [];

    // Reset pagination when search or category changes
    useEffect(() => {
        setPage(1);
        setAllProducts([]);
        setHasMore(true);
    }, [searchValue, selectedCategory]);

    // Accumulate products from API pages
    useEffect(() => {
        if (!productsData) return;

        // Handle middleware-wrapped responses (e.g. productsData.data containing pagination metadata)
        let root = productsData;
        if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
            root = root.data;
        }

        // Extract product items array
        let itemsList: PosProductItem[] = [];
        if (Array.isArray(root.data)) {
            itemsList = root.data;
        } else if (Array.isArray(root)) {
            itemsList = root;
        } else if (Array.isArray(productsData.data)) {
            itemsList = productsData.data;
        }

        // Extract pagination metadata from root or top-level productsData
        const pag = root.pagination ||
                    root.meta ||
                    productsData.pagination ||
                    productsData.meta ||
                    (root.current_page !== undefined ? {
                        current_page: Number(root.current_page),
                        last_page: Number(root.last_page),
                        per_page: Number(root.per_page),
                        total: Number(root.total),
                    } : (productsData.current_page !== undefined ? {
                        current_page: Number(productsData.current_page),
                        last_page: Number(productsData.last_page),
                        per_page: Number(productsData.per_page),
                        total: Number(productsData.total),
                    } : null));

        const currPage = pag?.current_page ?? page;

        if (currPage === page) {
            if (page === 1) {
                setAllProducts(itemsList);
            } else {
                setAllProducts((prev) => {
                    const existingKeys = new Set(prev.map((i) => i.product_id));
                    const uniqueNew = itemsList.filter((i) => !existingKeys.has(i.product_id));
                    return [...prev, ...uniqueNew];
                });
            }

            if (pag && pag.last_page !== undefined) {
                setHasMore(pag.current_page < pag.last_page);
            } else {
                setHasMore(itemsList.length > 0);
            }
        }
    }, [productsData, page]);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !isProductsFetching) {
            setPage((prev) => prev + 1);
        }
    }, [hasMore, isProductsFetching]);

    // Helper to add item to cart with realistic POS machine beep sound and auto-close camera modal
    const handleAddToCart = useCallback((item: PosProductItem) => {
        playBeepSound();
        addItem(item);
        setIsCameraScannerOpen(false);
        setScanErrorMessage(null);
    }, [addItem]);

    // Handle Barcode Scan event from hardware scanner or mobile camera
    const handleBarcodeScan = useCallback(async (code: string) => {
        const cleanCode = code ? code.trim() : "";
        if (!cleanCode || isScanning) return;

        setScanErrorMessage(null);

        try {
            setBarcodeStatusMessage(`Scanning barcode: ${cleanCode}...`);
            const res = await scanBarcode({ barcode: cleanCode }).unwrap();
            
            // Extract product item data handling both raw and ApiResponse middleware-wrapped responses
            const itemData: PosProductItem | null =
                (res?.data && typeof res.data === "object" && ("variant_id" in res.data || "product_id" in res.data) ? res.data : null) ||
                res?.data?.data ||
                (res && typeof res === "object" && ("variant_id" in res || "product_id" in res) ? res : null);

            if (itemData && (itemData.variant_id !== undefined || itemData.product_id !== undefined)) {
                handleAddToCart(itemData);
                const label = itemData.combination_label ? ` (${itemData.combination_label})` : "";
                setBarcodeStatusMessage(`✅ Added ${itemData.product_name}${label} to cart!`);
                setTimeout(() => setBarcodeStatusMessage(null), 2500);
            } else {
                playBeepSound(400); // POS Error Alert
                const errTxt = `Code '${cleanCode}' is not in database!`;
                setBarcodeStatusMessage(`❌ ${errTxt}`);
                setScanErrorMessage(errTxt);
                setTimeout(() => {
                    setBarcodeStatusMessage(null);
                    setScanErrorMessage(null);
                }, 3500);
            }
        } catch (err: any) {
            console.error("Barcode scan failed:", err);
            playBeepSound(400); // POS Error Alert
            const errTxt = `Code '${cleanCode}' is not in database!`;
            setBarcodeStatusMessage(`❌ ${errTxt}`);
            setScanErrorMessage(errTxt);
            setTimeout(() => {
                setBarcodeStatusMessage(null);
                setScanErrorMessage(null);
            }, 3500);
        }
    }, [scanBarcode, handleAddToCart, isScanning]);

    // Attach Hardware USB/Bluetooth Barcode Scanner listener
    useBarcodeScanner({
        onScan: handleBarcodeScan,
        enabled: !isCheckoutOpen && !isReceiptOpen && !isShiftModalOpen,
    });

    // F9 Keyboard Shortcut for Checkout
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F9" && cartItems.length > 0 && !isCheckoutOpen) {
                e.preventDefault();
                setIsCheckoutOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cartItems, isCheckoutOpen]);

    const openThermalReceiptNewTab = useCallback((receiptData: PosReceiptData) => {
        const win = window.open("", "_blank", "width=450,height=700");
        if (!win) return;

        const itemsRows = (receiptData.items || []).map((it) => `
            <tr style="border-bottom: 1px dashed #cbd5e1;">
                <td style="padding: 6px 0; vertical-align: top;">
                    <div style="font-weight: 800; font-size: 11.5px; color: #0f172a;">${it.product_name}</div>
                    ${it.combination_label ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${it.combination_label}</div>` : ''}
                </td>
                <td style="padding: 6px 0; text-align: center; font-weight: 800; color: #334155;">${it.quantity}</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 800; font-family: monospace; color: #0f172a;">$${it.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
            </tr>
        `).join("");

        win.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>POS Receipt #${receiptData.receipt_number}</title>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                        @page { size: 80mm auto; margin: 0; }
                        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
                        body {
                            font-family: 'Courier New', Courier, monospace, system-ui, sans-serif;
                            width: 80mm;
                            max-width: 100%;
                            margin: 0 auto;
                            padding: 12px;
                            color: #0f172a;
                            background: #f8fafc;
                            line-height: 1.3;
                        }
                        .invoice-card {
                            background: #ffffff;
                            border: 1px solid #cbd5e1;
                            border-radius: 16px;
                            padding: 16px;
                            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                        }
                        .header { text-align: center; margin-bottom: 10px; }
                        .store-name { font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
                        .sub-header { font-size: 10.5px; font-weight: 700; color: #64748b; }
                        .dashed { border-top: 1px dashed #94a3b8; margin: 10px 0; }
                        .meta-row { display: flex; justify-content: space-between; font-size: 10.5px; margin-bottom: 3px; }
                        .meta-label { color: #64748b; font-weight: 600; }
                        .meta-val { font-weight: 800; color: #0f172a; }
                        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
                        th { text-align: left; font-size: 9.5px; color: #475569; padding: 4px 0; border-bottom: 1px solid #0f172a; text-transform: uppercase; }
                        .totals-row { display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px; }
                        .grand-total { display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 900; border-top: 1.5px solid #0f172a; padding-top: 6px; margin-top: 6px; color: #1e40af; }
                        .footer { text-align: center; font-size: 9.5px; color: #64748b; margin-top: 12px; }
                        .actions { margin-top: 16px; display: flex; gap: 8px; justify-content: center; }
                        .btn-print { background: #2563eb; color: #ffffff; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 900; font-size: 12px; cursor: pointer; font-family: system-ui, sans-serif; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
                        .btn-close { background: #e2e8f0; color: #334155; border: none; padding: 10px 14px; border-radius: 12px; font-weight: 800; font-size: 11.5px; cursor: pointer; font-family: system-ui, sans-serif; }
                        @media print {
                            body { background: #fff; width: 100%; padding: 0; }
                            .invoice-card { border: none; box-shadow: none; border-radius: 0; padding: 0; }
                            .actions { display: none !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-card">
                        <div class="header">
                            <div class="store-name">GOLDENMARK STORE</div>
                            <div class="sub-header">POS Thermal Sales Receipt</div>
                            <div style="font-size: 9.5px; color: #94a3b8;">Dhaka, Bangladesh</div>
                        </div>

                        <div class="dashed"></div>

                        <div class="meta-row"><span class="meta-label">Receipt No:</span><span class="meta-val">${receiptData.receipt_number}</span></div>
                        <div class="meta-row"><span class="meta-label">Order No:</span><span class="meta-val">${receiptData.order_number}</span></div>
                        <div class="meta-row"><span class="meta-label">Date & Time:</span><span class="meta-val">${receiptData.created_at}</span></div>
                        <div class="meta-row"><span class="meta-label">Customer:</span><span class="meta-val">${receiptData.customer_name || 'Walk-in Customer'}</span></div>

                        <div class="dashed"></div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Item Description</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsRows}
                            </tbody>
                        </table>

                        <div class="dashed"></div>

                        <div class="totals-row"><span>Subtotal:</span><span>$${receiptData.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
                        ${receiptData.discount > 0 ? `<div class="totals-row" style="color: #047857; font-weight: bold;"><span>Discount:</span><span>-$${receiptData.discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>` : ''}
                        
                        <div class="grand-total">
                            <span>TOTAL PAID:</span>
                            <span>$${receiptData.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div class="totals-row" style="font-size: 10px; color: #64748b; margin-top: 6px;">
                            <span>Payment Method:</span>
                            <span style="font-weight: 800; text-transform: uppercase;">${receiptData.payment_method}</span>
                        </div>
                        ${receiptData.payment_method === 'cash' ? `
                            <div class="totals-row" style="font-size: 10px; color: #64748b;"><span>Tendered:</span><span>$${receiptData.tendered_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
                            <div class="totals-row" style="font-size: 10px; font-weight: 800; color: #047857;"><span>Change Due:</span><span>$${receiptData.change_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
                        ` : ''}

                        <div class="dashed"></div>

                        <div class="footer">
                            <div style="font-weight: 800; color: #334155;">Thank You For Shopping With Us!</div>
                            <div>Please keep this receipt for exchanges.</div>
                        </div>

                        <div class="actions">
                            <button class="btn-print" onclick="window.print()">🖨️ PRINT RECEIPT</button>
                            <button class="btn-close" onclick="window.close()">Close</button>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 350);
                        };
                    </script>
                </body>
            </html>
        `);
        win.document.close();
    }, []);

    const openFullInvoiceNewTab = useCallback((receiptData: PosReceiptData) => {
        const win = window.open("", "_blank");
        if (!win) return;

        const itemsRows = (receiptData.items || []).map((it, idx) => `
            <tr style="border-bottom: 1px dashed #cbd5e1;">
                <td style="padding: 8px 6px; font-weight: 700; color: #64748b; font-size: 11px;">${idx + 1}</td>
                <td style="padding: 8px 6px; vertical-align: top;">
                    <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${it.product_name}</div>
                    ${it.combination_label ? `<div style="font-size: 10.5px; color: #475569; font-weight: 600; margin-top: 2px;">Variant: ${it.combination_label}</div>` : ''}
                    ${it.sku ? `<div style="font-size: 9.5px; color: #94a3b8; font-family: monospace;">SKU: ${it.sku}</div>` : ''}
                </td>
                <td style="padding: 8px 6px; text-align: center; font-weight: 800; color: #1e293b; font-size: 12px;">${it.quantity}</td>
                <td style="padding: 8px 6px; text-align: right; font-weight: 700; font-family: monospace; color: #475569; font-size: 12px;">$${(it.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                <td style="padding: 8px 6px; text-align: right; font-weight: 900; font-family: monospace; color: #0f172a; font-size: 12.5px;">$${it.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
            </tr>
        `).join("");

        win.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice #${receiptData.receipt_number} - GOLDENMARK POS</title>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                        @page { size: auto; margin: 10mm; }
                        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            color: #0f172a;
                            background: #f1f5f9;
                            line-height: 1.4;
                        }
                        .page-container {
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .toolbar {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            background: #0f172a;
                            color: #ffffff;
                            padding: 12px 20px;
                            border-radius: 16px;
                            margin-bottom: 20px;
                            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.3);
                        }
                        .toolbar-title {
                            font-weight: 900;
                            font-size: 15px;
                            letter-spacing: -0.3px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .btn-group { display: flex; gap: 10px; }
                        .btn-print {
                            background: #10b981;
                            color: #ffffff;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 12px;
                            font-weight: 800;
                            font-size: 13px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                            transition: all 0.2s ease;
                        }
                        .btn-print:hover { background: #059669; }
                        .btn-close {
                            background: #334155;
                            color: #f8fafc;
                            border: none;
                            padding: 10px 16px;
                            border-radius: 12px;
                            font-weight: 700;
                            font-size: 12.5px;
                            cursor: pointer;
                        }
                        .btn-close:hover { background: #475569; }

                        .invoice-card {
                            background: #ffffff;
                            border-radius: 20px;
                            padding: 32px;
                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                            border: 1px solid #e2e8f0;
                        }
                        .header-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #f1f5f9;
                        }
                        .store-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
                        .store-sub { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px; }
                        .inv-badge {
                            background: #eff6ff;
                            color: #2563eb;
                            padding: 6px 14px;
                            border-radius: 100px;
                            font-size: 12px;
                            font-weight: 900;
                            display: inline-block;
                            margin-bottom: 6px;
                        }
                        .inv-number { font-size: 18px; font-weight: 900; color: #0f172a; font-family: monospace; }
                        
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 24px;
                            margin: 24px 0;
                            padding: 18px;
                            background: #f8fafc;
                            border-radius: 16px;
                            border: 1px solid #e2e8f0;
                        }
                        .info-block-title {
                            font-size: 11px;
                            font-weight: 900;
                            text-transform: uppercase;
                            color: #94a3b8;
                            letter-spacing: 0.5px;
                            margin-bottom: 10px;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            font-size: 12px;
                            margin-bottom: 6px;
                        }
                        .info-label { color: #64748b; font-weight: 600; }
                        .info-val { color: #0f172a; font-weight: 800; text-align: right; }

                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th {
                            text-align: left;
                            font-size: 10.5px;
                            font-weight: 900;
                            color: #475569;
                            padding: 10px 6px;
                            border-bottom: 2px solid #cbd5e1;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }

                        .summary-container {
                            display: flex;
                            justify-content: flex-end;
                            margin-top: 20px;
                        }
                        .summary-box {
                            width: 320px;
                            background: #f8fafc;
                            padding: 16px 20px;
                            border-radius: 16px;
                            border: 1px solid #e2e8f0;
                        }
                        .summary-row {
                            display: flex;
                            justify-content: space-between;
                            font-size: 12.5px;
                            margin-bottom: 6px;
                            color: #475569;
                        }
                        .summary-val { font-weight: 800; color: #0f172a; font-family: monospace; }
                        .grand-total-row {
                            display: flex;
                            justify-content: space-between;
                            font-size: 16px;
                            font-weight: 900;
                            color: #1e40af;
                            padding-top: 10px;
                            margin-top: 8px;
                            border-top: 2px solid #cbd5e1;
                        }

                        .status-pill {
                            display: inline-block;
                            padding: 2px 8px;
                            border-radius: 6px;
                            font-size: 10px;
                            font-weight: 900;
                            text-transform: uppercase;
                        }
                        .status-paid { background: #dcfce7; color: #166534; }
                        .status-completed { background: #dbeafe; color: #1e40af; }

                        .footer {
                            text-align: center;
                            margin-top: 32px;
                            padding-top: 16px;
                            border-top: 1px dashed #cbd5e1;
                            font-size: 11px;
                            color: #64748b;
                        }

                        @media print {
                            body { background: #ffffff; padding: 0; }
                            .toolbar { display: none !important; }
                            .invoice-card { border: none; box-shadow: none; padding: 0; }
                            .page-container { max-width: 100%; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page-container">
                        <!-- Top Toolbar -->
                        <div class="toolbar">
                            <div class="toolbar-title">
                                <span>🧾 POS SALE INVOICE COMPLETE</span>
                            </div>
                            <div class="btn-group">
                                <button class="btn-print" onclick="window.print()">
                                    🖨️ PRINT INVOICE
                                </button>
                                <button class="btn-close" onclick="window.close()">
                                    ✕ Close
                                </button>
                            </div>
                        </div>

                        <!-- Invoice Main Card -->
                        <div class="invoice-card">
                            <!-- Store Header -->
                            <div class="header-row">
                                <div>
                                    <div class="store-title">GOLDENMARK STORE</div>
                                    <div class="store-sub">Point of Sale (POS) Official Cash Receipt</div>
                                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Dhaka, Bangladesh | Phone: +880 1909-756552</div>
                                </div>
                                <div style="text-align: right;">
                                    <div class="inv-badge">POS SALES RECEIPT</div>
                                    <div class="inv-number">#${receiptData.receipt_number}</div>
                                </div>
                            </div>

                            <!-- Info Grid -->
                            <div class="info-grid">
                                <!-- Order Info -->
                                <div>
                                    <div class="info-block-title">Order Information</div>
                                    <div class="info-row"><span class="info-label">Order Number:</span><span class="info-val">${receiptData.order_number}</span></div>
                                    <div class="info-row"><span class="info-label">Date & Time:</span><span class="info-val">${receiptData.created_at}</span></div>
                                    <div class="info-row"><span class="info-label">Order Status:</span><span class="info-val"><span class="status-pill status-completed">COMPLETED</span></span></div>
                                    <div class="info-row"><span class="info-label">Payment Status:</span><span class="info-val"><span class="status-pill status-paid">PAID</span></span></div>
                                </div>
                                <!-- Customer Info -->
                                <div>
                                    <div class="info-block-title">Customer Details</div>
                                    <div class="info-row"><span class="info-label">Customer Name:</span><span class="info-val">${receiptData.customer_name || 'Walk-in Customer'}</span></div>
                                    <div class="info-row"><span class="info-label">Phone Number:</span><span class="info-val">${receiptData.customer_phone || 'N/A'}</span></div>
                                    <div class="info-row"><span class="info-label">Email:</span><span class="info-val">${receiptData.customer_email || 'walkin@store.local'}</span></div>
                                    <div class="info-row"><span class="info-label">Sales Type:</span><span class="info-val">In-Store Counter Sale</span></div>
                                </div>
                            </div>

                            <!-- Purchased Items Table -->
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 40px;">#</th>
                                        <th>Item Description</th>
                                        <th style="text-align: center; width: 60px;">Qty</th>
                                        <th style="text-align: right; width: 100px;">Unit Price</th>
                                        <th style="text-align: right; width: 110px;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsRows}
                                </tbody>
                            </table>

                            <!-- Summary Box -->
                            <div class="summary-container">
                                <div class="summary-box">
                                    <div class="summary-row"><span>Subtotal:</span><span class="summary-val">$${receiptData.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
                                    ${receiptData.discount > 0 ? `<div class="summary-row" style="color: #059669; font-weight: 700;"><span>Discount:</span><span class="summary-val">-$${receiptData.discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>` : ''}
                                    ${receiptData.tax > 0 ? `<div class="summary-row"><span>Tax:</span><span class="summary-val">$${receiptData.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>` : ''}
                                    
                                    <div class="grand-total-row">
                                        <span>TOTAL PAID:</span>
                                        <span style="font-family: monospace;">$${receiptData.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    <div class="summary-row" style="font-size: 11px; color: #64748b; margin-top: 8px;">
                                        <span>Payment Method:</span>
                                        <span style="font-weight: 900; text-transform: uppercase; color: #0f172a;">${receiptData.payment_method}</span>
                                    </div>
                                    ${receiptData.payment_method === 'cash' ? `
                                        <div class="summary-row" style="font-size: 11px;"><span>Cash Tendered:</span><span class="summary-val">$${receiptData.tendered_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
                                        <div class="summary-row" style="font-size: 11px; font-weight: 800; color: #059669;"><span>Change Due:</span><span class="summary-val">$${receiptData.change_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
                                    ` : ''}
                                </div>
                            </div>

                            <!-- Footer Note -->
                            <div class="footer">
                                <div style="font-weight: 800; color: #0f172a; font-size: 12px;">Thank You For Shopping With Us!</div>
                                <div style="margin-top: 2px;">Please retain this official invoice for return or exchange claims.</div>
                            </div>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 400);
                        };
                    </script>
                </body>
            </html>
        `);
        win.document.close();
    }, []);

    const handleCheckoutSuccess = (data: PosReceiptData) => {
        clearCart();
        setIsMobileCartOpen(false);
        setReceiptData(data);
        setIsReceiptOpen(true);
        refetchProducts();
        
        // Immediately open DEFAULT thermal receipt window on sale confirmation!
        openThermalReceiptNewTab(data);
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden font-sans select-none relative">
            {/* Top Bar */}
            <PosHeader
                onOpenShiftModal={() => setIsShiftModalOpen(true)}
                onOpenCameraScanner={() => setIsCameraScannerOpen(true)}
                onRefresh={refetchProducts}
                barcodeStatusMessage={barcodeStatusMessage}
                isScanning={isScanning}
            />

            {/* Main Terminal Grid: Products Grid (Left) + Order Cart Panel (Right Desktop / Drawer Mobile) */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                <PosProductGrid
                    products={allProducts}
                    isLoading={isProductsLoading && page === 1}
                    isFetchingMore={isProductsFetching && page > 1}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    onSelectProduct={handleAddToCart}
                    onOpenVariantModal={(prod) => setSelectedProductForVariantModal(prod)}
                    onOpenCameraScanner={() => setIsCameraScannerOpen(true)}
                    onBarcodeScan={handleBarcodeScan}
                    onSearchChange={setSearchValue}
                    searchValue={searchValue}
                    categories={Array.isArray(categoriesList) ? categoriesList : []}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                {/* Desktop Cart Sidebar (hidden on mobile/tablet) */}
                <div className="hidden lg:block h-full">
                    <PosCartPanel
                        cartItems={cartItems}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeItem}
                        onClearCart={clearCart}
                        subtotal={subtotal}
                        grandTotal={grandTotal}
                        totalItemCount={totalItemCount}
                        globalDiscount={globalDiscount}
                        onSetGlobalDiscount={setGlobalDiscount}
                        onOpenCheckout={() => setIsCheckoutOpen(true)}
                    />
                </div>
            </main>

            {/* Mobile/Tablet Floating Bottom Cart Bar (< lg) */}
            {cartItems.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-slate-900/95 backdrop-blur-md text-white flex items-center justify-between shadow-2xl z-30 border-t border-slate-800 animate-in slide-in-from-bottom duration-200">
                    <div>
                        <span className="text-xs font-bold text-slate-400 block">{totalItemCount} Items Selected</span>
                        <span className="text-base font-black text-blue-400 font-mono">
                            ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <button
                        onClick={() => setIsMobileCartOpen(true)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                        View Cart & Pay →
                    </button>
                </div>
            )}

            {/* Mobile/Tablet Cart Slide-Up Drawer Overlay (< lg) */}
            {isMobileCartOpen && (
                <div className="lg:hidden fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-200">
                    <div className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="p-3 bg-slate-950 text-white flex items-center justify-between">
                            <span className="text-xs font-black">POS Order Cart</span>
                            <button
                                onClick={() => setIsMobileCartOpen(false)}
                                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                            >
                                ✕ Close
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <PosCartPanel
                                cartItems={cartItems}
                                onUpdateQuantity={updateQuantity}
                                onRemoveItem={removeItem}
                                onClearCart={clearCart}
                                subtotal={subtotal}
                                grandTotal={grandTotal}
                                totalItemCount={totalItemCount}
                                globalDiscount={globalDiscount}
                                onSetGlobalDiscount={setGlobalDiscount}
                                onOpenCheckout={() => {
                                    setIsMobileCartOpen(false);
                                    setIsCheckoutOpen(true);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Phone Camera Barcode Scanner Modal */}
            <PosCameraScannerModal
                isOpen={isCameraScannerOpen}
                onClose={() => {
                    setIsCameraScannerOpen(false);
                    setScanErrorMessage(null);
                }}
                onScan={(code) => {
                    handleBarcodeScan(code);
                }}
                isProcessing={isScanning}
                errorMessage={scanErrorMessage}
            />

            {/* Variant Selection Modal */}
            <PosVariantModal
                product={selectedProductForVariantModal}
                isOpen={!!selectedProductForVariantModal}
                onClose={() => setSelectedProductForVariantModal(null)}
                onSelectVariant={(varItem) => {
                    handleAddToCart(varItem);
                }}
            />

            {/* Payment Checkout Modal */}
            <PosCheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cartItems={cartItems}
                subtotal={subtotal}
                globalDiscount={globalDiscount}
                taxAmount={taxAmount}
                grandTotal={grandTotal}
                onSuccess={handleCheckoutSuccess}
            />

            {/* Completed Thermal Receipt Modal */}
            <PosReceiptModal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                receiptData={receiptData}
                onOpenFullInvoice={openFullInvoiceNewTab}
            />

            {/* Daily Shift Sales Summary Modal */}
            <PosShiftModal
                isOpen={isShiftModalOpen}
                onClose={() => setIsShiftModalOpen(false)}
            />
        </div>
    );
}
