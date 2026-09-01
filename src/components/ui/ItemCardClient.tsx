"use client";

import dynamic from "next/dynamic";
import ProductCardLoading from "./ProductCardLoading";

/**
 * 🔹 Client-only wrapper for ItemCard.
 * This ensures that the Redux context is only accessed in the browser,
 * preventing SSR crashes in Next.js 15.
 */
export const ItemCardClient = dynamic(
    () => import("./item-card").then((mod) => mod.ItemCard),
    {
        ssr: false,
        loading: () => <ProductCardLoading />,
    }
);
