"use client";

import { Search } from "lucide-react";
import { SearchBar } from "./SearchBar";

interface MobileSearchProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const MobileSearch = ({ isOpen, setIsOpen }: MobileSearchProps) => {
    return (
        <>
            {/* Mobile Search Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden flex flex-col items-center justify-center group transition-all"
            >
                <div className="p-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
                    <Search className="w-5 h-5 md:w-6 md:h-6 text-slate-700 stroke-[1.5]" />
                </div>

                {/* <span className="text-[9px] md:text-[10px] font-bold text-primary/90 uppercase tracking-tight group-hover:text-primary transition-colors">
                    Search
                </span> */}
            </button>

            {/* Mobile Search Expandable Bar */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full bg-white px-2 py-3 border-b md:hidden animate-in slide-in-from-top-2 duration-200 shadow-md">
                    <SearchBar onResultClick={() => setIsOpen(false)} />
                </div>
            )}
        </>
    );
};
