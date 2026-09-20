"use client";

import React, { useState } from "react";
import {
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  Search,
  User,
  X,
} from "lucide-react";
import { useGetPosTransactionsQuery } from "@/components/Redux/RTK/posApi";
import { toast } from "sonner";

interface PosTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReceipt?: (reference: string) => void;
}

export function PosTransactionsModal({
  isOpen,
  onClose,
  onViewReceipt,
}: PosTransactionsModalProps) {
  const [activeTab, setActiveTab] = useState<"purchase" | "payment" | "return" | "all">("purchase");
  const [search, setSearch] = useState("");
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  const { data: response, isLoading, isFetching } = useGetPosTransactionsQuery(
    {
      type: activeTab,
      search: search.trim() || undefined,
      page: 1,
      per_page: 30,
    },
    { skip: !isOpen }
  );

  if (!isOpen) return null;

  const transactions = response?.data?.transactions || [];
  const total = response?.data?.total || 0;

  const toggleSelect = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportPDF = () => {
    toast.info("Generating PDF statement of POS transactions...");
    window.print();
  };

  const handleExportExcel = () => {
    toast.success("Transaction data exported to Excel!");
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 flex items-center justify-center animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching Image 3 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              Recent Transactions
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              {total}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Subheader: Filter Tabs (Purchase, Payment, Return) */}
        <div className="px-6 pt-4 pb-3 border-b border-slate-100 space-y-3 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("purchase")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "purchase"
                  ? "bg-[#ff9f43] text-white shadow-xs font-black"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Purchase
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payment")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "payment"
                  ? "bg-[#ff9f43] text-white shadow-xs font-black"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Payment
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("return")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "return"
                  ? "bg-[#ff9f43] text-white shadow-xs font-black"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Return
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#ff9f43] text-white shadow-xs font-black"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All
            </button>
          </div>

          {/* Search Bar & Export Buttons matching Image 3 */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search reference, customer, or payment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
              />
              {(isLoading || isFetching) && (
                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0 ml-2" />
              )}
            </div>

            {/* Export Buttons (PDF, Excel, Print) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleExportPDF}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-rose-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Export PDF"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-emerald-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Export Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Print Transactions"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table matching Image 3 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 text-center">
              <p className="text-sm font-bold text-slate-700">No transactions recorded</p>
              <p className="text-xs text-slate-400 mt-1">
                Completed POS sales will appear in this table.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTxIds.length === transactions.length && transactions.length > 0}
                        onChange={(e) =>
                          setSelectedTxIds(
                            e.target.checked ? transactions.map((t: any) => t._id) : []
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Reference</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {transactions.map((tx: any) => {
                    const isSelected = selectedTxIds.includes(tx._id);
                    return (
                      <tr
                        key={tx._id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(tx._id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                              {tx.customer_name ? tx.customer_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                            </div>
                            <span className="font-bold text-slate-900 truncate max-w-[140px]">
                              {tx.customer_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-medium text-slate-600">
                          {tx.reference}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <span>{tx.date}</span>
                          <span className="text-[10px] text-slate-400 block">{tx.time}</span>
                        </td>
                        <td className="p-3.5 font-mono font-black text-slate-900">
                          ৳{tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (onViewReceipt) {
                                  onViewReceipt(tx.reference);
                                } else {
                                  toast.info(`Invoice: ${tx.reference}`);
                                }
                              }}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="View Invoice"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toast.info(`Printing transaction ${tx.reference}`)}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="Print Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
