"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { TProduct } from "@/types";
import { useAllProductsQuery } from "../Redux/RTK/productApi";
import { useDebounce } from "../hooks/useDebounce";

interface SearchBarProps {
    onResultClick?: () => void;
}

export const SearchBar = ({ onResultClick }: SearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debouncedSearch = useDebounce(searchQuery, 500);

    const { data, isFetching } = useAllProductsQuery(
        { searchTerm: debouncedSearch },
        { skip: !debouncedSearch }
    );

    const products = data?.data || [];

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCloseSearch = () => {
        setSearchQuery("");
        setIsOpen(false);
        if (onResultClick) onResultClick();
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="flex border-2 border-primary/20 focus-within:border-primary rounded-xl overflow-hidden h-10 md:h-11 bg-slate-50 transition-all">
                <Input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder="Search for products..."
                    className="flex-1 rounded-none border-none focus-visible:ring-0 bg-transparent h-full text-sm font-medium"
                />

                <Button
                    type="button"
                    aria-label="Search"
                    className="rounded-none bg-primary hover:bg-primary/90 h-full w-12 p-0 transition-colors"
                >
                    {isFetching ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                        <Search className="h-4 w-4 text-white" />
                    )}
                </Button>
            </div>

            {/* Search Results Dropdown */}
            {isOpen && debouncedSearch && (
                <div className="absolute z-[100] mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    {isFetching ? (
                        <div className="p-8 flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-xs text-slate-400 font-medium">Searching products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-sm text-slate-500 font-medium italic">No products found for "{debouncedSearch}"</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {products.map((product: TProduct) => (
                                <Link
                                    key={product._id}
                                    href={`/products/${product.url_handle}`}
                                    className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                    onClick={handleCloseSearch}
                                >
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border">
                                        <Image
                                            src={product?.thumbnail || "/logo.png"}
                                            alt={product.product_title}
                                            fill
                                            sizes="48px"
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {product.product_title}
                                        </p>
                                        <p className="text-xs font-bold text-primary">
                                            ৳ {product.product_price}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};