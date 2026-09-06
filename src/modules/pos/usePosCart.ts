"use client";

import { useState, useCallback, useMemo } from "react";
import { PosCartItem, PosProductItem } from "./types";

export function usePosCart() {
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState<{
    type: "fixed" | "percent";
    value: number;
    coupon_code?: string;
  }>({
    type: "fixed",
    value: 0,
    coupon_code: "",
  });

  const addItem = useCallback((product: PosProductItem | PosCartItem) => {
    setCartItems((prev) => {
      const itemKey = (product as any).variant_id || product.product_id;
      const existingIdx = prev.findIndex((i) => (i.variant_id || i.product_id) === itemKey);

      if (existingIdx !== -1) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.quantity + 1;
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          total: Number((newQty * existing.price).toFixed(2)),
        };
        return updated;
      }

      const newItem: PosCartItem = {
        product_id: product.product_id,
        variant_id: (product as any).variant_id,
        product_name: product.product_name,
        combination_label: product.combination_label,
        sku: product.sku,
        barcode: product.barcode,
        price: product.price,
        cost_price: product.cost_price,
        quantity: (product as any).quantity || 1,
        total: Number((((product as any).quantity || 1) * product.price).toFixed(2)),
        image: product.image,
      };

      return [newItem, ...prev];
    });
  }, []);

  const updateQuantity = useCallback((itemKey: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => (i.variant_id || i.product_id) !== itemKey);
      }
      return prev.map((i) => {
        if ((i.variant_id || i.product_id) === itemKey) {
          return {
            ...i,
            quantity,
            total: Number((quantity * i.price).toFixed(2)),
          };
        }
        return i;
      });
    });
  }, []);

  const removeItem = useCallback((itemKey: string) => {
    setCartItems((prev) => prev.filter((i) => (i.variant_id || i.product_id) !== itemKey));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setGlobalDiscount({ type: "fixed", value: 0, coupon_code: "" });
  }, []);

  const subtotal = useMemo(() => {
    return Number(cartItems.reduce((sum, item) => sum + item.total, 0).toFixed(2));
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!globalDiscount.value || globalDiscount.value <= 0) return 0;
    if (globalDiscount.type === "percent") {
      return Number(((subtotal * globalDiscount.value) / 100).toFixed(2));
    }
    return Math.min(globalDiscount.value, subtotal);
  }, [subtotal, globalDiscount]);

  const taxAmount = 0; // Configurable tax if needed

  const grandTotal = useMemo(() => {
    return Math.max(0, Number((subtotal - discountAmount + taxAmount).toFixed(2)));
  }, [subtotal, discountAmount, taxAmount]);

  const totalItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
    totalItemCount,
    globalDiscount,
    setGlobalDiscount,
  };
}
