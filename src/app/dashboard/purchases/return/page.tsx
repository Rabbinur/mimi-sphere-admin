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
  Plus,
  Package,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import Pagination from "@/components/Common/Pagination";
import { toast } from "sonner";

interface PurchaseReturnItem {
  id: string;
  productName: string;
  image: string;
  date: string;
  supplierName: string;
  reference: string;
  status: "Received" | "Pending";
  total: number;
  paid: number;
  due: number;
}

const DEFAULT_RETURNS: PurchaseReturnItem[] = [
  {
    id: "ret-1",
    productName: "Lenovo IdeaPad 3",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&auto=format&fit=crop&q=80",
    date: "24 Dec 2024",
    supplierName: "Electro Mart",
    reference: "PT001",
    status: "Received",
    total: 1000,
    paid: 1000,
    due: 0.0,
  },
  {
    id: "ret-2",
    productName: "Beats Pro",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=150&auto=format&fit=crop&q=80",
    date: "10 Dec 2024",
    supplierName: "Quantum Gadgets",
    reference: "PT002",
    status: "Pending",
    total: 1500,
    paid: 0.0,
    due: 1500,
  },
  {
    id: "ret-3",
    productName: "Nike Jordan",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
    date: "27 Nov 2024",
    supplierName: "Prime Bazaar",
    reference: "PT003",
    status: "Received",
    total: 1500,
    paid: 1800,
    due: 0.0,
  },
  {
    id: "ret-4",
    productName: "Apple Series 5 Watch",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&auto=format&fit=crop&q=80",
    date: "18 Nov 2024",
    supplierName: "Gadget World",
    reference: "PT004",
    status: "Received",
    total: 2000,
    paid: 1000,
    due: 1000,
  },
];

export default function PurchaseReturnsPage() {
  const [returnsList, setReturnsList] = useState<PurchaseReturnItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Add Return Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<PurchaseReturnItem | null>(null);

  const [formData, setFormData] = useState({
    productName: "",
    supplierName: "",
    reference: "",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status: "Received" as "Received" | "Pending",
    total: 0,
    paid: 0,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mimi_purchase_returns");
      if (stored) {
        setReturnsList(JSON.parse(stored));
      } else {
        setReturnsList(DEFAULT_RETURNS);
        localStorage.setItem("mimi_purchase_returns", JSON.stringify(DEFAULT_RETURNS));
      }
    } catch {
      setReturnsList(DEFAULT_RETURNS);
    }
  }, []);

  const saveReturns = (data: PurchaseReturnItem[]) => {
    setReturnsList(data);
    try {
      localStorage.setItem("mimi_purchase_returns", JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredReturns = returnsList
    .filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const totalItems = filteredReturns.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedReturns.map((r) => r.id));
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
    if (confirm("Remove this purchase return entry?")) {
      const updated = returnsList.filter((r) => r.id !== id);
      saveReturns(updated);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      toast.success("Purchase return removed");
    }
  };

  const handleAddReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.supplierName.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }

    const due = Math.max(0, Number(formData.total) - Number(formData.paid));
    const newItem: PurchaseReturnItem = {
      id: `ret-${Date.now()}`,
      productName: formData.productName,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80",
      date: formData.date,
      supplierName: formData.supplierName,
      reference: formData.reference || `PR00${returnsList.length + 1}`,
      status: formData.status,
      total: Number(formData.total),
      paid: Number(formData.paid),
      due: due,
    };

    saveReturns([newItem, ...returnsList]);
    setIsAddModalOpen(false);
    toast.success("Purchase return recorded successfully!");
  };

  const handleExportCSV = () => {
    const headers = ["Product Name", "Date", "Supplier Name", "Reference", "Status", "Total", "Paid", "Due"];
    const rows = filteredReturns.map((r) => [
      `"${r.productName.replace(/"/g, '""')}"`,
      `"${r.date}"`,
      `"${r.supplierName.replace(/"/g, '""')}"`,
      `"${r.reference}"`,
      `"${r.status}"`,
      `"$${r.total}"`,
      `"$${r.paid}"`,
      `"$${r.due}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchase_returns_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel / CSV report exported!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ─── Header matching Screenshot 5 ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Purchase Returns</h1>
          <p className="text-sm text-slate-500 font-normal">Manage your purchase return</p>
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
              setStatusFilter("All");
              setSortBy("7days");
              toast.info("Refreshed purchase returns");
            }}
            title="Refresh"
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs text-slate-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Collapse Button */}
          <button
            type="button"
            onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
            title={isFilterCollapsed ? "Expand Toolbar" : "Collapse Toolbar"}
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs text-slate-600"
          >
            {isFilterCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* + Add Purchase Return Button (Orange) */}
          <button
            type="button"
            onClick={() => {
              setFormData({
                productName: "",
                supplierName: "",
                reference: `PT00${returnsList.length + 1}`,
                date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                status: "Received",
                total: 0,
                paid: 0,
              });
              setIsAddModalOpen(true);
            }}
            className="bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-white font-medium text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Purchase Return</span>
          </button>
        </div>
      </div>

      {/* ─── Main White Card Container ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filters */}
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

            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-orange-500 cursor-pointer font-medium"
                >
                  <option value="All">Status: All</option>
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort By Dropdown matching screenshot */}
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
                  <option value="month">Sort By : This Month</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
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
                      paginatedReturns.length > 0 &&
                      paginatedReturns.every((r) => selectedIds.includes(r.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Product Image</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Due</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedReturns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No purchase return records found.
                  </td>
                </tr>
              ) : (
                paginatedReturns.map((item) => {
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
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span className="font-medium text-slate-800 text-sm">
                            {item.productName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                        {item.date}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.supplierName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {item.reference}
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-4">
                        {item.status === "Received" ? (
                          <span className="inline-block bg-[#10b981] text-white text-xs px-2.5 py-0.5 rounded font-medium">
                            Received
                          </span>
                        ) : (
                          <span className="inline-block bg-[#06b6d4] text-white text-xs px-2.5 py-0.5 rounded font-medium">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        ${item.total.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        ${item.paid.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        ${item.due.toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingItem(item)}
                            title="View"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* ─── Add Purchase Return Modal ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Add Purchase Return</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReturn} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lenovo IdeaPad 3"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electro Mart"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "Received" | "Pending",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Total Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Paid Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.paid}
                    onChange={(e) => setFormData({ ...formData, paid: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium"
                >
                  Save Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── View Modal ─── */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Return Details</h2>
                <p className="text-xs text-slate-500 font-mono">{viewingItem.reference}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Product:</span>
                <span className="font-semibold text-slate-800">{viewingItem.productName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-medium text-slate-700">{viewingItem.supplierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium text-slate-700">{viewingItem.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-800">{viewingItem.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total:</span>
                <span className="font-bold text-slate-900">${viewingItem.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Paid:</span>
                <span className="font-bold text-emerald-600">${viewingItem.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Due:</span>
                <span className="font-bold text-rose-600">${viewingItem.due.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
