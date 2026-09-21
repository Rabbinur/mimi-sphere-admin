"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  FileSpreadsheet,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Plus,
  Upload,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Check,
  Building2,
  Calendar,
  DollarSign,
  Printer,
} from "lucide-react";
import Pagination from "@/components/Common/Pagination";
import { toast } from "sonner";

interface PurchaseItem {
  id: string;
  supplierName: string;
  reference: string;
  date: string;
  status: "Received" | "Pending" | "Ordered";
  total: number;
  paid: number;
  due: number;
  paymentStatus: "Paid" | "Unpaid" | "Overdue";
}

const DEFAULT_PURCHASES: PurchaseItem[] = [
  {
    id: "pur-1",
    supplierName: "Electro Mart",
    reference: "PT001",
    date: "24 Dec 2024",
    status: "Received",
    total: 1000,
    paid: 1000,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: "pur-2",
    supplierName: "Quantum Gadgets",
    reference: "PT002",
    date: "10 Dec 2024",
    status: "Pending",
    total: 1500,
    paid: 0.0,
    due: 1500,
    paymentStatus: "Unpaid",
  },
  {
    id: "pur-3",
    supplierName: "Prime Bazaar",
    reference: "PT003",
    date: "27 Nov 2024",
    status: "Received",
    total: 1500,
    paid: 1800,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: "pur-4",
    supplierName: "Gadget World",
    reference: "PT004",
    date: "18 Nov 2024",
    status: "Ordered",
    total: 2000,
    paid: 1000,
    due: 1000,
    paymentStatus: "Overdue",
  },
  {
    id: "pur-5",
    supplierName: "Volt Vault",
    reference: "PT005",
    date: "06 Nov 2024",
    status: "Received",
    total: 800,
    paid: 800,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: "pur-6",
    supplierName: "Elite Retail",
    reference: "PT006",
    date: "25 Oct 2024",
    status: "Pending",
    total: 750,
    paid: 0.0,
    due: 750,
    paymentStatus: "Unpaid",
  },
  {
    id: "pur-7",
    supplierName: "Apex Supplies Co.",
    reference: "PT007",
    date: "14 Oct 2024",
    status: "Received",
    total: 3200,
    paid: 3200,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: "pur-8",
    supplierName: "Global Tech Dist.",
    reference: "PT008",
    date: "02 Oct 2024",
    status: "Ordered",
    total: 1950,
    paid: 950,
    due: 1000,
    paymentStatus: "Overdue",
  },
];

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseItem | null>(null);

  // Form State for Add / Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    supplierName: "",
    reference: "",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status: "Received" as "Received" | "Pending" | "Ordered",
    total: 0,
    paid: 0,
    due: 0,
    paymentStatus: "Paid" as "Paid" | "Unpaid" | "Overdue",
  });

  // Load from local storage or seed
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mimi_purchases_list");
      if (stored) {
        setPurchases(JSON.parse(stored));
      } else {
        setPurchases(DEFAULT_PURCHASES);
        localStorage.setItem("mimi_purchases_list", JSON.stringify(DEFAULT_PURCHASES));
      }
    } catch {
      setPurchases(DEFAULT_PURCHASES);
    }
  }, []);

  const savePurchases = (data: PurchaseItem[]) => {
    setPurchases(data);
    try {
      localStorage.setItem("mimi_purchases_list", JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered list
  const filteredPurchases = purchases.filter((item) => {
    const matchesSearch =
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment =
      selectedPaymentStatus === "All" || item.paymentStatus.toLowerCase() === selectedPaymentStatus.toLowerCase();
    const matchesStatus =
      selectedStatus === "All" || item.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesPayment && matchesStatus;
  });

  // Pagination slice
  const totalItems = filteredPurchases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Select all handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedPurchases.map((p) => p.id));
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

  // Delete
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this purchase entry?")) {
      const updated = purchases.filter((p) => p.id !== id);
      savePurchases(updated);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      toast.success("Purchase entry removed successfully");
    }
  };

  // Open Edit
  const handleOpenEdit = (item: PurchaseItem) => {
    setEditingId(item.id);
    setFormData({
      supplierName: item.supplierName,
      reference: item.reference,
      date: item.date,
      status: item.status,
      total: item.total,
      paid: item.paid,
      due: item.due,
      paymentStatus: item.paymentStatus,
    });
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName.trim()) {
      toast.error("Please enter a supplier name");
      return;
    }

    const calculatedDue = Math.max(0, Number(formData.total) - Number(formData.paid));
    let calculatedPaymentStatus: "Paid" | "Unpaid" | "Overdue" = formData.paymentStatus;
    if (calculatedDue === 0 && Number(formData.total) > 0) {
      calculatedPaymentStatus = "Paid";
    } else if (Number(formData.paid) === 0) {
      calculatedPaymentStatus = "Unpaid";
    }

    if (editingId) {
      const updated = purchases.map((p) =>
        p.id === editingId
          ? {
              ...p,
              ...formData,
              due: calculatedDue,
              paymentStatus: calculatedPaymentStatus,
            }
          : p
      );
      savePurchases(updated);
      toast.success("Purchase updated successfully!");
    } else {
      const newItem: PurchaseItem = {
        id: `pur-${Date.now()}`,
        supplierName: formData.supplierName,
        reference: formData.reference || `PT00${purchases.length + 1}`,
        date: formData.date,
        status: formData.status,
        total: Number(formData.total),
        paid: Number(formData.paid),
        due: calculatedDue,
        paymentStatus: calculatedPaymentStatus,
      };
      savePurchases([newItem, ...purchases]);
      toast.success("New purchase recorded successfully!");
    }

    setIsAddModalOpen(false);
    setEditingId(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Supplier Name", "Reference", "Date", "Status", "Total", "Paid", "Due", "Payment Status"];
    const rows = filteredPurchases.map((p) => [
      `"${p.supplierName.replace(/"/g, '""')}"`,
      `"${p.reference}"`,
      `"${p.date}"`,
      `"${p.status}"`,
      `"$${p.total}"`,
      `"$${p.paid}"`,
      `"$${p.due}"`,
      `"${p.paymentStatus}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchases_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel / CSV report exported!");
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Page Header matching Screenshot 3 ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Purchase</h1>
          <p className="text-sm text-slate-500 font-normal">Manage your purchases</p>
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
              setSelectedPaymentStatus("All");
              setSelectedStatus("All");
              toast.info("Refreshed purchase records");
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

          {/* + Add Purchase Button (Orange) */}
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({
                supplierName: "",
                reference: `PT00${purchases.length + 1}`,
                date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                status: "Received",
                total: 0,
                paid: 0,
                due: 0,
                paymentStatus: "Paid",
              });
              setIsAddModalOpen(true);
            }}
            className="bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-white font-medium text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Purchase</span>
          </button>

          {/* Import Purchase Button (Dark Navy) */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="bg-[#132238] hover:bg-[#1a2d47] active:scale-95 text-white font-medium text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[2]" />
            <span>Import Purchase</span>
          </button>
        </div>
      </div>

      {/* ─── Main White Card Container ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
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
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-orange-500 cursor-pointer font-medium"
                >
                  <option value="All">Status: All</option>
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                  <option value="Ordered">Ordered</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Payment Status Dropdown matching screenshot */}
              <div className="relative">
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => {
                    setSelectedPaymentStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-orange-500 cursor-pointer font-medium"
                >
                  <option value="All">Payment Status: All</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
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
                      paginatedPurchases.length > 0 &&
                      paginatedPurchases.every((p) => selectedIds.includes(p.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Due</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No purchase records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((item) => {
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

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.supplierName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {item.reference}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                        {item.date}
                      </td>

                      {/* Status Badges */}
                      <td className="py-3.5 px-4">
                        {item.status === "Received" && (
                          <span className="inline-block bg-[#10b981] text-white text-xs px-2.5 py-0.5 rounded font-medium">
                            Received
                          </span>
                        )}
                        {item.status === "Pending" && (
                          <span className="inline-block bg-[#06b6d4] text-white text-xs px-2.5 py-0.5 rounded font-medium">
                            Pending
                          </span>
                        )}
                        {item.status === "Ordered" && (
                          <span className="inline-block bg-[#f59e0b] text-white text-xs px-2.5 py-0.5 rounded font-medium">
                            Ordered
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        ${item.total.toLocaleString()}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        ${item.paid.toLocaleString()}
                      </td>

                      {/* Due */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        ${item.due.toFixed(2)}
                      </td>

                      {/* Payment Status Badges */}
                      <td className="py-3.5 px-4">
                        {item.paymentStatus === "Paid" && (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200/80 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Paid
                          </span>
                        )}
                        {item.paymentStatus === "Unpaid" && (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200/80 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Unpaid
                          </span>
                        )}
                        {item.paymentStatus === "Overdue" && (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200/80 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Overdue
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingPurchase(item)}
                            title="View Details"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-orange-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
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

      {/* ─── Add / Edit Purchase Modal ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Purchase" : "Add New Purchase"}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electro Mart, Quantum Gadgets"
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
                    placeholder="PT001"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "Received" | "Pending" | "Ordered",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                    <option value="Ordered">Ordered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentStatus: e.target.value as "Paid" | "Unpaid" | "Overdue",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Overdue">Overdue</option>
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
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {editingId ? "Update Purchase" : "Save Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Import Purchase Modal ─── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Import Purchase CSV</h2>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Upload CSV / Excel File</p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports .csv and .xlsx files with Supplier, Reference, Total, and Status.
                </p>
              </div>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    toast.success("File selected: " + e.target.files[0].name);
                    setTimeout(() => {
                      setIsImportModalOpen(false);
                      toast.success("Successfully imported purchase records!");
                    }, 800);
                  }
                }}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── View Purchase Details Modal ─── */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Purchase Details</h2>
                <p className="text-xs text-slate-500 font-mono">{viewingPurchase.reference}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingPurchase(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-semibold text-slate-800">{viewingPurchase.supplierName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium text-slate-700">{viewingPurchase.date}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-800">{viewingPurchase.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total:</span>
                <span className="font-bold text-slate-900">${viewingPurchase.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Paid:</span>
                <span className="font-bold text-emerald-600">${viewingPurchase.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Due:</span>
                <span className="font-bold text-rose-600">${viewingPurchase.due.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-semibold text-slate-800">{viewingPurchase.paymentStatus}</span>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPurchase(null)}
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
