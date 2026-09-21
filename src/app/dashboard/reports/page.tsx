"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  ShoppingBag,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Tag,
  Store,
  Globe,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Layers,
  ChevronRight,
  Clock,
  Sparkles,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import { useGetProfitLossReportQuery } from "@/components/Redux/RTK/reportsApi";
import { posOfflineSync } from "@/modules/pos/utils/posOfflineSync";
import { toast } from "sonner";

// Predefined date range presets
type DatePreset = "today" | "yesterday" | "last7days" | "thisMonth" | "lastMonth" | "thisYear" | "custom";

export default function ReportsAndAnalyticsPage() {
  const [selectedChannel, setSelectedChannel] = useState<"all" | "pos" | "online">("all");
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>("thisMonth");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Helper to get formatted YYYY-MM-DD for BST (UTC+6)
  const getBstDate = (date: Date) => {
    const bst = new Date(date.getTime() + 6 * 3600 * 1000);
    return bst.toISOString().split("T")[0];
  };

  // Set date ranges according to presets
  useEffect(() => {
    const now = new Date();
    const todayStr = getBstDate(now);

    if (selectedPreset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (selectedPreset === "yesterday") {
      const yest = new Date(now.getTime() - 24 * 3600 * 1000);
      const yestStr = getBstDate(yest);
      setStartDate(yestStr);
      setEndDate(yestStr);
    } else if (selectedPreset === "last7days") {
      const d7 = new Date(now.getTime() - 6 * 24 * 3600 * 1000);
      setStartDate(getBstDate(d7));
      setEndDate(todayStr);
    } else if (selectedPreset === "thisMonth") {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      setStartDate(`${year}-${month}-01`);
      setEndDate(todayStr);
    } else if (selectedPreset === "lastMonth") {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(getBstDate(firstDayLastMonth));
      setEndDate(getBstDate(lastDayLastMonth));
    } else if (selectedPreset === "thisYear") {
      const year = now.getFullYear();
      setStartDate(`${year}-01-01`);
      setEndDate(todayStr);
    }
  }, [selectedPreset]);

  // Track offline sync status
  useEffect(() => {
    const unsubscribe = posOfflineSync.subscribe((state) => {
      setPendingSyncCount(state.pendingCount);
    });
    return () => unsubscribe();
  }, []);

  // Fetch live Financial Profit & Loss report
  const {
    data: reportResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetProfitLossReportQuery(
    {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      channel: selectedChannel,
    },
    { refetchOnMountOrArgChange: true }
  );

  const reportData = reportResponse?.data || {};
  const summary = reportData?.summary || {
    total_sales: 0,
    product_cost: 0,
    gross_profit: 0,
    gross_margin_pct: 0,
    total_expense: 0,
    total_returns: 0,
    total_discount: 0,
    net_profit: 0,
    net_margin_pct: 0,
    total_orders: 0,
    total_items_sold: 0,
    closing_stock_valuation: 0,
  };

  const timeline = reportData?.timeline || [];
  const paymentBreakdown = reportData?.payment_breakdown || [];
  const expensesByCategory = reportData?.expenses_by_category || [];
  const topProducts = reportData?.top_products || [];
  const channels = reportData?.channels || {
    pos: { orders: 0, revenue: 0, pct: 0 },
    online: { orders: 0, revenue: 0, pct: 0 },
  };

  const formatCurrency = (val: number) => {
    return `৳${Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExportCsv = () => {
    try {
      const rows = [
        ["MIMI SPHERE - Financial Profit & Loss Statement"],
        [`Period: ${startDate} to ${endDate}`],
        [`Channel: ${selectedChannel.toUpperCase()}`],
        [`Generated At: ${new Date().toLocaleString("en-GB")}`],
        [""],
        ["Financial Metric (English)", "বিবরণ (বাংলা)", "Amount (BDT)"],
        ["Gross Sales / Revenue", "মোট বিক্রি / আয়", summary.total_sales],
        ["Cost of Goods Sold (COGS)", "পণ্যের ক্রয়মূল্য / কেনা খরচ", summary.product_cost],
        ["Gross Profit", "মোট লাভ (গ্রস প্রফিট)", summary.gross_profit],
        ["Gross Margin (%)", "গ্রস মার্জিন (%)", `${summary.gross_margin_pct}%`],
        ["Store & Operational Expenses", "দোকানের দৈনন্দিন খরচ", summary.total_expense],
        ["Customer Returns / Refunds", "ফেরত পণ্যের মূল্য", summary.total_returns],
        ["Discounts Given", "মোট দেওয়া ছাড়", summary.total_discount],
        ["Net Profit", "প্রকৃত লাভ / নিট মুনাফা", summary.net_profit],
        ["Net Profit Margin (%)", "নিট প্রফিট মার্জিন (%)", `${summary.net_margin_pct}%`],
        ["Total Orders", "অর্ডার সংখ্যা", summary.total_orders],
        ["Total Items Sold", "বিক্রিত পণ্যের পরিমাণ", summary.total_items_sold],
        ["Closing Inventory Valuation", "বর্তমান স্টকে থাকা মালের ক্রয়মূল্য", summary.closing_stock_valuation],
        [""],
        ["Top Profitable Products"],
        ["Product Title", "Quantity Sold", "Revenue (BDT)", "Cost (BDT)", "Profit (BDT)", "Margin (%)"],
        ...topProducts.map((p: any) => [
          `"${p.title.replace(/"/g, '""')}"`,
          p.quantity,
          p.revenue,
          p.cost,
          p.profit,
          `${p.margin_pct}%`,
        ]),
      ];

      const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `mimi_sphere_profit_report_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Financial statement exported to CSV successfully!");
    } catch (e) {
      toast.error("Failed to export CSV");
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  // Sync offline orders if any
  const handleForceSync = async () => {
    toast.loading("অফলাইন ডাটা সিঙ্ক করা হচ্ছে...", { id: "reports-sync" });
    await posOfflineSync.triggerAutoSync({
      onSyncSuccess: (res) => {
        toast.success(
          `✅ ${res.ordersCount}টি অফলাইন অর্ডার ও ${res.expensesCount}টি খরচ সার্ভারে সিঙ্ক হয়েছে!`,
          { id: "reports-sync" }
        );
        refetch();
      },
      onSyncError: () => {
        toast.error("সিঙ্ক করতে সমস্যা হয়েছে। ইন্টারনেট চেক করুন।", { id: "reports-sync" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ─── Top Control Header & Breadcrumbs ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/80 shadow-2xs">
              <BarChart3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Reports & Sales Analytics
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  লাভ-ক্ষতি ও সার্বিক হিসাব
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time Database P&L Statement · Cost of Goods · Expenses · Stock Valuation
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            title="Print Official Financial Statement"
          >
            <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Print Report (প্রিন্ট)</span>
          </button>
        </div>
      </div>

      {/* ─── Offline Orders Pending Banner ─── */}
      {pendingSyncCount > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-4 text-amber-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">
                ⚠️ {pendingSyncCount}টি অফলাইন অর্ডার / খরচ এখনো সার্ভারে সিঙ্ক হওয়ার অপেক্ষায় আছে!
              </h4>
              <p className="text-[11px] text-amber-700 font-medium">
                ইন্টারনেট কানেকশন পেলে এগুলো স্বয়ংক্রিয়ভাবে মূল ডাটাবেজে যুক্ত হয়ে রিপোর্টে চলে আসবে।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleForceSync}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs"
          >
            Sync Now (সিঙ্ক করুন)
          </button>
        </div>
      )}

      {/* ─── Control Bar: Channel Selector & Date Presets & Custom Range ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          {/* Channel Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setSelectedChannel("all")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedChannel === "all"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Sales (সার্বিক)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel("pos")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedChannel === "pos"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>POS Counter (কাউন্টার)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel("online")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedChannel === "online"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Online Store (অনলাইন)</span>
            </button>
          </div>

          {/* Quick Date Range Presets */}
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { id: "today", label: "আজ (Today)" },
              { id: "yesterday", label: "গতকাল (Yesterday)" },
              { id: "last7days", label: "গত ৭ দিন" },
              { id: "thisMonth", label: "চলতি মাস" },
              { id: "lastMonth", label: "গত মাস" },
              { id: "thisYear", label: "চলতি বছর" },
              { id: "custom", label: "কাস্টম রেঞ্জ" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPreset(p.id as DatePreset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPreset === p.id
                    ? "bg-[#181938] text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Start & End Date Pickers */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-bold">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>তারিখ নির্বাচন (Date Range):</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setSelectedPreset("custom");
                setStartDate(e.target.value);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setSelectedPreset("custom");
                setEndDate(e.target.value);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <span className="text-[11px] text-slate-400 font-medium ml-auto">
            Showing results from <b className="text-slate-700">{startDate}</b> to{" "}
            <b className="text-slate-700">{endDate}</b>
          </span>
        </div>
      </div>

      {/* ─── Top 6 Executive Financial KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Sales / Revenue */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <div>
              <span className="text-xs font-black text-slate-700 block">Total Revenue</span>
              <span className="text-[11px] font-semibold text-emerald-600">মোট বিক্রি</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-emerald-600 tracking-tight block">
              {formatCurrency(summary.total_sales)}
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium">
              {summary.total_orders} orders completed
            </span>
          </div>
        </div>

        {/* 2. Product Cost / COGS */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <div>
              <span className="text-xs font-black text-slate-700 block">Product Cost</span>
              <span className="text-[11px] font-semibold text-slate-500">পণ্যের কেনা খরচ</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-slate-700 tracking-tight block">
              {formatCurrency(summary.product_cost)}
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium">
              {summary.total_items_sold} items sold
            </span>
          </div>
        </div>

        {/* 3. Gross Profit */}
        <div className="p-4 rounded-2xl bg-white border border-teal-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <div>
              <span className="text-xs font-black text-slate-700 block">Gross Profit</span>
              <span className="text-[11px] font-semibold text-teal-600">মোট লাভ</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-teal-600 tracking-tight block">
              {formatCurrency(summary.gross_profit)}
            </span>
            <span className="text-[10.5px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">
              Margin: {summary.gross_margin_pct}%
            </span>
          </div>
        </div>

        {/* 4. Store Expenses */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <div>
              <span className="text-xs font-black text-slate-700 block">Store Expenses</span>
              <span className="text-[11px] font-semibold text-rose-600">দোকানের খরচ</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-rose-500 tracking-tight block">
              {formatCurrency(summary.total_expense)}
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium">
              {expensesByCategory.length} categories logged
            </span>
          </div>
        </div>

        {/* 5. Net Profit (Hero Highlight) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-indigo-200 block">Net Profit</span>
              <span className="text-[11px] font-semibold text-emerald-400">প্রকৃত লাভ (নিট)</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-emerald-300 tracking-tight block">
              {formatCurrency(summary.net_profit)}
            </span>
            <span className="text-[10.5px] text-indigo-300 font-bold">
              Net Margin: {summary.net_margin_pct}%
            </span>
          </div>
        </div>

        {/* 6. Closing Stock Valuation */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <div>
              <span className="text-xs font-black text-slate-700 block">Stock Valuation</span>
              <span className="text-[11px] font-semibold text-purple-600">বর্তমান স্টক মূল্য</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-purple-700 tracking-tight block">
              {formatCurrency(summary.closing_stock_valuation)}
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium">
              Live warehouse inventory
            </span>
          </div>
        </div>
      </div>

      {/* ─── Visual Charts Grid: Sales vs Profit Timeline & Payment Breakdown ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                Sales & Profit Timeline
              </h3>
              <p className="text-xs text-slate-500 font-medium">দিনভিত্তিক বিক্রয় ও লাভের ট্রেন্ড</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              {timeline.length} Days Recorded
            </span>
          </div>

          <div className="h-72 w-full">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "12px",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Sales Revenue (বিক্রি)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Net Profit (নিট লাভ)"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#profitGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <BarChart3 className="w-8 h-8 stroke-[1.5]" />
                <span className="text-xs font-bold">এই সময়সীমার মধ্যে কোনো সেল রেকর্ড পাওয়া যায়নি</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Distribution (1 Col) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-black text-slate-800">
              Payment Method Breakdown
            </h3>
            <p className="text-xs text-slate-500 font-medium">পেমেন্ট মাধ্যম ভিত্তিক বিশ্লেষণ</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {paymentBreakdown.length > 0 ? (
              paymentBreakdown.map((pm: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{pm.name_bn}</span>
                    <span className="font-mono text-slate-900">{formatCurrency(pm.total)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.min(100, pm.pct)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{pm.pct}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs font-bold">
                কোনো পেমেন্ট ডাটা পাওয়া যায়নি
              </div>
            )}
          </div>

          {/* Channel Share Mini Badge */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <span className="text-[10px] font-bold uppercase block">POS Counter</span>
              <span className="font-black text-sm">{channels.pos.pct}%</span>
            </div>
            <div className="p-2 bg-blue-50 text-blue-800 rounded-xl">
              <span className="text-[10px] font-bold uppercase block">Online Store</span>
              <span className="font-black text-sm">{channels.online.pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Detailed Accounting Statement Table (Itemized P&L) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Detailed Profit & Loss Statement
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              হিসাববিজ্ঞান মানসম্মত পূর্ণাঙ্গ আয়-ব্যয় ও মুনাফা বিবরণী
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">
            {startDate} ~ {endDate}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/75 text-slate-600 font-extrabold uppercase text-[10.5px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Financial Account / বিবরণ</th>
                <th className="py-3 px-4">Accounting Formula / সূত্র</th>
                <th className="py-3 px-4 text-right">Amount (BDT) / পরিমাণ</th>
                <th className="py-3 px-4 text-right">% of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Gross Revenue */}
              <tr className="hover:bg-slate-50/70 font-semibold text-slate-800">
                <td className="py-3 px-4">
                  <span className="block font-bold">Gross Sales Revenue</span>
                  <span className="text-[11px] text-slate-500 font-normal">মোট বিক্রয় আয়</span>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono text-xs">Total Sales Invoiced</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                  {formatCurrency(summary.total_sales)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">100%</td>
              </tr>

              {/* COGS */}
              <tr className="hover:bg-slate-50/70 font-semibold text-slate-800">
                <td className="py-3 px-4">
                  <span className="block font-bold">Cost of Goods Sold (COGS)</span>
                  <span className="text-[11px] text-slate-500 font-normal">পণ্যের ক্রয়মূল্য / কেনা খরচ</span>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono text-xs">Sum of (Cost Price × Qty)</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                  {formatCurrency(summary.product_cost)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {summary.total_sales > 0
                    ? `${Math.round((summary.product_cost / summary.total_sales) * 1000) / 10}%`
                    : "0%"}
                </td>
              </tr>

              {/* Gross Profit */}
              <tr className="bg-teal-50/50 hover:bg-teal-50/80 font-bold text-teal-900 border-y border-teal-100">
                <td className="py-3 px-4">
                  <span className="block font-black">Gross Profit (মোট মুনাফা)</span>
                  <span className="text-[11px] text-teal-700 font-normal">বিক্রি থেকে ক্রয়মূল্য বাদ</span>
                </td>
                <td className="py-3 px-4 text-teal-700 font-mono text-xs">Revenue - COGS</td>
                <td className="py-3 px-4 text-right font-mono font-black text-teal-700">
                  {formatCurrency(summary.gross_profit)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-teal-700">
                  {summary.gross_margin_pct}%
                </td>
              </tr>

              {/* Store Expenses */}
              <tr className="hover:bg-slate-50/70 font-semibold text-slate-800">
                <td className="py-3 px-4">
                  <span className="block font-bold">Store & Operational Expenses</span>
                  <span className="text-[11px] text-slate-500 font-normal">দোকানের দৈনন্দিন খরচ (ভাড়া/চা/বিদ্যুৎ)</span>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono text-xs">Daily Store Expenses</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                  - {formatCurrency(summary.total_expense)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {summary.total_sales > 0
                    ? `${Math.round((summary.total_expense / summary.total_sales) * 1000) / 10}%`
                    : "0%"}
                </td>
              </tr>

              {/* Sales Returns */}
              <tr className="hover:bg-slate-50/70 font-semibold text-slate-800">
                <td className="py-3 px-4">
                  <span className="block font-bold">Sales Returns & Refunds</span>
                  <span className="text-[11px] text-slate-500 font-normal">পণ্য ফেরত বা রিফান্ড মূল্য</span>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono text-xs">Refunded / Returned Orders</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                  - {formatCurrency(summary.total_returns)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {summary.total_sales > 0
                    ? `${Math.round((summary.total_returns / summary.total_sales) * 1000) / 10}%`
                    : "0%"}
                </td>
              </tr>

              {/* Total Discount Given */}
              <tr className="hover:bg-slate-50/70 font-semibold text-slate-800">
                <td className="py-3 px-4">
                  <span className="block font-bold">Total Discounts Given</span>
                  <span className="text-[11px] text-slate-500 font-normal">কুপন ও বিশেষ ছাড়</span>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono text-xs">Coupon + Manual Discounts</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-600">
                  {formatCurrency(summary.total_discount)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {summary.total_sales > 0
                    ? `${Math.round((summary.total_discount / summary.total_sales) * 1000) / 10}%`
                    : "0%"}
                </td>
              </tr>

              {/* Net Profit Row (Hero) */}
              <tr className="bg-indigo-50/80 hover:bg-indigo-50 font-black text-indigo-950 border-t-2 border-indigo-200">
                <td className="py-3.5 px-4">
                  <span className="block text-sm font-black">Net Profit (প্রকৃত লাভ / নিট মুনাফা)</span>
                  <span className="text-[11px] text-indigo-700 font-semibold">সকল খরচ বাদ দেওয়ার পর প্রকৃত আয়</span>
                </td>
                <td className="py-3.5 px-4 text-indigo-700 font-mono text-xs">Gross Profit - Expense - Returns</td>
                <td className="py-3.5 px-4 text-right font-mono text-base font-black text-indigo-700">
                  {formatCurrency(summary.net_profit)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-sm font-black text-indigo-700">
                  {summary.net_margin_pct}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Top 10 Profitable Products & Store Expense Breakdown ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Profitable Products */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                Top Profitable Products
              </h3>
              <p className="text-xs text-slate-500 font-medium">সর্বাধিক লাভ প্রদানকারী পণ্যসমূহ</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Ranked by Profit
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-96 pr-1">
            {topProducts.length > 0 ? (
              topProducts.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center font-mono font-bold text-xs text-slate-400">
                      #{idx + 1}
                    </span>
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        P
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{p.title}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {p.quantity} units sold · Rev: {formatCurrency(p.revenue)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-600 block">
                      +{formatCurrency(p.profit)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                      {p.margin_pct}% margin
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs font-bold">
                কোনো বিক্রিত পণ্য পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>

        {/* Expenses by Category Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                Store Expenses by Category
              </h3>
              <p className="text-xs text-slate-500 font-medium">দোকানের খরচের খাতভিত্তিক বিবরণ</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Total: {formatCurrency(summary.total_expense)}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
            {expensesByCategory.length > 0 ? (
              expensesByCategory.map((exp: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{exp.category}</span>
                    <span className="font-mono text-rose-600">{formatCurrency(exp.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${Math.min(100, exp.pct)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{exp.pct}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs font-bold">
                এই সময়সীমায় কোনো স্টোর খরচ রেকর্ড করা হয়নি
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Printable Financial Report Modal ─── */}
      {isPrintModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPrintModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Print Official Financial Statement</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  🖨️ Print Now (প্রিন্ট করুন)
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable A4 Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6 text-slate-800 font-sans" id="printable-statement">
              {/* Company Official Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">MIMI SPHERE</h1>
                  <p className="text-xs font-bold text-slate-600">Official Financial Profit & Loss Statement</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dhaka, Bangladesh · support@mimisphere.com</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-slate-100 font-mono text-xs font-bold rounded border border-slate-300">
                    STATEMENT #{Date.now().toString().slice(-6)}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium mt-1.5">
                    Period: <b className="text-slate-800">{startDate}</b> to <b className="text-slate-800">{endDate}</b>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Channel: <b className="text-slate-800 uppercase">{selectedChannel} SALES</b>
                  </p>
                </div>
              </div>

              {/* 3 Main Highlights */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Gross Sales Revenue</span>
                  <p className="text-base font-black font-mono text-emerald-700">{formatCurrency(summary.total_sales)}</p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-800 uppercase">Store Expenses</span>
                  <p className="text-base font-black font-mono text-rose-700">{formatCurrency(summary.total_expense)}</p>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase">Net Profit (নিট লাভ)</span>
                  <p className="text-base font-black font-mono text-indigo-700">{formatCurrency(summary.net_profit)}</p>
                </div>
              </div>

              {/* Account Breakdown Table */}
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">Account Item / বিবরণ</th>
                    <th className="p-2 border-r border-slate-300">Accounting Formula</th>
                    <th className="p-2 text-right">Amount (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border-r border-slate-200 font-bold">1. Gross Sales Revenue (মোট বিক্রি)</td>
                    <td className="p-2 border-r border-slate-200 text-slate-500">Invoiced Sales</td>
                    <td className="p-2 text-right font-mono font-bold">{formatCurrency(summary.total_sales)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 font-bold">2. Cost of Goods Sold (COGS)</td>
                    <td className="p-2 border-r border-slate-200 text-slate-500">Total Purchase Cost</td>
                    <td className="p-2 text-right font-mono font-bold">{formatCurrency(summary.product_cost)}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2 border-r border-slate-200">3. Gross Profit (মোট লাভ)</td>
                    <td className="p-2 border-r border-slate-200 text-slate-500">Revenue - COGS</td>
                    <td className="p-2 text-right font-mono font-bold text-teal-700">{formatCurrency(summary.gross_profit)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 font-bold">4. Store Daily Expenses (দোকানের খরচ)</td>
                    <td className="p-2 border-r border-slate-200 text-slate-500">Food/Rent/Utilities</td>
                    <td className="p-2 text-right font-mono font-bold text-rose-600">- {formatCurrency(summary.total_expense)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 font-bold">5. Customer Returns (ফেরত পণ্যের মূল্য)</td>
                    <td className="p-2 border-r border-slate-200 text-slate-500">Returned/Refunded</td>
                    <td className="p-2 text-right font-mono font-bold text-rose-600">- {formatCurrency(summary.total_returns)}</td>
                  </tr>
                  <tr className="bg-indigo-50 font-black text-indigo-950 border-t-2 border-indigo-300">
                    <td className="p-2.5 border-r border-slate-200 text-sm">6. Net Profit (প্রকৃত লাভ / নিট মুনাফা)</td>
                    <td className="p-2.5 border-r border-slate-200 text-indigo-700">Gross - Expense - Returns</td>
                    <td className="p-2.5 text-right font-mono text-sm text-indigo-800">{formatCurrency(summary.net_profit)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signature Blocks for Official Record */}
              <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Prepared By</p>
                  <p className="text-[10px] text-slate-500">Accountant / Cashier</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Checked By</p>
                  <p className="text-[10px] text-slate-500">Store Manager</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Approved By</p>
                  <p className="text-[10px] text-slate-500">Managing Director / Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
