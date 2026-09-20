"use client";

import React, { useState } from "react";
import {
  X,
  RefreshCw,
  Plus,
  Loader2,
  TrendingUp,
  ReceiptText,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import {
  useGetPosTodayProfitQuery,
  useCreatePosExpenseMutation,
} from "@/components/Redux/RTK/posApi";
import { toast } from "sonner";

interface PosTodayProfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData?: any;
}

export function PosTodayProfitModal({
  isOpen,
  onClose,
  shiftData: initialShiftData,
}: PosTodayProfitModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<"all" | "pos" | "online">("all");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food & Refreshment");
  const [expenseNotes, setExpenseNotes] = useState("");

  const {
    data: liveProfitResponse,
    isLoading: isFetchingSummary,
    refetch,
  } = useGetPosTodayProfitQuery(
    { channel: selectedChannel },
    { skip: !isOpen, refetchOnMountOrArgChange: true }
  );

  const [createExpense, { isLoading: isSubmittingExpense }] = useCreatePosExpenseMutation();

  if (!isOpen) return null;

  // Prefer active live query response when available, fallback to passed initial data
  const data = (liveProfitResponse as any)?.data || liveProfitResponse || initialShiftData || {};

  const totalSales = Number(data.product_revenue ?? data.total_sales ?? 0);
  const productCost = Number(data.product_cost ?? 0);
  const expense = Number(data.total_expense ?? 0);
  const totalStockAdjustment = Number(data.total_stock_adjustment ?? 0);
  const depositPayment = Number(data.deposit_payment ?? 0);
  const purchaseShippingCost = Number(data.total_purchase_shipping_cost ?? 0);
  const totalDiscount = Number(data.total_sell_discount ?? data.total_discount ?? 0);
  const totalReturns = Number(data.total_sell_return ?? data.total_returns ?? 0);
  const closingStock = Number(data.closing_stock ?? 0);
  const totalProfit = Number(
    data.total_profit ??
    data.net_profit ??
    Math.max(0, totalSales - productCost - expense - totalReturns)
  );

  const formatAmount = (num: number) => {
    return `৳${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseTitle.trim() || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid title and positive amount");
      return;
    }

    try {
      await createExpense({
        title: expenseTitle.trim(),
        amount: amt,
        category: expenseCategory,
        notes: expenseNotes.trim(),
      }).unwrap();

      toast.success("Expense recorded successfully!");
      setExpenseTitle("");
      setExpenseAmount("");
      setExpenseNotes("");
      setIsAddingExpense(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add expense");
    }
  };

  const rows = [
    {
      label: "Product Revenue",
      bangla: "মোট বিক্রি / আয়",
      value: formatAmount(totalSales),
      bg: "bg-slate-50",
    },
    {
      label: "Product Cost",
      bangla: "পণ্যের কেনা খরচ",
      value: formatAmount(productCost),
      bg: "bg-white",
    },
    {
      label: "Expense",
      bangla: "দোকানের দৈনন্দিন খরচ",
      value: formatAmount(expense),
      bg: "bg-slate-50",
    },
    {
      label: "Total Stock Adjustment",
      bangla: "স্টক সমন্বয় / ঘাটতি",
      value: formatAmount(totalStockAdjustment),
      bg: "bg-white",
    },
    {
      label: "Deposit Payment",
      bangla: "অগ্রিম / ডিপোজিট পেমেন্ট",
      value: formatAmount(depositPayment),
      bg: "bg-slate-50",
    },
    {
      label: "Total Purchase Shipping Cost",
      bangla: "ডেলিভারি / শিপিং খরচ",
      value: formatAmount(purchaseShippingCost),
      bg: "bg-white",
    },
    {
      label: "Total Sell Discount",
      bangla: "মোট দেওয়া ছাড়",
      value: formatAmount(totalDiscount),
      bg: "bg-slate-50",
    },
    {
      label: "Total Sell Return",
      bangla: "ফেরত পণ্যের মূল্য",
      value: formatAmount(totalReturns),
      bg: "bg-white",
    },
    {
      label: "Closing Stock",
      bangla: "দোকানে অবশিষ্ট পণ্যের স্টক মূল্য",
      value: formatAmount(closingStock),
      bg: "bg-slate-50",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4">
        <div
          className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-3.5 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800 leading-tight">
                    Today's Profit
                  </h3>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    আজকের লাভ ও হিসাব
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {data.date || new Date().toISOString().split("T")[0]} · লাইভ ডাটাবেজ হিসাব
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                title="Refresh Live Data"
                className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isFetchingSummary ? "animate-spin text-purple-600" : ""}`}
                />
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Channel Selector Pills */}
          <div className="px-6 pt-3 pb-1 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedChannel("all")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  selectedChannel === "all"
                    ? "bg-white text-purple-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>All Sales</span>
                <span className="text-[10.5px] opacity-75 font-normal">(সার্বিক)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel("pos")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  selectedChannel === "pos"
                    ? "bg-white text-purple-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>POS Counter</span>
                <span className="text-[10.5px] opacity-75 font-normal">(কাউন্টার)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel("online")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  selectedChannel === "online"
                    ? "bg-white text-purple-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Online Store</span>
                <span className="text-[10.5px] opacity-75 font-normal">(অনলাইন)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingExpense((prev) => !prev)}
              className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>+ খরচ লিখুন (Expense)</span>
            </button>
          </div>

          {/* Expandable Add Expense Form */}
          {isAddingExpense && (
            <form
              onSubmit={handleAddExpense}
              className="px-6 py-3 bg-rose-50/40 border-b border-rose-100 animate-in slide-in-from-top-2 duration-150 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">
                  দোকানের আজকের খরচ এন্ট্রি করুন (Record Expense)
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="খরচের বিবরণ (যেমন: চা/নাস্তা)"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="টাকার পরিমাণ (৳)"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Food & Refreshment">চা / নাস্তা (Food)</option>
                  <option value="Transport">যাতায়াত (Transport)</option>
                  <option value="Utilities">বিদ্যুৎ / ইউটিলিটি</option>
                  <option value="Rent">দোকান ভাড়া (Rent)</option>
                  <option value="Supplies">সরঞ্জাম / পলিথিন</option>
                  <option value="Maintenance">মেরামত (Maintenance)</option>
                  <option value="General">অন্যান্য (General)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-60"
                >
                  {isSubmittingExpense ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>খরচ সেভ করুন (Save)</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Content */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {/* Top 3 Stat Cards Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Total Sale - Green */}
              <div className="p-3.5 rounded-xl border-2 border-emerald-400/80 bg-emerald-50/40 flex flex-col justify-between transition-all hover:shadow-xs">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Total Sale</span>
                  <span className="text-[10.5px] font-semibold text-emerald-700">মোট বিক্রি</span>
                </div>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-600 mt-1 truncate">
                  ৳{Math.round(totalSales).toLocaleString("en-US")}
                </span>
              </div>

              {/* Expense - Red */}
              <div className="p-3.5 rounded-xl border-2 border-rose-400/80 bg-rose-50/40 flex flex-col justify-between transition-all hover:shadow-xs">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Expense</span>
                  <span className="text-[10.5px] font-semibold text-rose-700">দোকানের খরচ</span>
                </div>
                <span className="text-base sm:text-lg font-black font-mono text-rose-500 mt-1 truncate">
                  ৳{Math.round(expense).toLocaleString("en-US")}
                </span>
              </div>

              {/* Total Profit - Blue */}
              <div className="p-3.5 rounded-xl border-2 border-blue-400/80 bg-blue-50/40 flex flex-col justify-between transition-all hover:shadow-xs">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Total Profit</span>
                  <span className="text-[10.5px] font-semibold text-blue-700">মোট লাভ</span>
                </div>
                <span className="text-base sm:text-lg font-black font-mono text-blue-600 mt-1 truncate">
                  ৳{Math.round(totalProfit).toLocaleString("en-US")}
                </span>
              </div>
            </div>

            {/* Rows Breakdown Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200/80">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm ${row.bg} text-slate-700 hover:bg-slate-100/60 transition-colors`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
                    <span className="text-slate-800 font-semibold">{row.label}</span>
                    <span className="text-[11px] text-slate-500 font-medium font-sans">
                      ({row.bangla})
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0 ml-3">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer Action */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 font-medium">
                {data.total_orders ?? 0} order{(data.total_orders ?? 0) === 1 ? "" : "s"} today
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#ff9f43] hover:bg-[#f39c12] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
