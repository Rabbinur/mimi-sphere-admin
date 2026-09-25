"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, ShoppingBag, Boxes, BarChart3 } from "lucide-react";
import SalesReportPage from "./sales/page";
import PurchaseReportPage from "./purchase/page";
import ProfitLossReportPage from "./profit-loss/page";

export default function ReportsHubPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "purchase" | "profit-loss">("sales");

  return (
    <div className="space-y-6">
      {/* ─── Top Navigation Tabs ─── */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "sales"
                ? "bg-white text-indigo-700 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Sales Report (বিক্রয় রিপোর্ট)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("purchase")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "purchase"
                ? "bg-white text-indigo-700 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Purchase Report (ক্রয় ও স্টক)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profit-loss")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "profit-loss"
                ? "bg-white text-indigo-700 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Profit & Loss (লাভ-ক্ষতি)</span>
          </button>
        </div>

        <div className="text-[11px] font-medium text-slate-400 px-3 hidden md:block">
          MIMI SPHERE Official Financial & Inventory Intelligence Hub
        </div>
      </div>

      {/* ─── Active Tab Content ─── */}
      {activeTab === "sales" && <SalesReportPage />}
      {activeTab === "purchase" && <PurchaseReportPage />}
      {activeTab === "profit-loss" && <ProfitLossReportPage />}
    </div>
  );
}
