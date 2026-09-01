"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TProduct } from "@/types";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Facebook,
  Linkedin,
  Share2,
  ShoppingCart,
  Twitter,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSingleProductQuery } from "../Redux/RTK/productApi";
import { addToCart } from "../Redux/Slice/cartSlice";
import { useAppDispatch } from "../Redux/hooks";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

interface QuickViewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url_handle: string;
}

type TVariant = {
  _id?: string;
  id?: string;
  variant_option_values: Record<string, string> | Map<string, string>;
  variant_price: number;
  compare_at_price?: number;
};

export function QuickViewModal({
  isOpen,
  onOpenChange,
  url_handle,
}: QuickViewModalProps) {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useSingleProductQuery(url_handle, {
    skip: !isOpen,
  });

  const product: TProduct | undefined = data?.data?.product;
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);

  // Normalize Helper
  const normalizeValues = (val: any): Record<string, string> => {
    if (!val) return {};
    return val instanceof Map ? Object.fromEntries(val) : val;
  };

  // Initialize Default Options (From Detail Page Logic)
  useEffect(() => {
    if (product?.product_options?.length) {
      const initial: Record<string, string> = {};
      product.product_options.forEach((opt: any) => {
        if (opt.option_values.length > 0)
          initial[opt.option_name] = opt.option_values[0];
      });
      setSelectedOptions(initial);
      setActiveImage(product.product_images?.[0] ?? product.thumbnail);
    }
  }, [product]);

  const variants = (product?.product_variants || []) as TVariant[];

  // Get Selected Variant Logic
  const selectedVariant = variants.find((v) => {
    const vObj = normalizeValues(v.variant_option_values);
    return Object.entries(selectedOptions).every(
      ([key, value]) => String(vObj[key]) === String(value),
    );
  });

  const currentPrice =
    selectedVariant?.variant_price ?? product?.product_price ?? 0;
  const comparePrice =
    selectedVariant?.compare_at_price ?? product?.compare_at_price ?? 0;

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Please select all options");
      return;
    }

    dispatch(
      addToCart({
        product_id: product?._id!,
        variant_id: selectedVariant?._id ?? selectedVariant?.id ?? null,
        title: product?.product_title!,
        thumbnail: product?.thumbnail,
        price: currentPrice,
        quantity,
        selected_variant_values: selectedVariant
          ? normalizeValues(selectedVariant.variant_option_values)
          : undefined,
      }),
    );

    toast.success(`${product?.product_title} added to cart`);
    onOpenChange(false); // Close modal on success
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[850px] p-0 overflow-hidden border-none sm:rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <DialogClose 
          aria-label="Close modal"
          className="absolute right-3 top-3 z-50 p-1 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-red-50 transition"
        >
          <X className="w-5 h-5 text-red-500" />
        </DialogClose>

        <DialogHeader className="sr-only">
          <DialogTitle>{product?.product_title}</DialogTitle>
          <DialogDescription>
            View product details, select options and add to cart.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/2 p-4 md:p-6 space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
              </div>
              <div className="md:w-1/2 p-6 md:p-8 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row bg-white">
              {/* Left Side: Gallery */}
              <div className="md:w-5/12 p-4 md:p-6 bg-[#F8F9FA]">
                <div className="relative aspect-square rounded-xl bg-white border border-gray-100 overflow-hidden group">
                  <Image
                    src={activeImage || product?.thumbnail || ""}
                    alt="product"
                    fill
                    sizes="(max-width: 850px) 100vw, 400px"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product?.product_images?.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={cn(
                        "relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-lg border-2 transition-all",
                        activeImage === img
                          ? "border-primary bg-white"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                    >
                      <Image
                        src={img}
                        alt="thumb"
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="md:w-7/12 p-5 md:p-8 flex flex-col">
                <div className="mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px] uppercase font-bold"
                  >
                    {product?.category?.name || "Product"}
                  </Badge>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
                  {product?.product_title}
                </h2>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-extrabold t text-primary">
                    ${currentPrice.toFixed(2)}
                  </span>
                  {comparePrice > currentPrice && (
                    <span className="text-sm text-gray-600 line-through">
                      ${comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Options Selection - From Detail Page logic */}
                <div className="space-y-4 mb-6">
                  {product?.product_options?.map((option) => (
                    <div key={option.option_name} className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {option.option_name}:{" "}
                        <span className="text-gray-900">
                          {selectedOptions[option.option_name]}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {option.option_values.map((val) => {
                          const isActive =
                            selectedOptions[option.option_name] === val;
                          return (
                            <button
                              key={val}
                              onClick={() =>
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [option.option_name]: val,
                                }))
                              }
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md border transition-all flex items-center gap-1.5",
                                isActive
                                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                  : "border-gray-200 text-gray-600 hover:border-gray-400",
                              )}
                            >
                              {isActive && <Check className="w-3 h-3" />}
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add to Cart Actions */}
                <div className="flex items-center gap-2 mt-auto">
                  <div className="relative flex items-center border border-gray-200 rounded-md h-9 overflow-hidden">
                    <input
                      type="text"
                      value={quantity}
                      readOnly
                      className="w-10 text-center text-sm font-medium border-none focus:ring-0 focus-visible:outline-none"
                    />
                    <div className="flex flex-col border-l border-gray-200">
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        aria-label="Increase quantity"
                        className="px-1 hover:bg-gray-100 transition-colors border-b border-gray-200 h-1/2 flex items-center justify-center"
                      >
                        <ChevronUp className="w-3 h-3 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="px-1 hover:bg-gray-100 transition-colors h-1/2 flex items-center justify-center"
                      >
                        <ChevronDown className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <Button
                    disabled={!product?.quantity}
                    variant="outline"
                    onClick={handleAddToCart}
                    className={`
    flex-1 h-10 text-sm font-semibold
    transition-colors duration-200

    enabled:bg-primary enabled:text-white
    enabled:hover:bg-primary/80

    disabled:bg-slate-200
    disabled:text-slate-400
    disabled:border-slate-300
    disabled:cursor-not-allowed
    disabled:opacity-100
  `}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4 opacity-80" />
                    {product?.quantity ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>

                {/* Footer Info */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                  <div className="flex text-[11px] md:text-xs">
                    <span className="font-bold text-gray-600 w-20">SKU:</span>
                    <span className="text-gray-600">
                      {product?.sku || "N/A"}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-gray-500 line-clamp-2 italic">
                    {product?.product_description}
                  </p>
                </div>

                {/* Social Share */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-[10px] font-bold text-gray-600 uppercase">
                    Share:
                  </span>
                  <div className="flex gap-2.5">
                    {[Facebook, Twitter, Share2, Youtube, Linkedin].map(
                      (Icon, i) => (
                        <Icon
                          key={i}
                          aria-label={`Share on ${Icon.name}`}
                          className="w-3.5 h-3.5 text-gray-600 hover:text-primary cursor-pointer transition-colors"
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
