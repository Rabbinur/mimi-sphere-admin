"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Barcode,
  Camera,
  Clock,
  DollarSign,
  Maximize,
  Minimize,
  RefreshCw,
  ShoppingBag,
  Sparkles,
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
    <header className="h-14 sm:h-16 bg-slate-900 text-white px-2.5 sm:px-4 lg:px-6 flex items-center justify-between shadow-md select-none border-b border-slate-800 z-20 shrink-0 gap-2">
      {/* Left: Brand & Back to Dashboard */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/dashboard"
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          title="Back to Admin Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-md">
            POS
          </div>
          <div className="hidden xs:block sm:block">
            <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none text-white truncate max-w-[100px] sm:max-w-none">
              MIMI SPHERE
            </h1>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
              Terminal POS
            </span>
          </div>
        </div>
      </div>

      {/* Center: Live Status & Hardware Scanner Toast Banner */}
      <div className="flex-1 flex justify-center items-center px-1 max-w-xs sm:max-w-md min-w-0">
        {barcodeStatusMessage ? (
          <div className="px-2.5 py-1 bg-blue-500/20 border border-blue-400/40 text-blue-300 rounded-full text-[11px] sm:text-xs font-bold animate-in fade-in flex items-center gap-1.5 shadow-sm max-w-full truncate">
            <Barcode className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span className="truncate">{barcodeStatusMessage}</span>
          </div>
        ) : (
          <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
            <Barcode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Scanner Ready (USB / Bluetooth)</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Shift Modal, Camera, Mobile Cart Trigger, Clock & Fullscreen */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Cart Button (< lg) */}
        {onOpenMobileCart && (
          <button
            type="button"
            onClick={onOpenMobileCart}
            className="lg:hidden relative p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
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

        {/* Camera Scanner Button (Great for mobile & tablet) */}
        <button
          onClick={onOpenCameraScanner}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-xs font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer"
          title="Camera Barcode Scanner"
        >
          <Camera className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Camera</span>
        </button>

        {/* Daily Shift Sales Modal */}
        <button
          onClick={onOpenShiftModal}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-xs font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer"
          title="Daily Register Shift Report"
        >
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Shift</span>
        </button>

        {/* Refresh Grid */}
        <button
          onClick={onRefresh}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Refresh Catalog"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700/40">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{currentTime || "00:00:00"}</span>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden md:flex p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
