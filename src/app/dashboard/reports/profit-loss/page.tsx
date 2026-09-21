"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  ShoppingBag,
  Store,
  Globe,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useGetProfitLossReportQuery } from "@/components/Redux/RTK/reportsApi";
import { posOfflineSync } from "@/modules/pos/utils/posOfflineSync";
import { toast } from "sonner";

type DatePreset = "today" | "yesterday" | "last7days" | "thisMonth" | "lastMonth" | "thisYear" | "custom";

export default function ProfitLossReportPage() {
  const [selectedChannel, setSelectedChannel] = useState<"all" | "pos" | "online">("all");
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>("thisMonth");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const getBstDate = (date: Date) => {
    const bst = new Date(date.getTime() + 6 * 3600 * 1000);
    return bst.toISOString().split("T")[0];
  };

  useEffect(() => {
    const now = new Date();
    const todayStr = getBstDate(now);

    if (selectedPreset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (selectedPreset === "yesterday") {
      const yest = new Date(now.getTime() - 24 * 3600 * 1000);
      setStartDate(getBstDate(yest));
      setEndDate(getBstDate(yest));
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

  useEffect(() => {
    const unsubscribe = posOfflineSync.subscribe((state) => {
      setPendingSyncCount(state.pendingCount);
    });
    return () => unsubscribe();
  }, []);

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
      ];

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `mimi_sphere_profit_report_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Financial statement exported to CSV successfully!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Control Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/80 shadow-2xs shrink-0">
            <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Profit & Loss Report
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                আয়-ব্যয় ও নিট মুনাফা
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Cost of Goods Sold · Operational Expenses · Net Margin · Valuation
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Print Report (প্রিন্ট)</span>
          </button>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
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
              <span>All Sales</span>
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
              <span>POS Counter</span>
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
              <span>Online Store</span>
            </button>
          </div>

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

      {/* ─── 6 Financial KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-xs font-black text-slate-700 block">Total Revenue</span>
            <span className="text-[11px] font-semibold text-emerald-600">মোট বিক্রি</span>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-emerald-600 block">
              {formatCurrency(summary.total_sales)}
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium">{summary.total_orders} orders</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-xs font-black text-slate-700 block">Product Cost</span>
            <span className="text-[11px] font-semibold text-slate-500">পণ্যের ক্রয়মূল্য</span>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-slate-700 block">
              {formatCurrency(summary.product_cost)}
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium">{summary.total_items_sold} items sold</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-teal-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-xs font-black text-slate-700 block">Gross Profit</span>
            <span className="text-[11px] font-semibold text-teal-600">মোট লাভ</span>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-teal-600 block">
              {formatCurrency(summary.gross_profit)}
            </span>
            <span className="text-[10.5px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">
              Margin: {summary.gross_margin_pct}%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-xs font-black text-slate-700 block">Store Expenses</span>
            <span className="text-[11px] font-semibold text-rose-600">দোকানের খরচ</span>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-rose-500 block">
              {formatCurrency(summary.total_expense)}
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium">{expensesByCategory.length} categories</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-black text-indigo-200 block">Net Profit</span>
            <span className="text-[11px] font-semibold text-emerald-400">প্রকৃত লাভ (নিট)</span>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-emerald-300 block">
              {formatCurrency(summary.net_profit)}
            </span>
            <span className="text-[10.5px] text-indigo-300 font-bold">Margin: {summary.net_margin_pct}%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-xs font-black text-slate-700 block">Stock Valuation</span>
            <span className="text-[11px] font-semibold text-purple-600">বর্তমান স্টক মূল্য</span>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-purple-700 block">
              {formatCurrency(summary.closing_stock_valuation)}
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium">Live inventory asset</span>
          </div>
        </div>
      </div>

      {/* ─── Timeline & Payment Distribution ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800">Sales & Profit Timeline</h3>
              <p className="text-xs text-slate-500 font-medium">দিনভিত্তিক বিক্রয় ও লাভের ট্রেন্ড</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              {timeline.length} Days
            </span>
          </div>

          <div className="h-72 w-full">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="pProfitGrad" x1="0" y1="0" x2="0" y2="1">
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
                    name="Sales (বিক্রি)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#pSalesGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Net Profit (নিট লাভ)"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#pProfitGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-bold">
                কোনো সেল রেকর্ড পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-black text-slate-800">Payment Breakdown</h3>
            <p className="text-xs text-slate-500 font-medium">পেমেন্ট মাধ্যম বিশ্লেষণ</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {paymentBreakdown.map((pm: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{pm.name_bn}</span>
                  <span className="font-mono text-slate-900">{formatCurrency(pm.total)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pm.pct}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{pm.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Itemized Accounting P&L Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Detailed Statement</h3>
            <p className="text-xs text-slate-500 font-medium">হিসাববিজ্ঞান মানসম্মত পূর্ণাঙ্গ আয়-ব্যয় বিবরণী</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">{startDate} ~ {endDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/75 text-slate-600 font-extrabold uppercase text-[10.5px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Financial Account / বিবরণ</th>
                <th className="py-3 px-4">Accounting Formula</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
                <th className="py-3 px-4 text-right">% of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="font-semibold text-slate-800">
                <td className="py-3 px-4">Gross Sales Revenue (মোট বিক্রয় আয়)</td>
                <td className="py-3 px-4 text-slate-500 font-mono text-xs">Total Sales Invoiced</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(summary.total_sales)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">100%</td>
              </tr>
              <tr className="font-semibold text-slate-800">
                <td className="py-3 px-4">Cost of Goods Sold / COGS (পণ্যের ক্রয়মূল্য)</td>
                <td className="py-3 px-4 text-slate-500 font-mono text-xs">Purchase Cost</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">{formatCurrency(summary.product_cost)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">{summary.total_sales > 0 ? `${Math.round((summary.product_cost / summary.total_sales) * 1000) / 10}%` : "0%"}</td>
              </tr>
              <tr className="bg-teal-50/50 font-bold text-teal-900 border-y border-teal-100">
                <td className="py-3 px-4">Gross Profit (মোট মুনাফা)</td>
                <td className="py-3 px-4 text-teal-700 font-mono text-xs">Revenue - COGS</td>
                <td className="py-3 px-4 text-right font-mono font-black text-teal-700">{formatCurrency(summary.gross_profit)}</td>
                <td className="py-3 px-4 text-right font-mono font-black text-teal-700">{summary.gross_margin_pct}%</td>
              </tr>
              <tr className="font-semibold text-slate-800">
                <td className="py-3 px-4">Store Expenses (দোকানের খরচ)</td>
                <td className="py-3 px-4 text-slate-500 font-mono text-xs">Daily Store Expenses</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">- {formatCurrency(summary.total_expense)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">{summary.total_sales > 0 ? `${Math.round((summary.total_expense / summary.total_sales) * 1000) / 10}%` : "0%"}</td>
              </tr>
              <tr className="bg-indigo-50/80 font-black text-indigo-950 border-t-2 border-indigo-200">
                <td className="py-3.5 px-4 text-sm font-black">Net Profit (প্রকৃত লাভ / নিট মুনাফা)</td>
                <td className="py-3.5 px-4 text-indigo-700 font-mono text-xs">Gross - Expenses - Returns</td>
                <td className="py-3.5 px-4 text-right font-mono text-base font-black text-indigo-700">{formatCurrency(summary.net_profit)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-sm font-black text-indigo-700">{summary.net_margin_pct}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
