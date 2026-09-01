"use client";

import { ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppSelector } from "../Redux/hooks";
import { useCurrentUserInfo } from "../Redux/Slice/authSlice";
import CartSheet from "../ui/CartSheet";
import UserDropdown from "../ui/user-dropdown";

export const AccountActions = ({ cartItems }: { cartItems: any }) => {
    const user = useAppSelector(useCurrentUserInfo);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex items-center gap-1 sm:gap-4">
            {/* 1. Shop - Hidden on Mobile */}
            <Link
                href="/shop"
                aria-label="Visit our shop"
                className="hidden md:flex flex-col items-center justify-center group transition-all"
            >
                <div className="p-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
                    <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-slate-700 stroke-[1.5]" />
                </div>
                <span className=" hidden md:block text-[9px] md:text-[10px] font-bold text-primary/90 uppercase tracking-tight group-hover:text-primary transition-colors">
                    Shop
                </span>
            </Link>

            {/* 3. Cart with Badge - Visible on Mobile */}
            <CartSheet cartItems={cartItems}>
                <button
                    aria-label="Open Cart"
                    className="relative flex flex-col items-center justify-center group active:scale-95 transition-all"
                >
                    <div className="p-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
                        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-slate-700 stroke-[1.5]" />
                        {mounted && cartItems.length > 0 && (
                            <span className="absolute top-1 right-0.5 flex items-center justify-center h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-primary text-[8px] md:text-[9px] font-black text-white ring-2 ring-white">
                                {cartItems.length}
                            </span>
                        )}
                    </div>
                    <span className=" hidden md:block text-[9px] md:text-[10px] font-bold text-primary/90 uppercase tracking-tight group-hover:text-primary transition-colors">
                        Cart
                    </span>
                </button>
            </CartSheet>

            {/* Vertical Divider - Hidden on Mobile */}
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />

            {/* User Dropdown - Hidden on Mobile */}
            <div className="hidden md:block">
                {mounted && <UserDropdown />}
            </div>
        </div>
    );
};
