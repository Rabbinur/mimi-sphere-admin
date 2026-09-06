"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Barcode,
  Camera,
  Clock,
  FileSpreadsheet,
  Maximize,
  Minimize,
  RefreshCw,
  ShoppingBag,
  Store,
} from "lucide-react";

interface PosHeaderProps {
  onOpenShiftModal: () => void;
  onOpenCameraScanner: () => void;
  onRefresh: () => void;
  barcodeStatusMessage?: string | null;
  isScanning?: boolean;
  cartItemCount?: number;
  onOpenMobileCart?: () => void;
}

export function PosHeader({
  onOpenShiftModal,
  onOpenCameraScanner,
  onRefresh,
  barcodeStatusMessage,
  isScanning,
  cartItemCount = 0,
  onOpenMobileCart,
}: PosHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="h-14 sm:h-15 bg-slate-950 text-white px-3 sm:px-4 lg:px-5 flex items-center justify-between shadow-lg select-none border-b border-slate-800/80 z-20 shrink-0 gap-2">
      {/* Left: Brand & Back to Dashboard */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <Link
          href="/dashboard"
          className="px-3 py-1.5 rounded-xl bg-slate-850 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-700/60 shadow-xs"
          title="Back to Admin Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Admin Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none text-white">
                POS Terminal
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 hidden sm:block">
              MIMI SPHERE Store Point of Sale
            </span>
          </div>
        </div>
      </div>

      {/* Center: Live Status & Hardware Scanner Toast Banner */}
      <div className="flex-1 flex justify-center items-center px-1 max-w-xs sm:max-w-md min-w-0">
        {barcodeStatusMessage ? (
          <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/40 text-blue-300 rounded-full text-[11px] sm:text-xs font-bold animate-in fade-in flex items-center gap-1.5 shadow-sm max-w-full truncate">
            <Barcode className="w-3.5 h-3.5 animate-pulse shrink-0 text-blue-400" />
            <span className="truncate">{barcodeStatusMessage}</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <Barcode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate font-semibold text-[11.5px]">Hardware Scanner Active (USB / Bluetooth)</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Camera, Shift Report, Clock & Fullscreen */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Cart Button (< lg) */}
        {onOpenMobileCart && (
          <button
            type="button"
            onClick={onOpenMobileCart}
            className="lg:hidden relative p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer border border-slate-800"
            title="View Cart"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                {cartItemCount}
              </span>
            )}
          </button>
        )}

        {/* Camera Scanner Button */}
        <button
          onClick={onOpenCameraScanner}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
          title="Camera Barcode Scanner"
        >
          <Camera className="w-3.5 h-3.5 text-white shrink-0" />
          <span className="hidden sm:inline">Camera Scan</span>
        </button>

        {/* Refresh Grid */}
        <button
          onClick={onRefresh}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Refresh Catalog"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Daily Shift Report Modal Button (Purple Pill as in Image 2) */}
        <button
          onClick={onOpenShiftModal}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
          title="Daily Register Shift Report"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-white shrink-0" />
          <span className="hidden sm:inline">Shift Report</span>
        </button>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{currentTime || "00:00:00"}</span>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden md:flex p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}
