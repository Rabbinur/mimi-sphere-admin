"use client"

import { ArrowLeft, ChevronRight, Loader2, Search } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import BasicInfoCard from "@/components/Pages/Dashboard/product-create/BasicInfoCard";
import CategoryCard from "@/components/Pages/Dashboard/product-create/CategoryCard";
import DiscoverySettingsCard from "@/components/Pages/Dashboard/product-create/DiscoverySettingsCard";
import InventoryCard from "@/components/Pages/Dashboard/product-create/InventoryCard";
import OptionsVariantsCard from "@/components/Pages/Dashboard/product-create/OptionsVariantsCard";
import PhysicalDetailsCard from "@/components/Pages/Dashboard/product-create/PhysicalDetailsCard";
import PricingCard from "@/components/Pages/Dashboard/product-create/PricingCard";

import { useCreateProductMutation } from "@/components/Redux/RTK/productApi";
import { type ProductFormValues, productResolver } from "@/lib/validators/productSchema";
import { getProxiedUrl } from "@/lib/utils";


export interface TypeAlgProduct {
    availability: string;
    brand: string;
    brandId: string;
    categoryId: number;
    topCategoryId: number;
    secondCategoryId: number;
    thirdCategoryId: number;
    description: string;
    detail_url: string;
    feedback: any[];
    id: number;
    propertyNames: string[];
    item_weight: number;
    name: string;
    totalSold: string;
    orders: number;
    rating: string;
    pictures: string[];
    price: number;
    price_range: [number, number][];
    specs: TypeAlgSpec[];
    videos: TypeAlgVideo[];
    shop_id: string;
    shop_name: string;
    shop_rating: string;
    relatedGroups: any[];
    store: string;
    totalAvailableQuantity: number;
    props_list: Record<string, string>;
    props_name: string;
    props_imgs: TypeAlgPropsImages;
    variants: TypeAlgVariant[];
    moq: number;
    batch: number;
}

export interface TypeAlgSpec {
    name: string;
    value: string;
    attributeId: string;
    array: TypeAlgSpecItem[];
    IsConfigurator: boolean;
    PropertyName: string;
}

export interface TypeAlgSpecItem {
    Pid: string;
    Vid: string;
    name: string;
    value: string;
    skuImageUrl: string | null;
}

export interface TypeAlgVideo {
    PreviewUrl: string;
    Url: string;
}

export interface TypeAlgPropsImages {
    prop_img: TypeAlgPropImage[];
}

export interface TypeAlgPropImage {
    properties: string;
    url: string;
    propertyName: string;
    value: string;
}

export interface TypeAlgVariant {
    price: string;
    properties: string;
    properties_name: string;
    quantity: number;
    sales: number;
    sku_id: number;
    spec_id: string;
    total_price: number;
    weight: number;
}

