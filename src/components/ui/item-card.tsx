"use client";

import { Button } from "@/components/ui/button";
import { TProduct } from "@/types";
import { Eye, Minus, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useAppDispatch } from "../Redux/hooks";
import { addToCart } from "../Redux/Slice/cartSlice";
import { QuickViewModal } from "./quick-view-modal";

type TVariant = {
    _id: string;
    variant_option_values: Record<string, string> | Map<string, string>;
    variant_price: number;
};

interface ItemCardProps {
    product: TProduct;
}

export function ItemCard({ product }: ItemCardProps) {
    const dispatch = useAppDispatch();
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
        null,
    );
    const [quantity, setQuantity] = useState(product.moq || 1);
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isModalOpen]);

    const variants: TVariant[] =
        (product.product_variants as unknown as TVariant[]) || [];
    const normalizeVariantValues = (val: any): Record<string, string> =>
        val instanceof Map ? Object.fromEntries(val) : val || {};

    const getVariantLabel = (v: TVariant) =>
        Object.values(normalizeVariantValues(v.variant_option_values)).join(" / ");

    const selectedVariant = useMemo(
        () => variants.find((v) => v._id === selectedVariantId),
        [variants, selectedVariantId],
    );

    const price = selectedVariant
        ? selectedVariant.variant_price
        : product.product_price;

    const handleAddToCart = () => {
        if (variants.length && !selectedVariantId) {
            toast.error("Please select an option");
            return;
        }

        dispatch(
            addToCart({
                product_id: product._id,
                variant_id: selectedVariantId,
                title: product.product_title,
                thumbnail: product.thumbnail,
                price,
                quantity,
                selected_variant_values: selectedVariant
                    ? normalizeVariantValues(selectedVariant.variant_option_values)
                    : undefined,
            }),
        );

        toast.success(`${product.product_title} added to cart`, {
            position: "top-center",
        });
        setIsModalOpen(false);
        setSelectedVariantId(null);
        setQuantity(product.moq || 1);
    };

    return (
        <div className="group relative flex flex-col bg-white rounded-md border border-gray-100 p-2 sm:p-3 transition-all duration-300 hover:shadow-lg">
            {/* Discount Badge - Tightened */}
            {product.discount_percentage !== undefined &&
                product.discount_percentage > 0 && (
                    <div className="absolute top-0 left-2 z-10">
                        <div className="bg-primary text-white text-[10px] font-black px-1.5 py-1 rounded-b-md shadow-sm uppercase">
                            {product.discount_percentage}% Off
                        </div>
                    </div>
                )}

            {/* Quick View Trigger - Only Visible on Hover (Desktop) */}
            <button
                onClick={() => setIsQuickViewOpen(true)}
                aria-label="Quick view product"
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
            >
                <Eye className="w-4 h-4" />
            </button>

            {/* Product Image */}
            <div className="relative aspect-square mb-2 overflow-hidden bg-gray-50 rounded-md">
                <Link href={`/products/${product.url_handle}`} className="relative block h-full w-full">
                    <Image
                        src={product.thumbnail || "/placeholder.svg"}
                        alt={product.product_title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                    /></Link>
            </div>

            {/* Info Section */}
            <div className="flex-1 flex flex-col">
                <Link href={`/products/${product.url_handle}`}>
                    <h3 className="text-[12px] sm:text-sm font-semibold line-clamp-2 min-h-[32px] sm:min-h-[40px] text-gray-800 leading-tight hover:text-primary mb-1">
                        {product.product_title}
                    </h3>
                </Link>

                <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-primary font-black text-sm sm:text-base">
                        ৳{product.product_price}
                    </span>
                    {product.compare_at_price && (
                        <span className="text-gray-700 text-[10px] sm:text-xs line-through">
                            ৳{product.compare_at_price}
                        </span>
                    )}
                </div>

                {/* TIGHT ACTION BAR: Combined Quantity & Button */}
                <div className="flex items-center gap-1 mt-auto">

                    {/* Quantity (hidden on mobile) */}
                    <div className="hidden sm:flex items-center border border-gray-200 rounded-lg h-8 bg-gray-50/50">
                        <button
                            onClick={() => setQuantity((q) => Math.max(product.moq || 1, q - 1))}
                            aria-label="Decrease quantity"
                            className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                        >
                            <Minus size={12} />
                        </button>

                        <span className="w-5 text-center text-[11px] font-bold text-gray-700">
                            {quantity}
                        </span>

                        <button
                            onClick={() => setQuantity((q) => q + 1)}
                            aria-label="Increase quantity"
                            className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                        >
                            <Plus size={12} />
                        </button>
                    </div>

                    {/* Button */}
                    <Button
                        onClick={() =>
                            variants.length ? setIsModalOpen(true) : handleAddToCart()
                        }
                        disabled={!product?.is_pre_order && !product?.quantity}
                        size="sm"
                        className="w-full sm:flex-1 h-8 
                   bg-primary hover:bg-primary/90 
                   text-primary-foreground border-none rounded-xl 
                   flex items-center justify-center gap-2 
                   px-2.5 py-2.5 
                   font-medium no-underline 
                   transition-colors duration-200"
                    >
                        {product?.is_pre_order ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="hidden sm:inline text-[15px] font-normal">
                                    Pre-order
                                </span>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span className="sm:hidden text-[11px] font-bold uppercase">
                                    Pre
                                </span>
                            </div>
                        ) : product?.quantity ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="hidden sm:inline text-[15px] font-normal tracking-wider">
                                    Add to Cart
                                </span>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span className="sm:hidden text-[11px] font-bold uppercase">
                                    Add to Cart
                                </span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold uppercase opacity-60">
                                Out of Stock
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* QuickView Modal Component */}
            <QuickViewModal
                isOpen={isQuickViewOpen}
                onOpenChange={setIsQuickViewOpen}
                url_handle={product?.url_handle || ""}
            />

            {/* Portal for Variant Selection (Bottom Sheet Style on Mobile) */}
            {isModalOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-xl p-4 animate-in slide-in-from-bottom duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                                        {product.product_title}
                                    </h4>
                                    <p className="text-primary font-black">৳{price.toFixed(2)}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    aria-label="Close option selection"
                                    className="p-1 rounded-full bg-gray-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-6 max-h-48 overflow-y-auto">
                                {variants.map((v) => (
                                    <button
                                        key={v._id}
                                        onClick={() => setSelectedVariantId(v._id)}
                                        className={`text-[13px] md:text-[15px] p-1.5 rounded-md border-2 transition-all  font-[400] ${selectedVariantId === v._id
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {getVariantLabel(v)}
                                    </button>
                                ))}
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                className="w-full h-11 font-black  tracking-widest"
                            >
                                Confirm • ৳{(price * quantity).toFixed(2)}
                            </Button>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
