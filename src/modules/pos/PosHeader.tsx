"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calculator,
  Maximize,
  Minimize,
  Printer,
  TrendingUp,
  BarChart3,
  Settings,
  Banknote,
  Timer,
  ShoppingBag,
  Camera,
  User,
  ShieldCheck,
  Globe,
  FileSpreadsheet,
} from "lucide-react";
import { useAppSelector } from "@/components/Redux/hooks";
import { useCurrentUserInfo } from "@/components/Redux/Slice/authSlice";

interface PosHeaderProps {
  onOpenShiftModal: () => void;
  onOpenCashRegisterModal: () => void;
  onOpenTodaySaleModal: () => void;
  onOpenTodayProfitModal: () => void;
  onOpenCalculatorModal: () => void;
  onPrintLastReceipt: () => void;
  onOpenCameraScanner?: () => void;
  barcodeStatusMessage?: string | null;
  isScanning?: boolean;
  onRefresh?: () => void;
  cartItemCount?: number;
  onOpenMobileCart?: () => void;
}

export function PosHeader({
  onOpenShiftModal,
  onOpenCashRegisterModal,
  onOpenTodaySaleModal,
  onOpenTodayProfitModal,
  onOpenCalculatorModal,
  onPrintLastReceipt,
  onOpenCameraScanner,
  barcodeStatusMessage,
  cartItemCount = 0,
  onOpenMobileCart,
}: PosHeaderProps) {
  const user = useAppSelector(useCurrentUserInfo) as any;
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Running Live Digital Clock (HH:mm:ss)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
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
    <header className="h-16 bg-white text-slate-800 px-3 sm:px-5 flex items-center justify-between shadow-xs select-none border-b border-slate-200 z-30 shrink-0 gap-2">
      {/* ─── Left Section: Brand Logo + Teal Live Timer + Purple Dashboard Button ─── */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        {/* Back to Dashboard Button */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 hover:text-slate-950 text-xs font-bold transition-all border border-slate-200/80 shadow-2xs cursor-pointer shrink-0"
          title="Back to Admin Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {/* Brand Logo with POS Badge */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 group cursor-pointer" title="MIMI SPHERE POS">
          <div className="relative flex items-center h-8">
            <Image
              src="/logo.png"
              alt="MIMI SPHERE Logo"
              width={140}
              height={38}
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-102"
              priority
            />
          </div>
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-orange-600 text-white uppercase tracking-wider shadow-2xs">
            POS
          </span>
        </Link>

        {/* Live Running Time Pill (Matching Image 2 - Teal / Emerald) */}
        <div className="bg-[#009688] hover:bg-[#00897b] px-2.5 sm:px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 sm:gap-2 font-mono text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0">
          <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4  animate-pulse shrink-0" />
          <span className="tracking-wide">{currentTime || "00:00:00"}</span>
        </div>

        {/* Purple Dashboard Button (Matching Image 2) */}
        <Link
          href="/dashboard"
          className="bg-[#6338f6] hover:bg-[#5225ea] active:scale-95 text-white font-bold text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          title="Return to Admin Dashboard"
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </div>

      {/* ─── Center: Hardware Scanner Toast / Status ─── */}
      <div className="hidden xl:flex flex-1 justify-center items-center px-2 min-w-0">
        {barcodeStatusMessage ? (
          <div className="px-3.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full text-xs font-bold animate-in fade-in flex items-center gap-1.5 shadow-2xs truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="truncate">{barcodeStatusMessage}</span>
          </div>
        ) : null}
      </div>

      {/* ─── Right Section: Shift Log, Actions & Profile ─── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Cart Trigger (< lg) */}
        {onOpenMobileCart && (
          <button
            type="button"
            onClick={onOpenMobileCart}
            className="lg:hidden relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-bold flex items-center cursor-pointer border border-slate-200"
            title="View Cart"
          >
            <ShoppingBag className="w-4 h-4 text-slate-800" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                {cartItemCount}
              </span>
            )}
          </button>
        )}

        {/* Camera Scan Button */}
        {onOpenCameraScanner && (
          <div className="relative group/tip hidden md:flex items-center">
            <button
              type="button"
              onClick={onOpenCameraScanner}
              className="h-9 px-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-800 text-xs font-bold cursor-pointer shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-sky-600 stroke-[2.2] shrink-0" />
              <span className="hidden xl:inline text-[11px]">Camera</span>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
              <span>Camera Scanner</span>
              <span className="text-[9.5px] text-sky-300 font-normal">ক্যামেরা স্ক্যানার</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0f172a]" />
            </div>
          </div>
        )}

        {/* Shift Log / Report Button */}
        <div className="relative group/tip flex items-center">
          <button
            type="button"
            onClick={onOpenShiftModal}
            className="h-9 px-2.5 sm:px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 stroke-[2.2] shrink-0" />
            <span className="hidden xl:inline text-[11px]">Shift Log</span>
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
            <span>Shift Sales Report</span>
            <span className="text-[9.5px] text-emerald-300 font-normal">শিফট রিপোর্ট</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0f172a]" />
          </div>
        </div>

        {/* 1. Calculator Button */}
        <div className="relative group/tip flex items-center">
          <button
            type="button"
            onClick={onOpenCalculatorModal}
            className="w-9 h-9 border border-amber-300 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-700 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Calculator className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
            <span>Quick Calculator</span>
            <span className="text-[9.5px] text-amber-300 font-normal">ক্যালকুলেটর</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0f172a]" />
          </div>
        </div>

        {/* 2. Fullscreen Toggle */}
        <div className="relative group/tip flex items-center">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-9 h-9 border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 stroke-[2.2]" /> : <Maximize className="w-4 h-4 stroke-[2.2]" />}
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            <span className="text-[9.5px] text-slate-300 font-normal">{isFullscreen ? "ফুলস্ক্রিন বন্ধ" : "ফুলস্ক্রিন মোড"}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0f172a]" />
          </div>
        </div>

        {/* 3. Cash Register Details */}
        <div className="relative group/tip flex items-center">
          <button
            type="button"
            onClick={onOpenCashRegisterModal}
            className="w-9 h-9 border border-teal-300 bg-teal-50 hover:bg-teal-100 active:scale-95 text-teal-700 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Banknote className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
            <span>Cash Register</span>
            <span className="text-[9.5px] text-teal-300 font-normal">ক্যাশ রেজিস্টার</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0f172a]" />
          </div>
        </div>

        {/* 4. Print Last Receipt Button */}
        <div className="relative group/tip flex items-center">
          <button
            type="button"
            onClick={onPrintLastReceipt}
            className="w-9 h-9 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
            <span>Print Last Receipt</span>
            <span className="text-[9.5px] text-indigo-300 font-normal">শেষ রসিদ প্রিন্ট</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0f172a]" />
          </div>
        </div>

        {/* 5. Today's Sale Button */}
        <div className="relative group/tip flex items-center">
          <button
            type="button"
            onClick={onOpenTodaySaleModal}
            className="w-9 h-9 border border-blue-300 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
            <span>Today's Sale</span>
            <span className="text-[9.5px] text-blue-300 font-normal">আজকের বিক্রি</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0f172a]" />
          </div>
        </div>

        {/* 6. Today's Profit Button */}
        <div className="relative group/tip flex items-center">
          <button
            type="button"
            onClick={onOpenTodayProfitModal}
            className="w-9 h-9 border border-purple-300 bg-purple-50 hover:bg-purple-100 active:scale-95 text-purple-700 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <BarChart3 className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
            <span>Today's Profit</span>
            <span className="text-[9.5px] text-purple-300 font-normal">আজকের লাভ</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0f172a]" />
          </div>
        </div>

        {/* 7. Settings Button */}
        <div className="relative group/tip flex items-center">
          <Link
            href="/dashboard/settings"
            className="w-9 h-9 border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Settings className="w-4 h-4 stroke-[2.2]" />
          </Link>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
            <span>Settings</span>
            <span className="text-[9.5px] text-slate-300 font-normal">সেটিংস</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0f172a]" />
          </div>
        </div>

        {/* 8. User Profile Avatar & Dropdown */}
        <div className="relative group/tip ml-0.5" ref={userRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-9 h-9 rounded-xl overflow-hidden border border-slate-600 bg-slate-900 hover:ring-2 hover:ring-orange-400 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
          >
            {user?.photo ? (
              <img
                src={user.photo}
                alt={user.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-indigo-950 text-white font-black text-xs flex items-center justify-center shadow-inner tracking-wider">
                {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
              </div>
            )}
          </button>
          {!isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 px-2.5 py-1 bg-[#0f172a] text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 flex flex-col items-center">
              <span>{user?.name || "Cashier Profile"}</span>
              <span className="text-[9.5px] text-slate-300 font-normal">প্রোফাইল মেনু</span>
              <div className="absolute bottom-full right-3 border-4 border-transparent border-b-[#0f172a]" />
            </div>
          )}

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || "Cashier Admin"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || "admin@mimisphere.com"}
                </p>
                <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authorized Cashier</span>
                </div>
              </div>

              <Link
                href="/dashboard/profile"
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/dashboard"
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
