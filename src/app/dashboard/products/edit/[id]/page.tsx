"use client"

import { useSingleProductByIdQuery, useUpdateProductMutation } from "@/components/Redux/RTK/productApi"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"

import BasicInfoCard from "@/components/Pages/Dashboard/product-create/BasicInfoCard"
import CategoryCard from "@/components/Pages/Dashboard/product-create/CategoryCard"
import InventoryCard from "@/components/Pages/Dashboard/product-create/InventoryCard"
import OptionsVariantsCard from "@/components/Pages/Dashboard/product-create/OptionsVariantsCard"
import DiscoverySettingsCard from "@/components/Pages/Dashboard/product-create/DiscoverySettingsCard"
import PhysicalDetailsCard from "@/components/Pages/Dashboard/product-create/PhysicalDetailsCard"
import PricingCard from "@/components/Pages/Dashboard/product-create/PricingCard"
import { type ProductFormValues, productResolver } from "@/lib/validators/productSchema"

export default function EditProductPage() {
    const { id } = useParams()
    const router = useRouter()
    const { data: productData, isLoading } = useSingleProductByIdQuery(id)
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()

    const [options, setOptions] = useState<{ name: string; values: string[] }[]>([])
    const [variants, setVariants] = useState<any[]>([])
    const [optionValue, setOptionValue] = useState("")

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
            barcode: "",
            brand: "",
            seo_title: "",
            seo_description: "",
            tags: [],
            continue_selling: false,
            quantity: 0,
            moq: 1,
            country_of_origin: "",
            product_categories: [],
            product_vendor: "",
            delivery_charge: {
                inside_dhaka: 60,
                outside_dhaka: 120,
            },
            product_status: "active",
            is_featured: false,
            is_trendy: false,
            is_limited_time_offer: false,
            is_pre_order: false,
            pre_order_message: "",
            product_options: [],
            product_variants: [],
        },
    })

    // 🔄 Initial Data Load (Edit logic)
    useEffect(() => {
        if (productData?.data?.product) {
            const product = productData.data.product
            form.reset({
                product_title: product.product_title || "",
                product_description: product.product_description || "",
                thumbnail: product.thumbnail || "",
                product_images: product.product_images || [],
                product_price: Number(product.product_price) || 0,
                compare_at_price: Number(product.compare_at_price) || 0,

                sku: product.sku || "",
                barcode: product.barcode || "",
                brand: product.brand || "",
                seo_title: product.seo_title || "",
                seo_description: product.seo_description || "",
                tags: product.tags || [],
                continue_selling: !!product.continue_selling,
                charge_tax: !!product.charge_tax,
                quantity: Number(product.quantity) || 0,
                moq: Number(product.moq) || 1,
                country_of_origin: product.country_of_origin || "",
                product_categories: (product.product_categories || []).map((c: any) => typeof c === 'string' ? c : c._id),

                product_vendor: product.product_vendor || "",
                delivery_charge: {
                    inside_dhaka: product.delivery_charge?.inside_dhaka || 60,
                    outside_dhaka: product.delivery_charge?.outside_dhaka || 120,
                },
                product_status: product.product_status || "active",
                is_featured: !!product.is_featured,
                is_trendy: !!product.is_trendy,
                is_limited_time_offer: !!product.is_limited_time_offer,
                is_pre_order: !!product.is_pre_order,
                pre_order_message: product.pre_order_message || "",
                product_attributes: product.product_attributes || [],
            })

            // Options sync logic
            if (product.product_options) {
                setOptions(product.product_options.map((o: any) => ({
                    name: o.option_name,
                    values: o.option_values
                })))
            }
            if (product.product_variants) {
                setVariants(product.product_variants)
            }
        }
    }, [productData, form])

    const normalizeVariantValues = (val: any): Record<string, string> => {
        if (!val) return {};
        if (val instanceof Map) return Object.fromEntries(val);
        if (typeof val === "object") return val;
        return {};
    };

    // --- Create Page theke copied same logic gulo niche ---
    const addOption = () => setOptions([...options, { name: "", values: [] }])

    const removeOption = (index: number) => {
        const deletedOptionName = options[index].name;
        const newOptions = options.filter((_, idx) => idx !== index)
        setOptions(newOptions)

        if (newOptions.length === 0) {
            setVariants([])
        } else if (variants.length > 0) {
            const newVariants = variants.map(v => {
                const vVals = { ...normalizeVariantValues(v.variant_option_values) };
                delete vVals[deletedOptionName];
                return {
                    ...v,
                    variant_option_values: vVals
                };
            });
            setVariants(newVariants);
        }
    }

    const updateOptionName = (index: number, name: string) => {
        const oldOptionName = options[index].name;
        const newOptions = options.map((opt, idx) => {
            if (idx === index) {
                return { ...opt, name }
            }
            return opt;
        })
        setOptions(newOptions)

        if (variants.length > 0 && oldOptionName) {
            const newVariants = variants.map(v => {
                const vVals = { ...normalizeVariantValues(v.variant_option_values) };
                if (oldOptionName in vVals) {
                    vVals[name] = vVals[oldOptionName];
                    delete vVals[oldOptionName];
                }
                return {
                    ...v,
                    variant_option_values: vVals
                };
            });
            setVariants(newVariants);
        }
    }

    const addOptionValue = (optionIndex: number) => {
        if (!optionValue) return
        const newOptions = options.map((opt, idx) => {
            if (idx === optionIndex) {
                return {
                    ...opt,
                    values: [...opt.values, optionValue]
                }
            }
            return opt;
        })
        setOptions(newOptions)
        setOptionValue("")
    }

    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        const optionName = options[optionIndex].name;
        const deletedValue = options[optionIndex].values[valueIndex];

        const newOptions = options.map((opt, idx) => {
            if (idx === optionIndex) {
                return {
                    ...opt,
                    values: opt.values.filter((_, vIdx) => vIdx !== valueIndex)
                }
            }
            return opt;
        })
        setOptions(newOptions)

        if (variants.length > 0) {
            const newVariants = variants.filter(v => {
                const vVals = normalizeVariantValues(v.variant_option_values);
                return String(vVals[optionName]) !== String(deletedValue);
            });
            setVariants(newVariants);
        }
    }


    const generateVariants = (optionsList: { name: string; values: string[] }[]) => {
        if (optionsList.length === 0 || optionsList.some(o => !o.name || o.values.length === 0)) {
            setVariants([])
            return
        }

        const generateCombinations = (
            options: { name: string; values: string[] }[],
            current: Record<string, string> = {},
            index = 0,
            result: Record<string, string>[] = [],
        ): Record<string, string>[] => {
            if (index === options.length) {
                result.push({ ...current })
                return result
            }

            const option = options[index]
            for (const value of option.values) {
                current[option.name] = value
                generateCombinations(options, current, index + 1, result)
            }
            return result
        }

        const combinations = generateCombinations(optionsList)
        const newVariants = combinations.map((combination) => ({
            variant_option_values: combination,
            variant_price: String(form.getValues("product_price") || 0),
            compare_at_price: String(form.getValues("compare_at_price") || 0),
            variant_quantity: 0,
            image: "",
            product_weight: 0,
        }))

        setVariants(newVariants)
    }

    async function onSubmit(data: ProductFormValues) {
        const totalVariantStock = variants.length > 0
            ? variants.reduce((sum, v) => sum + Number(v.variant_quantity || 0), 0)
            : Number(data.quantity || 0);

        const payload = {
            ...data,
            quantity: totalVariantStock,
            product_options: options.map(o => ({ option_name: o.name, option_values: o.values })),
            product_variants: variants.map(v => ({
                ...v,
                variant_price: Number(v.variant_price),
                compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : undefined,
                variant_quantity: Number(v.variant_quantity || 0),
                sku: v.sku || undefined,
                barcode: v.barcode || undefined,
                image: v.image || undefined,
            }))
        }

        try {
            await updateProduct({ id, data: payload }).unwrap()
            toast.success("Product updated successfully")
            router.push("/dashboard/products")
        } catch (error) {
            toast.error("Failed to update product")
        }
    }

    if (isLoading) return <div className="p-10 text-center">Loading product data...</div>

    return (
        <div className="max-w-full mx-auto pb-12 pt-2 px-3 sm:px-6 space-y-4">
            {/* Header Area */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/products"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                        Edit Product: <span className="text-primary font-black">{form.watch("product_title")}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            form.watch("product_status") === "active"
                                ? "default"
                                : "secondary"
                        }
                    >
                        {form.watch("product_status") || "draft"}
                    </Badge>
                </div>
            </div>

            <Form {...form}>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onSubmit, (errors) => {
                        console.error("Form Validation Errors:", errors);
                        toast.error("Please fix the errors in the form before submitting.");
                    })}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                        }
                    }}
                >
                    {/* Basic Information */}
                    <BasicInfoCard form={form} />

                    {/* Pricing */}
                    <PricingCard form={form} />

                    {/* Inventory & Barcode */}
                    <InventoryCard form={form} hasVariants={variants.length > 0} />

                    {/* Variants Matrix */}
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

                    {/* Category Selection */}
                    <CategoryCard form={form} />

                    {/* Discovery & SEO Settings */}
                    <DiscoverySettingsCard form={form} />

                    {/* Physical Details & Shipping */}
                    <PhysicalDetailsCard form={form} />

                    {/* Action Bar Footer */}
                    <div className="flex sm:flex-row flex-col items-center justify-end gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <Link
                            href="/dashboard/products"
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors order-last sm:order-first px-3 py-2"
                        >
                            Cancel
                        </Link>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => {
                                form.setValue("product_status", "draft");
                                form.handleSubmit(onSubmit)();
                            }}
                            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold"
                        >
                            Save as Draft
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            onClick={() => {
                                form.setValue("product_status", "active");
                            }}
                            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm"
                        >
                            {isUpdating ? "Updating..." : "Update Product"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
