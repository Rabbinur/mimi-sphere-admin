"use client";

import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { posOfflineSync } from "./utils/posOfflineSync";
import { toast } from "sonner";

export function PosNetworkStatusBadge() {
  const [networkState, setNetworkState] = useState<{
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
  }>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
  });

  useEffect(() => {
    const unsubscribe = posOfflineSync.subscribe((state) => {
      setNetworkState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    if (!networkState.isOnline) {
      toast.warning("ইন্টারনেট সংযোগ নেই! ইন্টারনেট আসলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।");
      return;
    }

    if (networkState.pendingCount === 0) {
      toast.info("সব ডাটা আগেই সার্ভারে সিঙ্ক হয়ে আছে।");
      return;
    }

    toast.loading("অফলাইন ডাটা সিঙ্ক করা হচ্ছে...", { id: "pos-sync-toast" });

    await posOfflineSync.triggerAutoSync({
      onSyncSuccess: (res) => {
        toast.success(
          `✅ ${res.ordersCount}টি অফলাইন অর্ডার ও ${res.expensesCount}টি খরচ সার্ভারে সিঙ্ক হয়েছে!`,
          { id: "pos-sync-toast" }
        );
      },
      onSyncError: (err) => {
        toast.error("সিঙ্ক করার সময় সমস্যা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা হবে।", {
          id: "pos-sync-toast",
        });
      },
    });
  };

  const { isOnline, isSyncing, pendingCount } = networkState;

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold shadow-2xs animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
        <span>সিঙ্ক হচ্ছে ({pendingCount})...</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-bold shadow-2xs cursor-pointer hover:bg-amber-100 transition-colors"
        title="ইন্টারনেট নেই - অফলাইন মোডে সেল সংরক্ষিত হচ্ছে"
        onClick={handleManualSync}
      >
        <WifiOff className="w-3.5 h-3.5 text-amber-600" />
        <span>অফলাইন মোড</span>
        {pendingCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px]">
            {pendingCount}
          </span>
        )}
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={handleManualSync}
        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold shadow-2xs transition-all cursor-pointer"
        title="ক্লিক করে এখনই সার্ভারে সিঙ্ক করুন"
      >
        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
        <span>সিঙ্ক বাকি ({pendingCount})</span>
        <span className="text-[10px] text-emerald-700 bg-emerald-200/80 px-1.5 py-0.2 rounded-md font-semibold">
          Sync Now
        </span>
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/70 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold"
      title="ইন্টারনেট সক্রিয় এবং সব ডাটা সিঙ্কড"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Wifi className="w-3 h-3 text-emerald-600" />
      <span className="text-[11px] font-bold">অনলাইন</span>
    </div>
  );
}
