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
    total_products_count: 0,
  };

  const formatCurrency = (val: number) => {
    return `৳${Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // 1. Export CSV / Excel
  const handleExportExcel = () => {
    try {
      const headers = ["SKU", "Product Name", "Brand", "Category", "Sold Qty", "Sold Amount", "Instock Qty"];
      const rows = reportData.map((item: any) => [
        `"${item.sku}"`,
        `"${item.product_name.replace(/"/g, '""')}"`,
        `"${item.brand}"`,
        `"${item.category}"`,
        item.sold_qty,
        item.sold_amount,
        item.instock_qty,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        [
          ["MIMI SPHERE - Sales Report"],
          [`Date Range: ${startDate || "All-time"} to ${endDate || "Present"}`],
          [`Channel: ${selectedChannel.toUpperCase()}`],
          [""],
          headers,
          ...rows,
        ]
          .map((e) => e.join(","))
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `mimi_sphere_sales_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Excel / CSV report exported successfully!");
    } catch {
      toast.error("Failed to export report");
    }
  };

  // 2. Export / Print PDF
  const handlePrint = () => {
    window.print();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedChannel("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    toast.info("Filters reset to default");
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Main Card Container ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Card Header matching reference image */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Sales Report
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              বিক্রিত পণ্যের বিবরণী ও ইনভেন্টরি স্টক রিপোর্ট
            </p>
          </div>

          {/* Action Export Buttons (Matching user screenshot: PDF, XLS, Print) */}
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

        {/* ─── Summary Badges Bar ─── */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Sold Qty</span>
              <span className="text-base font-black font-mono text-emerald-600">
                {summary.total_sold_qty.toLocaleString("en-US")} units
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Sold Amount</span>
              <span className="text-base font-black font-mono text-indigo-600">
                {formatCurrency(summary.total_sold_amount)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Products Sold</span>
              <span className="text-base font-black font-mono text-slate-800">
                {summary.total_products_count} items listed
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

          {/* Channel Filter (All, POS, Online) */}
          <div className="w-36">
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="pos">POS Counter</option>
              <option value="online">Online Store</option>
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

          {/* Refresh & Reset Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => refetch()}
              title="Refresh Data"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
            </button>

            {(searchTerm || selectedCategory || selectedChannel !== "all" || startDate || endDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Sales Report Table (Matching User Screenshot Layout) ─── */}
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
                        <span className="font-bold text-slate-800 line-clamp-1 max-w-xs">
                          {item.product_name}
                        </span>
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

                    {/* Sold Qty */}
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-800">
                      {String(item.sold_qty).padStart(2, "0")}
                    </td>

                    {/* Sold Amount */}
                    <td className="py-3.5 px-5 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                      {formatCurrency(item.sold_amount)}
                    </td>

                    {/* Instock Qty */}
                    <td className="py-3.5 px-5 text-center font-mono font-semibold text-slate-600">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.instock_qty <= 0
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : item.instock_qty <= 10
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
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

        {/* ─── Bottom Pagination Bar ─── */}
        {pagination.totalPages > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
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
