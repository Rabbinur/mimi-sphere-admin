"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FileText,
  FileSpreadsheet,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Search,
  Package,
  Plus,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import Pagination from "@/components/Common/Pagination";
import { toast } from "sonner";

interface PurchaseOrderItem {
  id: string;
  productName: string;
  image: string;
  purchasedAmount: number;
  purchasedQty: number;
  instockQty: number;
  date: string;
}

const DEFAULT_ORDERS: PurchaseOrderItem[] = [
  {
    id: "po-1",
    productName: "Lenovo IdeaPad 3",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&auto=format&fit=crop&q=80",
    purchasedAmount: 1000,
    purchasedQty: 40,
    instockQty: 30,
    date: "2024-12-24",
  },
  {
    id: "po-2",
    productName: "Beats Pro",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=150&auto=format&fit=crop&q=80",
    purchasedAmount: 1500,
    purchasedQty: 25,
    instockQty: 18,
    date: "2024-12-10",
  },
  {
    id: "po-3",
    productName: "Nike Jordan",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
    purchasedAmount: 1500,
    purchasedQty: 30,
    instockQty: 35,
    date: "2024-11-27",
  },
  {
    id: "po-4",
    productName: "Apple Series 5 Watch",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&auto=format&fit=crop&q=80",
    purchasedAmount: 2000,
    purchasedQty: 28,
    instockQty: 28,
    date: "2024-11-18",
  },
  {
    id: "po-5",
    productName: "Sony WH-1000XM5 Wireless Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80",
    purchasedAmount: 1750,
    purchasedQty: 15,
    instockQty: 12,
    date: "2024-11-06",
  },
  {
    id: "po-6",
    productName: "Logitech MX Master 3S Mouse",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=80",
    purchasedAmount: 850,
    purchasedQty: 50,
    instockQty: 42,
    date: "2024-10-25",
  },
];

export default function PurchaseOrderPage() {
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Load from local storage or seed
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mimi_purchase_orders");
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        setOrders(DEFAULT_ORDERS);
        localStorage.setItem("mimi_purchase_orders", JSON.stringify(DEFAULT_ORDERS));
      }
    } catch {
      setOrders(DEFAULT_ORDERS);
    }
  }, []);

  const saveOrders = (data: PurchaseOrderItem[]) => {
    setOrders(data);
    try {
      localStorage.setItem("mimi_purchase_orders", JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  // Filter & Sort
  const filteredOrders = orders
    .filter((item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "amount_high") return b.purchasedAmount - a.purchasedAmount;
      if (sortBy === "amount_low") return a.purchasedAmount - b.purchasedAmount;
      if (sortBy === "qty_high") return b.purchasedQty - a.purchasedQty;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this purchase order entry?")) {
      const updated = orders.filter((o) => o.id !== id);
      saveOrders(updated);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      toast.success("Order item removed");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Product Name", "Purchased Amount", "Purchased QTY", "Instock QTY", "Date"];
    const rows = filteredOrders.map((o) => [
      `"${o.productName.replace(/"/g, '""')}"`,
      `"$${o.purchasedAmount}"`,
      o.purchasedQty,
      o.instockQty,
      `"${o.date}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchase_orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel / CSV exported!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ─── Header matching Screenshot 4 ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Purchase order</h1>
          <p className="text-sm text-slate-500 font-normal">Manage your Purchase order</p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            title="Download PDF"
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs group"
          >
            <span className="text-red-500 font-bold text-xs flex items-center">
              <FileText className="w-5 h-5 text-red-500" />
            </span>
          </button>

          {/* Excel Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export Excel"
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs group"
          >
            <span className="text-emerald-600 font-bold text-xs flex items-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSortBy("7days");
              toast.info("Refreshed purchase orders");
            }}
            title="Refresh"
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs text-slate-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Collapse/Expand Toolbar */}
          <button
            type="button"
            onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
            title={isFilterCollapsed ? "Expand Toolbar" : "Collapse Toolbar"}
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs text-slate-600"
          >
            {isFilterCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── Main White Card Container ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Sort Toolbar */}
        {!isFilterCollapsed && (
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Sort Dropdown matching screenshot */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-orange-500 cursor-pointer font-medium"
              >
                <option value="7days">Sort By : Last 7 Days</option>
                <option value="30days">Sort By : Last 30 Days</option>
                <option value="amount_high">Sort By : Purchased Amount (High to Low)</option>
                <option value="amount_low">Sort By : Purchased Amount (Low to High)</option>
                <option value="qty_high">Sort By : Purchased QTY</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* ─── Table ─── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-slate-700 font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedOrders.length > 0 &&
                      paginatedOrders.every((o) => selectedIds.includes(o.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Purchased Amount</th>
                <th className="py-3.5 px-4">Purchased QTY</th>
                <th className="py-3.5 px-4">Instock QTY</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No purchase orders found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-orange-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                        />
                      </td>

                      {/* Product Thumbnail + Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-slate-800 block text-sm">
                              {item.productName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Purchased Amount */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        ${item.purchasedAmount.toLocaleString()}
                      </td>

                      {/* Purchased QTY */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {item.purchasedQty}
                      </td>

                      {/* Instock QTY */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.instockQty < 20
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.instockQty}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Remove item"
                          className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Footer ─── */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(count) => {
              setPerPage(count);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
