"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS } from "./types";

interface InventorySortDropdownProps {
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (newSortBy: string, newOrder: "asc" | "desc") => void;
}

export function InventorySortDropdown({
    sortBy,
    sortOrder,
    onSortChange,
}: InventorySortDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const activeOption = SORT_OPTIONS.find(
        (o) => o.value === sortBy && o.order === sortOrder
    ) || SORT_OPTIONS[0];

    return (
        <div className="relative shrink-0" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-[13px] font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            >
                <span className="text-slate-400 font-medium hidden sm:inline">Sort by:</span>
                <span className="truncate max-w-[110px] sm:max-w-none">{activeOption.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-[#F1F5F9] mb-1">
                        <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-wider">
                            Sorting options
                        </p>
                    </div>
                    {SORT_OPTIONS.map((opt, idx) => {
                        const isActive = sortBy === opt.value && sortOrder === opt.order;
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    onSortChange(opt.value, opt.order as "asc" | "desc");
                                    setOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-[13px] font-bold transition-all flex items-center justify-between ${
                                    isActive
                                        ? "text-primary bg-primary/5"
                                        : "text-[#4A5568] hover:bg-[#F7FAFC]"
                                }`}
                            >
                                <span>{opt.label}</span>
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
