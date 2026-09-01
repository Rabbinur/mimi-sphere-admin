"use client";

import {
  Home,
  LayoutGrid,
  ShoppingCart,
  Store,
  User
} from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "../Redux/hooks";
import CartSheet from "./CartSheet";

import { useState, useEffect } from "react";

export function MobileNav() {
  const [mounted, setMounted] = useState(false);
  const cartItems = useAppSelector((state) => state.cart.cartItems);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-primary md:hidden" />;
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-primary text-white border-t md:hidden">
      {/* 🔹 changed grid-cols-4 → grid-cols-5 */}
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">

        {/* Home */}
        <Link
          href="/"
          className="nav-item"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>

        {/* Category ✅ NEW */}
        <Link
          href="/categories"
          className="nav-item"
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-xs">Category</span>
        </Link>



        {/* Shop */}
        <Link
          href="/shop"
          className="nav-item"
        >
          <Store className="w-6 h-6" />
          <span className="text-xs">Shop</span>
        </Link>

        {/* Account */}
        <Link
          href="/user-account"
          className="nav-item"
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Account</span>
        </Link>
      </div>

      {/* Floating Cart Button */}
      <CartSheet cartItems={cartItems}>
        <button
          aria-label={`View shopping cart, ${cartItems.length} items`}
          className="
            absolute -top-8 left-1/2 -translate-x-1/2
            w-14 h-14 rounded-full shadow-lg border-2
            bg-primary text-white border-white
            flex items-center justify-center
            hover:bg-primary/90 transition-colors
          "
        >
          <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white" />
          <span
            className="
              absolute -top-1 -right-1
              flex h-4 w-4 items-center justify-center
              rounded-full bg-red-600 text-[10px] text-white
            "
          >
            {cartItems.length}
          </span>
        </button>
      </CartSheet>
    </div>
  );
}
