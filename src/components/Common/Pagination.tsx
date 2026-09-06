"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
    currentPage: number;
    lastPage?: number;
    totalPages?: number;
    onPageChange: (page: number) => void;
    from?: number;
    to?: number;
    totalItems?: number;
    perPage?: number;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
    className?: string;
    showPerPageSelector?: boolean;
}

export default function Pagination({
    currentPage,
    lastPage,
    totalPages: totalPagesProp,
    onPageChange,
    from,
    to,
    totalItems,
    perPage,
    onPerPageChange,
    perPageOptions = [10, 25, 50, 100],
    className = "",
    showPerPageSelector = true,
}: PaginationProps) {
    const totalPages = Math.max(1, lastPage ?? totalPagesProp ?? 1);

    // Generate page numbers with ellipses
    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            let adjustedStart = start;
            let adjustedEnd = end;
            if (currentPage <= 3) adjustedEnd = 4;
            if (currentPage >= totalPages - 2) adjustedStart = totalPages - 3;

            for (let i = adjustedStart; i <= adjustedEnd; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push("...");
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none",
                className
            )}
        >
            {/* Info / Showing text & Per Page selector */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium">
                {totalItems !== undefined ? (
                    <div>
                        Showing{" "}
                        <span className="font-semibold text-slate-900">
                            {from !== undefined ? from : (currentPage - 1) * (perPage || 10) + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-slate-900">
                            {to !== undefined ? to : Math.min(currentPage * (perPage || 10), totalItems)}
                        </span>{" "}
                        of <span className="font-semibold text-slate-900">{totalItems}</span> results
                    </div>
                ) : (
                    <div>
                        Page <span className="font-semibold text-slate-900">{currentPage}</span> of{" "}
                        <span className="font-semibold text-slate-900">{totalPages}</span>
                    </div>
                )}

                {showPerPageSelector && onPerPageChange && perPage && (
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                        <span className="text-xs text-slate-500">Rows per page:</span>
                        <select
                            value={perPage}
                            aria-label="Rows per page"
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all shadow-sm"
                        >
                            {perPageOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <nav className="flex items-center gap-1.5" aria-label="Pagination Navigation">
                    {/* First Page */}
                    <button
                        type="button"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage <= 1}
                        title="First Page"
                        className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        title="Previous Page"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {pages.map((page, idx) =>
                            page === "..." ? (
                                <span
                                    key={`dots-${idx}`}
                                    className="flex items-center justify-center w-8 h-8 text-slate-400"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => onPageChange(page as number)}
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-all shadow-sm",
                                        currentPage === page
                                            ? "bg-primary text-white border border-primary shadow-primary/20 shadow-md font-bold"
                                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                                    )}
                                >
                                    {page}
                                </button>
                            )
                        )}
                    </div>

                    {/* Next Page */}
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        title="Next Page"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Last Page */}
                    <button
                        type="button"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        title="Last Page"
                        className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </nav>
            )}
        </div>
    );
}
