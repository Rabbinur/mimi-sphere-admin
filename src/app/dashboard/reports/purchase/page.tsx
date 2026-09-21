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
} from "lucide-react";
import Pagination from "@/components/Common/Pagination";
import { useGetPurchaseReportQuery } from "@/components/Redux/RTK/reportsApi";
import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi";
import { toast } from "sonner";

export default function PurchaseReportPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

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
    },
    { refetchOnMountOrArgChange: true }
  );

  const reportData = purchaseResponse?.data || [];
  const pagination = purchaseResponse?.pagination || {
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 1,
  };
  const summary = purchaseResponse?.summary || {
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
      const rows = reportData.map((item: any) => [
        `"${item.sku}"`,
        `"${item.product_name.replace(/"/g, '""')}"`,
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
        [["MIMI SPHERE - Purchase & Inventory Report"], [""], headers, ...rows]
          .map((e) => e.join(","))
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `mimi_sphere_purchase_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Excel / CSV report exported successfully!");
    } catch {
      toast.error("Failed to export report");
    }
  };

  const handlePrint = () => {
    window.print();
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
          <div className="flex items-center gap-2 self-start sm:self-auto">
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

        {/* ─── Filter Bar ─── */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
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
          <div className="w-52">
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

            {(searchTerm || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
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

        {/* ─── Purchase Report Table ─── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-white text-slate-700 text-xs sm:text-sm font-bold">
                <th className="py-4 px-5">SKU</th>
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-5">Brand</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5 text-right">Unit Cost</th>
                <th className="py-4 px-5 text-center">Instock Qty</th>
                <th className="py-4 px-5 text-right">Total Valuation</th>
                <th className="py-4 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span className="font-bold text-xs">Loading purchase inventory data...</span>
                    </div>
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 stroke-[1.5] text-slate-300" />
                      <span className="font-bold text-xs text-slate-500">
                        কোনো প্রোডাক্ট রেকর্ড পাওয়া যায়নি
                      </span>
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

                    {/* Unit Cost */}
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-700 whitespace-nowrap">
                      {formatCurrency(item.unit_cost)}
                    </td>

                    {/* Instock Qty */}
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-800">
                      {item.instock_qty}
                    </td>

                    {/* Total Stock Value */}
                    <td className="py-3.5 px-5 text-right font-mono font-black text-purple-700 whitespace-nowrap">
                      {formatCurrency(item.total_stock_value)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.stock_status === "In Stock"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.stock_status === "Low Stock"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-600 border border-rose-200"
                        }`}
                      >
                        {item.stock_status}
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
