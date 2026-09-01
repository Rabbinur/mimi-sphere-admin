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
            quantity: 0,
            moq: 0,
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
                quantity: Number(product.quantity) || 0,
                moq: Number(product.moq) || 0,
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
        const payload = {
            ...data,
            product_options: options.map(o => ({ option_name: o.name, option_values: o.values })),
            product_variants: variants.map(v => ({
                ...v,
                variant_price: Number(v.variant_price),
                compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : undefined,
                variant_quantity: Number(v.variant_quantity || 0),
                image: v.image,
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
                            <span className="font-medium text-foreground">Edit Product</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-8 px-4 lg:px-8">
                <Form {...form}>
                    <form
                        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
                        onSubmit={form.handleSubmit(onSubmit, (errors) => {
                            console.error("Form Validation Errors:", errors);
                            toast.error("Please fix the errors in the form before submitting.");
                        })}
                    >
                        <div className="lg:col-span-2 space-y-8">
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

                            <div className="    rounded-lg border bg-card p-4">
                                <InventoryCard form={form} />
                            </div>

                            <DiscoverySettingsCard form={form} />

                            <CategoryCard form={form} />

                            <div className="rounded-lg border bg-card p-4">
                                <PhysicalDetailsCard form={form} />
                            </div>
                            <div className="rounded-lg border bg-card p-4 space-y-3">
                                <Button type="submit" className="w-full" disabled={isUpdating}>
                                    {isUpdating ? "Updating..." : "Update Product"}
                                </Button>
                                <Button type="button" variant="outline" className="w-full" asChild>
                                    <Link href="/dashboard/products">Cancel</Link>
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
