"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/components/Redux/hooks";
import { selectCartItems, selectCartSubtotal, selectCartTotalQuantity } from "@/components/Redux/Slice/cartSlice";
import CartSheet from "@/components/ui/CartSheet";
import { ShoppingBag } from "lucide-react";

export default function FloatingCart() {
    const [mounted, setMounted] = useState(false);
    const cartItems = useAppSelector(selectCartItems);
    const totalQuantity = useAppSelector(selectCartTotalQuantity);
    const subtotal = useAppSelector(selectCartSubtotal);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] hidden md:block cursor-pointer">
            <CartSheet cartItems={cartItems}>
                <button aria-label="Open shopping cart" className="flex flex-col items-center bg-white shadow-lg rounded-l-lg overflow-hidden border border-slate-200">

                    {/* Top: Item Count (Primary Color) */}
                    <div className="w-14 h-14 bg-primary flex flex-col items-center justify-center text-white">
                        <div className="relative mb-0.5">
                            <ShoppingBag className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-[12px] font-bold">{totalQuantity}</span>
                            <span className="text-[8px] font-medium opacity-90 uppercase">Items</span>
                        </div>
                    </div>

                    {/* Bottom: Subtotal (Dark/Compact) */}
                    <div className="w-14 py-1.5 bg-[#1A1A1A] flex items-center justify-center text-white">
                        <span className="text-[11px] font-bold flex items-center gap-0.5">
                            <span className="text-[9px] opacity-80">৳</span>
                            {subtotal.toLocaleString()}
                        </span>
                    </div>

                </button>
            </CartSheet>
        </div>
    );
}