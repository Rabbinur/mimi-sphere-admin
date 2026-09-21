"use client";

import React, { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Search,
  RefreshCw,
  ShoppingBag,
  Package,
  Layers,
  X,
  AlertCircle,
  CheckCircle2,
  Boxes,
  Calendar,
} from "lucide-react";
import Pagination from "@/components/Common/Pagination";
import { useGetPurchaseReportQuery } from "@/components/Redux/RTK/reportsApi";
import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi";
import { printCleanReport } from "@/utils/printReport";
import { toast } from "sonner";

export default function PurchaseReportPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "yesterday" | "this_week" | "this_month" | "last_month" | "custom"
  >("all");

  // Handle Quick Date Presets in BST (UTC+6)
  const handleDatePreset = (
    preset: "all" | "today" | "yesterday" | "this_week" | "this_month" | "last_month" | "custom"
  ) => {
    setDatePreset(preset);
    setCurrentPage(1);

    const now = new Date();
    const bstNow = new Date(now.getTime() + 6 * 3600 * 1000);
    const todayStr = bstNow.toISOString().split("T")[0];

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "yesterday") {
      const y = new Date(bstNow.getTime() - 24 * 3600 * 1000);
      const yStr = y.toISOString().split("T")[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === "this_week") {
      const weekStart = new Date(bstNow.getTime() - 6 * 24 * 3600 * 1000);
      setStartDate(weekStart.toISOString().split("T")[0]);
      setEndDate(todayStr);
    } else if (preset === "this_month") {
      const y = bstNow.getUTCFullYear();
      const m = String(bstNow.getUTCMonth() + 1).padStart(2, "0");
      setStartDate(`${y}-${m}-01`);
      setEndDate(todayStr);
    } else if (preset === "last_month") {
      const prevMonthDate = new Date(bstNow.getUTCFullYear(), bstNow.getUTCMonth() - 1, 1);
      const y = prevMonthDate.getFullYear();
      const m = String(prevMonthDate.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(y, prevMonthDate.getMonth() + 1, 0).getDate();
      setStartDate(`${y}-${m}-01`);
      setEndDate(`${y}-${m}-${String(lastDay).padStart(2, "0")}`);
    } else if (preset === "custom") {
      if (!startDate) setStartDate(todayStr);
      if (!endDate) setEndDate(todayStr);
    }
  };

  const { data: categoriesData } = useAllCategoryQuery(undefined) as {
    data: any[] | undefined;
  };

  const {
    data: purchaseResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetPurchaseReportQuery(
    {
      page: currentPage,
      per_page: perPage,
      search: searchTerm.trim() || undefined,
      category: selectedCategory || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const rawData = purchaseResponse?.data;
  const reportData: any[] = Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData)
    ? rawData
    : Array.isArray(purchaseResponse?.data)
    ? purchaseResponse.data
    : [];

  const pagination = rawData?.pagination || purchaseResponse?.pagination || {
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 1,
  };

  const summary = rawData?.summary || purchaseResponse?.summary || {
    total_stock_qty: 0,
    total_stock_valuation: 0,
    total_items_count: 0,
  };

  const formatCurrency = (val: number) => {
    return `৳${Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExportExcel = () => {
    try {
      const headers = [
        "SKU",
        "Product Name",
        "Brand",
        "Category",
        "Unit Cost",
        "Unit Price",
        "Instock Qty",
        "Stock Valuation",
        "Status",
      ];
      const rows = (Array.isArray(reportData) ? reportData : []).map((item: any) => [
        `"${item.sku}"`,
        `"${(item.product_name || "").replace(/"/g, '""')}"`,
        `"${item.brand}"`,
        `"${item.category}"`,
        item.unit_cost,
        item.unit_price,
        item.instock_qty,
        item.total_stock_value,
        `"${item.stock_status}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        [
          ["MIMI SPHERE - Purchase & Inventory Valuation Report"],
          [`Date Range: ${startDate || "All-time"} to ${endDate || "Present"}`],
          [""],
          headers,
          ...rows,
        ]
          .map((e) => (Array.isArray(e) ? e.join(",") : e))
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `mimi_sphere_purchase_report_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Excel / CSV report exported successfully!");
    } catch {
      toast.error("Failed to export report");
    }
  };

  const handlePrint = () => {
    if (reportData.length === 0) {
      toast.info("প্রিন্ট করার জন্য কোনো ডাটা নেই।");
      return;
    }

    const periodLabel =
      startDate || endDate
        ? `${startDate || "Beginning"} to ${endDate || "Today"}`
        : "All Time";

    const catObj = (categoriesData || []).find((c: any) => c._id === selectedCategory);
    const categoryLabel = catObj?.name || "All Categories";

    printCleanReport({
      title: "Purchase & Inventory Valuation Report",
      subtitle: "Detailed product purchase cost, instock volume and inventory asset valuation",
      periodText: periodLabel,
      metadata: [
        { label: "Category Filter", value: categoryLabel },
        { label: "Search Keyword", value: searchTerm || "None" },
      ],
      summaryCards: [
        {
          label: "Total Instock Qty",
          value: `${summary.total_stock_qty.toLocaleString("en-US")} units`,
          color: "#7c3aed",
        },
        {
          label: "Stock Asset Valuation",
          value: formatCurrency(summary.total_stock_valuation),
          color: "#059669",
        },
        {
          label: "Total SKUs Catalog",
          value: `${summary.total_items_count} items`,
          color: "#0f172a",
        },
      ],
      columns: [
        { header: "SKU", key: "sku", align: "left" },
        { header: "Product Name", key: "product_name", align: "left" },
        { header: "Brand", key: "brand", align: "left" },
        { header: "Category", key: "category", align: "left" },
        { header: "Unit Cost", key: "unit_cost_display", align: "right" },
        { header: "Unit Price", key: "unit_price_display", align: "right" },
        { header: "In Stock", key: "instock_qty_display", align: "center" },
        { header: "Stock Valuation", key: "stock_value_display", align: "right" },
        { header: "Status", key: "stock_status", align: "center" },
      ],
      data: (Array.isArray(reportData) ? reportData : []).map((item: any) => ({
        ...item,
        unit_cost_display: formatCurrency(item.unit_cost),
        unit_price_display: formatCurrency(item.unit_price),
        instock_qty_display: `${item.instock_qty} units`,
        stock_value_display: formatCurrency(item.total_stock_value),
      })),
      totalRow: {
        sku: "TOTAL",
        product_name: `Summary of ${reportData.length} items`,
        brand: "-",
        category: "-",
        unit_cost_display: "-",
        unit_price_display: "-",
        instock_qty_display: `${summary.total_stock_qty.toLocaleString("en-US")} units`,
        stock_value_display: formatCurrency(summary.total_stock_valuation),
        stock_status: "-",
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Main Card ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Purchase Report
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              পণ্য ক্রয়মূল্য, মজুত পরিমাণ ও ইনভেন্টরি সম্পদ ভ্যালুয়েশন রিপোর্ট
            </p>
          </div>

          {/* Export Buttons (PDF, XLS, Print) */}
          <div className="flex items-center gap-2 self-start sm:self-auto no-print">
            <button
              type="button"
              onClick={handlePrint}
              title="Export as PDF"
              className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 border border-rose-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
            >
              <FileText className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              title="Export as Excel / CSV"
              className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 border border-emerald-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
            >
              <FileSpreadsheet className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Print Report"
              className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
            >
              <Printer className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* ─── Summary Badges Bar ─── */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Instock Qty</span>
              <span className="text-base font-black font-mono text-purple-700">
                {summary.total_stock_qty.toLocaleString("en-US")} units
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Stock Asset Valuation</span>
              <span className="text-base font-black font-mono text-emerald-600">
                {formatCurrency(summary.total_stock_valuation)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total SKUs</span>
              <span className="text-base font-black font-mono text-slate-800">
                {summary.total_items_count} products
              </span>
            </div>
          </div>
        </div>

        {/* ─── Date Presets Row (Requested by User) ─── */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-150 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
            {[
              { key: "all", label: "All Time" },
              { key: "today", label: "Today (আজ)" },
              { key: "yesterday", label: "Yesterday (গতকাল)" },
              { key: "this_week", label: "Weekly (৭ দিন)" },
              { key: "this_month", label: "Monthly (চলতি মাস)" },
              { key: "last_month", label: "Last Month" },
              { key: "custom", label: "Custom Range" },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => handleDatePreset(p.key as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold text-xs ${
                  datePreset === p.key
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Active Period Display */}
          <div className="text-xs text-slate-500 font-medium">
            Period:{" "}
            <span className="font-bold text-slate-800 font-mono">
              {startDate || "Beginning"}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-800 font-mono">
              {endDate || "Present"}
            </span>
          </div>
        </div>

        {/* ─── Filter Bar: Search, Category & Custom Date Inputs ─── */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex flex-wrap items-center gap-3 no-print">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, Product Name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="w-48">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {(categoriesData || []).map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range: Start Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset("custom");
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-mono font-bold text-slate-800 outline-none cursor-pointer"
            />
          </div>

          {/* Custom Date Range: End Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset("custom");
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-mono font-bold text-slate-800 outline-none cursor-pointer"
            />
          </div>

          {/* Refresh & Reset */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => refetch()}
              title="Refresh Data"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
            </button>

            {(searchTerm || selectedCategory || startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setStartDate("");
                  setEndDate("");
                  setDatePreset("all");
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Products Table ─── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 min-w-[220px]">Product Name</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Instock Qty</th>
                <th className="py-3 px-4 text-right">Stock Valuation</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading || isFetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-14 bg-slate-200 rounded ml-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-14 bg-slate-200 rounded ml-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-10 bg-slate-200 rounded mx-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-16 bg-slate-200 rounded ml-auto" /></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-slate-200 rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : !Array.isArray(reportData) || reportData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-8 h-8 stroke-1 text-slate-300" />
                      <p className="font-semibold text-sm">কোনো স্টক তথ্য পাওয়া যায়নি</p>
                      <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (Array.isArray(reportData) ? reportData : []).map((item: any) => (
                  <tr key={item.product_id} className="hover:bg-slate-50/60 transition-colors">
                    {/* SKU */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {item.sku}
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <span className="line-clamp-1">{item.product_name}</span>
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {item.brand}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    {/* Unit Cost */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-600">
                      {formatCurrency(item.unit_cost)}
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(item.unit_price)}
                    </td>

                    {/* Instock Qty */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-black text-slate-800 text-xs">
                        {item.instock_qty}
                      </span>
                    </td>

                    {/* Stock Valuation */}
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-600">
                      {formatCurrency(item.total_stock_value)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {item.stock_status === "In Stock" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          In Stock
                        </span>
                      )}
                      {item.stock_status === "Low Stock" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Low Stock
                        </span>
                      )}
                      {item.stock_status === "Out of Stock" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <X className="w-2.5 h-2.5" />
                          Out of Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Bottom Pagination Bar ─── */}
        {pagination.totalPages > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white no-print">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              perPage={perPage}
              onPageChange={(p) => setCurrentPage(p)}
              onPerPageChange={(pp) => {
                setPerPage(pp);
                setCurrentPage(1);
              }}
              from={Math.min((pagination.currentPage - 1) * perPage + 1, pagination.totalItems)}
              to={Math.min(pagination.currentPage * perPage, pagination.totalItems)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
