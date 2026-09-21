"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Package,
  Layers,
  Store,
  Globe,
  X,
  CreditCard,
  ShoppingBasket,
} from "lucide-react";
import Pagination from "@/components/Common/Pagination";
import { useGetProductSalesReportQuery } from "@/components/Redux/RTK/reportsApi";
import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi";
import { toast } from "sonner";

export default function SalesReportPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<"all" | "pos" | "online">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Categories for filter dropdown
  const { data: categoriesData } = useAllCategoryQuery(undefined) as {
    data: any[] | undefined;
  };

  // Fetch product sales report with backend pagination & filtering
  const {
    data: salesReportResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductSalesReportQuery(
    {
      page: currentPage,
      per_page: perPage,
      search: searchTerm.trim() || undefined,
      category: selectedCategory || undefined,
      channel: selectedChannel,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const reportData = salesReportResponse?.data || [];
  const pagination = salesReportResponse?.pagination || {
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 1,
  };
  const summary = salesReportResponse?.summary || {
    total_sold_qty: 0,
    total_sold_amount: 0,
    total_online_qty: 0,
    total_online_amount: 0,
    total_pos_qty: 0,
    total_pos_amount: 0,
    total_products_count: 0,
  };

  const formatCurrency = (val: number) => {
    return `৳${Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Export CSV / Excel
  const handleExportExcel = () => {
    try {
      const headers = [
        "SKU",
        "Product Name",
        "Brand",
        "Category",
        "Total Sold Qty",
        "Online Qty",
        "POS Qty",
        "Total Sold Amount",
        "Online Amount",
        "POS Amount",
        "Instock Qty",
      ];
      const rows = reportData.map((item: any) => [
        `"${item.sku}"`,
        `"${(item.product_name || "").replace(/"/g, '""')}"`,
        `"${item.brand}"`,
        `"${item.category}"`,
        item.sold_qty,
        item.online_qty || 0,
        item.pos_qty || 0,
        item.sold_amount,
        item.online_amount || 0,
        item.pos_amount || 0,
        item.instock_qty,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        [
          ["MIMI SPHERE - Sales Report"],
          [`Channel Filter: ${selectedChannel.toUpperCase()}`],
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
        `mimi_sphere_sales_report_${selectedChannel}_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Sales report exported successfully!");
    } catch (err) {
      toast.error("Failed to export Excel report.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ─── Main White Card Container ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Sales Report
              </h1>
              {selectedChannel === "online" && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Online Store Only
                </span>
              )}
              {selectedChannel === "pos" && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  POS Counter Only
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manage your sales, product volume, online orders vs POS counter turnover
            </p>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              title="Export as PDF"
              className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 border border-rose-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
            >
              <FileText className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
            </button>

            {/* Excel / XLS Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              title="Export as Excel / CSV"
              className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 border border-emerald-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
            >
              <FileSpreadsheet className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              title="Print Sales Report"
              className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
            >
              <Printer className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* ─── Online vs POS Channel Tabs (Requested by User) ─── */}
        <div className="px-5 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedChannel("all");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              selectedChannel === "all"
                ? "border-[#f97316] text-[#f97316] bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>All Sales (সব সেলস)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedChannel("online");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              selectedChannel === "online"
                ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-blue-700 hover:bg-slate-100"
            }`}
          >
            <ShoppingBasket className="w-4 h-4 text-blue-500" />
            <span>Online Orders (অনলাইন শপ)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedChannel("pos");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              selectedChannel === "pos"
                ? "border-emerald-600 text-emerald-600 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
            }`}
          >
            <Store className="w-4 h-4 text-emerald-500" />
            <span>POS Counter (দোকানের কাউন্টার)</span>
          </button>
        </div>

        {/* ─── Summary Badges Bar with Channel Breakdown ─── */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Sold Qty */}
          <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedChannel === "pos"
                  ? "bg-emerald-100 text-emerald-700"
                  : selectedChannel === "online"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100/70 text-emerald-700"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                {selectedChannel === "online"
                  ? "Online Sold Qty"
                  : selectedChannel === "pos"
                  ? "POS Counter Sold Qty"
                  : "Total Sold Qty"}
              </span>
              <span className="text-lg font-black font-mono text-emerald-600 block">
                {summary.total_sold_qty.toLocaleString("en-US")} units
              </span>
              {selectedChannel === "all" && (
                <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-500">
                  <span className="text-blue-600">Online: {summary.total_online_qty || 0}</span>
                  <span>•</span>
                  <span className="text-emerald-600">POS: {summary.total_pos_qty || 0}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total Sold Amount */}
          <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedChannel === "pos"
                  ? "bg-emerald-100 text-emerald-700"
                  : selectedChannel === "online"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-indigo-100/70 text-indigo-700"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                {selectedChannel === "online"
                  ? "Online Sold Amount"
                  : selectedChannel === "pos"
                  ? "POS Counter Amount"
                  : "Total Sold Amount"}
              </span>
              <span className="text-lg font-black font-mono text-indigo-600 block">
                {formatCurrency(summary.total_sold_amount)}
              </span>
              {selectedChannel === "all" && (
                <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-500">
                  <span className="text-blue-600">Online: {formatCurrency(summary.total_online_amount || 0)}</span>
                  <span>•</span>
                  <span className="text-emerald-600">POS: {formatCurrency(summary.total_pos_amount || 0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Listed Products */}
          <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Products Catalog</span>
              <span className="text-lg font-black font-mono text-slate-800 block">
                {summary.total_products_count} items
              </span>
              <span className="text-[11px] font-medium text-slate-400 block mt-1">
                Showing channel: {selectedChannel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Filter Bar ─── */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex flex-wrap items-center gap-3">
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
          <div className="w-44">
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

          {/* Date Range: Start Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Date Range: End Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Reset Filters */}
          {(searchTerm || selectedCategory || startDate || endDate || selectedChannel !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedChannel("all");
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* ─── Table ─── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-white text-slate-700 text-xs sm:text-sm font-bold">
                <th className="py-4 px-5">SKU</th>
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-5">Brand</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5 text-center">Sold Qty</th>
                <th className="py-4 px-5 text-right">Sold Amount</th>
                <th className="py-4 px-5 text-center">Instock Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span className="font-bold text-xs">Loading sales report data...</span>
                    </div>
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-8 h-8 stroke-[1.5] text-slate-300" />
                      <span className="font-bold text-xs text-slate-500">
                        কোনো বিক্রয় রেকর্ড পাওয়া যায়নি (No sales records found)
                      </span>
                      <p className="text-[11px] text-slate-400">
                        ফিল্টার পরিবর্তন করুন বা অন্য কোনো তারিখ নির্বাচন করুন।
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reportData.map((item: any, idx: number) => (
                  <tr
                    key={item.product_id || idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* SKU */}
                    <td className="py-3.5 px-5 font-mono text-slate-600 font-semibold text-xs whitespace-nowrap">
                      {item.sku}
                    </td>

                    {/* Product Name with Thumbnail */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-slate-400 text-xs font-bold">
                              {item.product_name?.charAt(0) || "P"}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 line-clamp-1 max-w-xs block">
                            {item.product_name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-3.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                      {item.brand}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                      {item.category}
                    </td>

                    {/* Sold Qty with Channel Breakdown */}
                    <td className="py-3.5 px-5 text-center">
                      <span className="font-mono font-bold text-slate-800 block">
                        {String(item.sold_qty).padStart(2, "0")} units
                      </span>
                      {selectedChannel === "all" && item.sold_qty > 0 && (
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium mt-0.5">
                          <span className="text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                            🌐 {item.online_qty || 0}
                          </span>
                          <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                            🏬 {item.pos_qty || 0}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Sold Amount with Channel Breakdown */}
                    <td className="py-3.5 px-5 text-right font-mono">
                      <span className="font-black text-slate-900 block">
                        {formatCurrency(item.sold_amount)}
                      </span>
                      {selectedChannel === "all" && item.sold_amount > 0 && (
                        <div className="flex items-center justify-end gap-1.5 text-[10px] font-medium mt-0.5">
                          <span className="text-blue-600">Online: {formatCurrency(item.online_amount || 0)}</span>
                          <span>|</span>
                          <span className="text-emerald-600">POS: {formatCurrency(item.pos_amount || 0)}</span>
                        </div>
                      )}
                    </td>

                    {/* Instock Qty Badge */}
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                          Number(item.instock_qty) <= 0
                            ? "bg-rose-100 text-rose-700"
                            : Number(item.instock_qty) < 10
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.instock_qty}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Footer ─── */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.totalItems || 0}
            perPage={perPage}
            onPageChange={(p) => setCurrentPage(p)}
            onPerPageChange={(c) => {
              setPerPage(c);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
