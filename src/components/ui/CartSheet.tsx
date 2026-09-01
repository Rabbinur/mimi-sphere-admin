"use client";

import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { useAppDispatch } from "@/components/Redux/hooks";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
    clearCart,
    removeFromCart,
    updateQuantity,
} from "@/components/Redux/Slice/cartSlice";

/**
 * Updated Cart item shape (matches the cart slice in this conversation)
 */
interface CartItem {
    id: string; // deterministic id created by slice (e.g. `${product_id}::${variant_id||'default'}`)
    product_id: string;
    variant_id?: string | null;
    title: string;
    thumbnail?: string;
    price: number;
    quantity: number;
    selected_variant_values?: Record<string, string>;
    sku?: string;
    // add extra optional fields if your app uses them
}

interface CartSheetProps {
    cartItems: CartItem[];
    children: React.ReactNode;
}

export default function CartSheet({ cartItems, children }: CartSheetProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // subtotal using price * quantity (price already snapshot on addToCart)
    const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    const safeRemove = (id: string) => {
        try {
            dispatch(removeFromCart(id));
        } catch (e) {
            console.warn("removeFromCart action not available", e);
        }
    };

    const safeClear = () => {
        try {
            dispatch(clearCart());
        } catch (e) {
            console.warn("clearCart action not available", e);
        }
    };

    const safeUpdateQty = (id: string, qty: number) => {
        try {
            if (qty < 1) return;
            dispatch(updateQuantity({ id, quantity: qty }));
        } catch (e) {
            console.warn(
                "updateQuantity action not available. Cannot change quantity.",
                e
            );
        }
    };

    return (
        <Sheet>
            {/* trigger from parent */}
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent
                side="right"
                className="w-full  sm:max-w-md bg-white flex flex-col p-0"
            >
                <VisuallyHidden>
                    <SheetTitle>Shopping Cart</SheetTitle>
                    <SheetDescription>
                        Review your items and proceed to checkout.
                    </SheetDescription>
                </VisuallyHidden>

                {/* Header */}
                <SheetHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-gray-800" />
                        <h3 className="text-base font-semibold text-gray-800">Shopping Cart</h3>
                        <span className="text-sm font-medium text-gray-500">({cartItems?.length || 0})</span>
                    </div>

                    <SheetClose asChild>
                        <button
                            aria-label="Close cart"
                            className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </SheetClose>
                </SheetHeader>

                {/* Items / Empty state */}
                <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4">
                    {cartItems?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
                            <Image
                                src="/cart-icon.png"
                                alt="Empty Cart"
                                width={100}
                                height={100}
                                className="-scale-x-100"
                                style={{ width: '100px', height: 'auto' }}
                                priority={false}
                            />

                            <h2 className="text-lg font-semibold text-gray-800">Your cart is empty</h2>
                            <p className="text-sm text-gray-500 mt-1">Add some products to get started!</p>

                            <SheetClose asChild>
                                <button
                                    onClick={() => router.push("/shop")}
                                    className="mt-6 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/80 transition"
                                >
                                    Continue Shopping
                                </button>
                            </SheetClose>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => {
                                const imgSrc =
                                    item.thumbnail && String(item.thumbnail).trim() !== "" ? item.thumbnail : null;

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-start gap-3 p-2 sm:p-3
             bg-white border border-gray-200 rounded-lg shadow-sm
             overflow-hidden"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-md bg-gray-50 flex items-center justify-center
                overflow-hidden flex-shrink-0 border border-gray-200">

                                            {imgSrc ? (
                                                <Image
                                                    src={imgSrc}
                                                    alt={item.title || "Product"}
                                                    width={64}
                                                    height={64}
                                                    className="object-contain"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="text-xs text-gray-400">No image</div>
                                            )}
                                        </div>

                                        {/* Main content (title, variant, qty, price) */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                                            <div className="flex items-start flex-col md:flex-row md:justify-between gap-2">
                                                <div className="min-w-0 pr-2">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {item.title}
                                                    </h4>


                                                    {/* variant values */}
                                                    {item.selected_variant_values && (
                                                        <div className="mt-1 flex gap-2 text-xs text-gray-500 flex-wrap">
                                                            {Object.entries(item.selected_variant_values).map(([k, v]) => (
                                                                <span key={k} className="inline-flex items-center gap-1">
                                                                    <strong className="text-gray-700">{k}:</strong>{" "}
                                                                    <span className="text-gray-600">{v}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-sm font-bold text-gray-900">

                                                    ৳{Number(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className=" flex justify-between">
                                                {/* quantity controls */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => safeUpdateQty(item.id, Number(item.quantity) - 1)}
                                                            className="border border-gray-300 text-gray-600 hover:bg-gray-100 h-6 w-6 rounded-full flex items-center justify-center transition"
                                                            aria-label={`Decrease quantity of ${item.title || "item"}`}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>

                                                        <span className="text-sm font-medium w-6 text-center">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            onClick={() => safeUpdateQty(item.id, Number(item.quantity) + 1)}
                                                            className="border border-gray-300 text-gray-600 hover:bg-gray-100 h-6 w-6 rounded-full flex items-center justify-center transition"
                                                            aria-label={`Increase quantity of ${item.title || "item"}`}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0 self-start">
                                                    <button
                                                        onClick={() => safeRemove(item.id)}
                                                        className="text-red-500 hover:bg-red-50 p-1 rounded-full transition bg-white"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>


                                        </div>

                                        {/* DELETE BUTTON moved to far right */}


                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-white px-4 pt-4 pb-6 w-full flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-base font-semibold text-gray-800">Total:</div>
                        <div className="text-xl font-extrabold text-gray-900">
                            ৳{Number(subtotal).toLocaleString()}
                        </div>
                    </div>

                    <SheetClose asChild>
                        <div className="space-y-3">
                            <button
                                disabled={cartItems?.length === 0}
                                onClick={() => router.push("/checkout")}
                                className="w-full bg-primary hover:bg-primary/80 text-white font-semibold h-11 rounded-md transition-colors"
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                disabled={cartItems?.length === 0}
                                onClick={safeClear}
                                className="w-full border border-gray-300 rounded-md py-2.5 text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </SheetClose>
                </div>
            </SheetContent>
        </Sheet>
    );
}