const ProductFetcher: React.FC = () => {
    const [productId, setProductId] = useState<string>("");
    const [fetching, setFetching] = useState<boolean>(false);
    const [createProduct, { isLoading: isSaving }] = useCreateProductMutation();
    const [algProduct, setAlgProduct] = useState<TypeAlgProduct | null>(null);

    // Form logic
    const [options, setOptions] = useState<{ name: string; values: string[] }[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [optionValue, setOptionValue] = useState("");

    const form = useForm<ProductFormValues>({
        resolver: productResolver,
        defaultValues: {
            product_title: "",
            product_description: "",
            thumbnail: "",
            product_images: [],
            product_price: 0,
            compare_at_price: 0,
            sku: "",
            quantity: 0,
            moq: 1,
            product_categories: [],
            product_status: "active",
            delivery_charge: {
                inside_dhaka: 60,
                outside_dhaka: 120,
            },
            is_featured: false,
            is_trendy: false,
            is_limited_time_offer: false,
            is_pre_order: false,
            pre_order_message: "",
            product_options: [],
            product_variants: [],
        },
    });

    const convertAlgToInternal = (product: TypeAlgProduct) => {
        const product_images = (product.pictures || []).map(getProxiedUrl);
        const thumbnail = product_images.length > 0 ? product_images[0] : "";

        // Proxy images in HTML description
        const proxiedDescription = product.description?.replace(
            /(src|href)="([^"]+)"/g,
            (match, attr, url) => {
                return `${attr}="${getProxiedUrl(url)}"`;
            }
        );

        // Extract price from range if base price is 0
        const basePrice = product.price || (product.price_range && product.price_range.length > 0 ? product.price_range[0][1] : 0);

        const optionsMap: Record<string, Set<string>> = {};
        const internalVariants = product.variants?.map((v) => {
            const optionValues: Record<string, string> = {};
            if (v.properties_name) {
                v.properties_name.split(";").forEach((pair) => {
                    const parts = pair.split(":");
                    let key = "";
                    let val = "";

                    // Handle format "0:0:Color:Pink"
                    if (parts.length >= 4) {
                        key = parts[2];
                        val = parts.slice(3).join(":");
                    } else if (parts.length === 2) {
                        key = parts[0];
                        val = parts[1];
                    }

                    if (key && val) {
                        optionValues[key] = val;
                        if (!optionsMap[key]) optionsMap[key] = new Set();
                        optionsMap[key].add(val);
                    }
                });
            }

            let variantImage = "";
            if (product.props_imgs?.prop_img) {
                const matchingImg = product.props_imgs.prop_img.find(pi => v.properties.includes(pi.properties));
                if (matchingImg) variantImage = getProxiedUrl(matchingImg.url);

            }

            return {
                variant_option_values: optionValues,
                variant_price: parseFloat(v.price) || v.total_price || basePrice,
                variant_quantity: v.quantity || 0,
                compare_at_price: parseFloat(v.price) || v.total_price || basePrice,
                image: variantImage,
            };
        }) || [];

        const product_options = Object.keys(optionsMap).map((name) => ({
            option_name: name,
            option_values: Array.from(optionsMap[name]),
        }));

        const product_attributes = product.specs?.map((spec) => ({
            label: spec.name,
            value: spec.value,
        })) || [];

        return {
            product_title: product.name,
            product_description: proxiedDescription,
            thumbnail,
            product_images,
            product_price: basePrice,
            compare_at_price: basePrice,
            sku: product.id.toString(),
            quantity: product.totalAvailableQuantity || 0,
            moq: product.moq || 1,
            product_categories: [],
            product_vendor: product.brand || product.shop_name || "",
            product_status: "active" as "active" | "draft",
            delivery_charge: {
                inside_dhaka: 60,
                outside_dhaka: 120,
            },
            product_options,
            product_variants: internalVariants,
            product_attributes,
            is_featured: false,
            is_trendy: false,
            is_limited_time_offer: false,
            is_pre_order: false,
            pre_order_message: "",
        };
    };

    const handleFetch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId) {
            toast.error("Please enter a product ID");
            return;
        }

        try {
            setFetching(true);
            const response = await fetch(`https://alg.com.bd/api/products/${productId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            setAlgProduct(data);
            const converted = convertAlgToInternal(data);

            // Update form
            form.reset(converted);

            // Update local state for options/variants cards
            setOptions(converted.product_options.map(o => ({ name: o.option_name, values: o.option_values })));
            setVariants(converted.product_variants);

            toast.success("Product fetched and converted!");
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Failed to fetch product");
        } finally {
            setFetching(false);
        }
    };

    async function onSubmit(data: ProductFormValues) {
        try {
            const payload: any = { ...data };

            // Clean description images (No longer needed since we want them proxied)
            const processedVariants = variants.map((variant) => ({
                ...variant,
                variant_price: Number(variant.variant_price),
                compare_at_price: variant.compare_at_price ? Number(variant.compare_at_price) : undefined,
            }));


            if (options.length > 0) {
                payload.product_options = options.map((option) => ({
                    option_name: option.name,
                    option_values: option.values,
                }));
            }

            payload.product_variants = processedVariants;

            const response = await createProduct({ data: payload }).unwrap();
            if (response.success) {
                toast.success("Product imported and saved successfully");
                setAlgProduct(null);
                setProductId("");
                form.reset();
            } else {
                toast.error("Error saving product");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to save product");
        }
    }

    // Helper functions for Options/Variants card
    const addOption = () => setOptions([...options, { name: "", values: [] }]);
    const removeOption = (index: number) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };
    const updateOptionName = (index: number, name: string) => {
        const newOptions = [...options];
        newOptions[index].name = name;
        setOptions(newOptions);
    };
    const addOptionValue = (optionIndex: number) => {
        if (!optionValue) return;
        const newOptions = [...options];
        newOptions[optionIndex].values.push(optionValue);
        setOptions(newOptions);
        setOptionValue("");
    };
    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        const newOptions = [...options];
        newOptions[optionIndex].values.splice(valueIndex, 1);
        setOptions(newOptions);
    };
    const generateVariants = (optionsList: { name: string; values: string[] }[]) => {
        // Implementation similar to create page if needed, but we mostly use converted ones
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/products" className="rounded-md p-1 hover:bg-muted">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Products</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="font-medium text-foreground">Import Alg Product</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-8 px-4 lg:px-8 pb-20">
                <div className="max-w-2xl mx-auto mb-10">
                    <h2 className="text-2xl font-bold mb-4">Import from Alg</h2>
                    <form onSubmit={handleFetch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter Product ID (e.g. 100500...)"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" disabled={fetching}>
                            {fetching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {fetching ? "Fetching..." : "Fetch Product"}
                        </Button>
                    </form>
                </div>

                {algProduct && (
                    <Form {...form}>
                        <form className="grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="lg:col-span-2 space-y-8">
                                <section className="p-4 border rounded-lg bg-blue-50/50 border-blue-100 space-y-4">
                                    <h3 className="text-sm font-semibold text-blue-700">Comparison Reference (Original)</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Original Title</p>
                                            <p className="font-medium truncate" title={algProduct.name}>{algProduct.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Original Price</p>
                                            <p className="font-medium">
                                                ¥ {algProduct.price || (algProduct.price_range && algProduct.price_range.length > 0 ? algProduct.price_range[0][1] : 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {form.watch("product_attributes") && form.watch("product_attributes")!.length > 0 && (
                                        <div className="pt-2 border-t border-blue-100">
                                            <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">Specifications</p>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                                {form.watch("product_attributes")?.map((attr, i) => (
                                                    <div key={i} className="flex justify-between border-b border-blue-50 pb-1">
                                                        <span className="text-muted-foreground">{attr.label}</span>
                                                        <span className="font-medium text-right">{attr.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </section>

                                <BasicInfoCard form={form} />
                                <PricingCard form={form} />

                                <OptionsVariantsCard
                                    options={options}
                                    optionValue={optionValue}
                                    setOptionValue={setOptionValue}
                                    addOption={addOption}
                                    removeOption={removeOption}
                                    updateOptionName={updateOptionName}
                                    addOptionValue={addOptionValue}
                                    removeOptionValue={removeOptionValue}
                                    variants={variants}
                                    setVariants={setVariants}
                                    generateVariants={generateVariants}
                                    form={form}
                                />
                            </div>

                            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                                <div className="rounded-lg border bg-card p-4">
                                    <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Status</h3>
                                    <Badge variant={form.watch("product_status") === "active" ? "default" : "secondary"}>
                                        {form.watch("product_status")}
                                    </Badge>
                                </div>

                                <div className="rounded-lg border bg-card p-4">
                                    <InventoryCard form={form} />
                                </div>

                                <DiscoverySettingsCard form={form} />

                                <CategoryCard form={form} />

                                <div className="rounded-lg border bg-card p-4">
                                    <PhysicalDetailsCard form={form} />
                                </div>

                                <div className="rounded-lg border bg-card p-4 space-y-3">
                                    <Button type="submit" className="w-full" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {isSaving ? "Saving Product..." : "Save Imported Product"}
                                    </Button>
                                    <Button type="button" variant="outline" className="w-full" onClick={() => setAlgProduct(null)}>
                                        Discard
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default ProductFetcher;
