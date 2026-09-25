"use client";

import React, { useState } from "react";
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
  Trash2,
  Check,
  Building2,
  Calendar,
  DollarSign,
  Printer,
  X
} from "lucide-react";
import Pagination from "@/components/Common/Pagination";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAllPurchasesQuery, useDeletePurchaseMutation, useUpdatePurchaseMutation } from "@/components/Redux/RTK/purchaseApi";
import Image from "next/image";

export default function PurchasesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data: purchasesData, isLoading, refetch } = useAllPurchasesQuery(searchTerm);
  const [deletePurchase] = useDeletePurchaseMutation();
  const [updatePurchase] = useUpdatePurchaseMutation();

  const rawPurchases = purchasesData?.data || [];

  const [viewingPurchase, setViewingPurchase] = useState<any | null>(null);
  const [chalanImageToView, setChalanImageToView] = useState<string | null>(null);

  // Filtered list
  const filteredPurchases = rawPurchases.filter((item: any) => {
    const matchesPayment =
      selectedPaymentStatus === "All" || item.paymentStatus.toLowerCase() === selectedPaymentStatus.toLowerCase();
    const matchesStatus =
      selectedStatus === "All" || item.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesPayment && matchesStatus;
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
      setSelectedIds(paginatedPurchases.map((p: any) => p._id));
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
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this purchase entry?")) {
      try {
        await deletePurchase(id).unwrap();
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        toast.success("Purchase entry removed successfully");
        refetch();
      } catch (e: any) {
        toast.error("Failed to delete purchase");
      }
    }
  };

  const markAsReceived = async (id: string) => {
    if (confirm("Mark this purchase as Received? This will update inventory stock.")) {
      try {
        await updatePurchase({ id, data: { status: "Received" } }).unwrap();
        toast.success("Purchase marked as Received. Inventory updated.");
        refetch();
      } catch (e: any) {
        toast.error("Failed to update status");
      }
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Page Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Purchase</h1>
          <p className="text-sm text-slate-500 font-normal">Manage your purchases</p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            title="Download PDF"
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <span className="text-red-500 font-bold text-xs flex items-center">
              <FileText className="w-5 h-5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedPaymentStatus("All");
              setSelectedStatus("All");
              refetch();
            }}
            title="Refresh"
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs text-slate-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/purchases/order")}
            className="bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-white font-medium text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Purchase</span>
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
                placeholder="Search by Reference..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
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

              <div className="relative">
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => {
                    setSelectedPaymentStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-orange-500 cursor-pointer font-medium"
                >
                  <option value="All">Payment: All</option>
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
                    checked={paginatedPurchases.length > 0 && paginatedPurchases.every((p: any) => selectedIds.includes(p._id))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Due</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr><td colSpan={10} className="py-12 text-center text-slate-500">Loading purchases...</td></tr>
              ) : paginatedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No purchase records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((item: any) => {
                  const isSelected = selectedIds.includes(item._id);
                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/70 transition-colors ${isSelected ? "bg-orange-50/40" : ""}`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectItem(item._id, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.supplierId?.name || "Unknown"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {item.reference}
                        {item.chalanImage && (
                          <button onClick={() => setChalanImageToView(item.chalanImage)} className="block mt-1 text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                            <Eye className="w-3 h-3"/> View Chalan
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4">
                        {item.status === "Received" && <span className="bg-[#10b981] text-white text-xs px-2.5 py-0.5 rounded font-medium">Received</span>}
                        {item.status === "Pending" && <span className="bg-[#06b6d4] text-white text-xs px-2.5 py-0.5 rounded font-medium">Pending</span>}
                        {item.status === "Ordered" && <span className="bg-[#f59e0b] text-white text-xs px-2.5 py-0.5 rounded font-medium">Ordered</span>}
                        
                        {item.status !== "Received" && (
                          <button onClick={() => markAsReceived(item._id)} className="ml-2 mt-1 block text-[10px] text-orange-500 hover:underline">Mark Received</button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">৳{item.grandTotal.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-medium text-emerald-600">৳{item.paidAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">৳{item.dueAmount.toLocaleString()}</td>

                      <td className="py-3.5 px-4">
                        {item.paymentStatus === "Paid" && <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/80 text-xs px-2.5 py-0.5 rounded-full font-medium">Paid</span>}
                        {item.paymentStatus === "Unpaid" && <span className="bg-rose-50 text-rose-600 border border-rose-200/80 text-xs px-2.5 py-0.5 rounded-full font-medium">Unpaid</span>}
                        {item.paymentStatus === "Overdue" && <span className="bg-amber-50 text-amber-600 border border-amber-200/80 text-xs px-2.5 py-0.5 rounded-full font-medium">Overdue</span>}
                      </td>

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
                            onClick={() => handleDelete(item._id)}
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={(count) => {
              setPerPage(count);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Chalan Image Viewer Modal */}
      {chalanImageToView && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="relative bg-white p-2 rounded-xl max-w-3xl w-full">
            <button onClick={() => setChalanImageToView(null)} className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow-lg">
              <X className="w-5 h-5 text-slate-800" />
            </button>
            <img src={chalanImageToView} alt="Chalan" className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Details Viewer Modal (Simplistic for now) */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Purchase Details: {viewingPurchase.reference}</h2>
              <button onClick={() => setViewingPurchase(null)} className="p-1 rounded-lg hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <p><strong>Supplier:</strong> {viewingPurchase.supplierId?.name}</p>
              <p><strong>Date:</strong> {new Date(viewingPurchase.date).toLocaleDateString()}</p>
              <h3 className="font-bold text-slate-700 mt-4">Items:</h3>
              <table className="w-full text-sm border">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border">Qty</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingPurchase.items?.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 border">{it.productId?.product_title || 'N/A'}</td>
                      <td className="p-2 border text-center">{it.quantity}</td>
                      <td className="p-2 border text-right">৳{it.unitPrice}</td>
                      <td className="p-2 border text-right font-bold">৳{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
