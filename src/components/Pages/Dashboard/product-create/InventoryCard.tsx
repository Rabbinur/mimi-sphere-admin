"use client"

// File: components/Pages/Dashboard/product-create/InventoryCard.tsx

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Plus, Sparkles, Trash2 } from "lucide-react"

import type { ProductFormValues } from "@/lib/validators/productSchema"
import type { UseFormReturn } from "react-hook-form"
import { useFieldArray } from "react-hook-form"

export default function InventoryCard({
    form,
}: {
    form: UseFormReturn<ProductFormValues>
}) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "product_attributes",
    })

    const generateSKU = () => {
        // 🚀 Professional SKU Logic: [PREFIX]-[CAT_CODE]-[UNIQUE_ID]
        const prefix = "SKU"

        // Try to get category name for a better code (e.g. ELECTRONICS -> ELC)
        const categories = form.getValues("product_categories")
        let catCode = "GEN" // General fallback

        // This is a browser-side mock of category coding
        // In a real app, you might have a map of CategoryID -> ShortCode
        if (categories && categories.length > 0) {
            catCode = categories[0].substring(0, 3).toUpperCase()
        }

        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
        const timestampPart = Date.now().toString().slice(-4)

        const generatedSKU = `${prefix}-${catCode}-${randomPart}${timestampPart}`
        form.setValue("sku", generatedSKU, { shouldValidate: true })
    }



    return (
        // <Card className="p-2 md:p-4 shadow-sm rounded-md">
        //     <CardHeader className="p-2 md:p-4">
        //         <CardTitle>Inventory Information</CardTitle>
        //         <CardDescription>Manage your product inventory and custom attributes.</CardDescription>
        //     </CardHeader>

        //     <CardContent className="space-y-6 p-2 md:p-4">

        //     </CardContent>
        // </Card>


        <div className="rounded-lg">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                Inventory Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>SKU</FormLabel>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={generateSKU}
                                    className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/5 gap-1.5"
                                >
                                    <Sparkles size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Auto</span>
                                </Button>
                            </div>
                            <FormControl>
                                <Input placeholder="SKU (e.g. 12345)" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Quantity"
                                    {...field}
                                    value={field.value ?? 0}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="moq"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Minimum Order Quantity (MOQ)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Minimum Order Quantity (MOQ)"
                                    {...field}
                                    value={field.value ?? 1}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Product Attributes</h4>
                    <Button type="button" variant="secondary" size="sm" onClick={() => append({ label: "", value: "" })}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Attribute
                    </Button>
                </div>

                {fields.length === 0 && <p className="text-sm text-muted-foreground">No attributes added yet.</p>}

                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start">
                        <FormField
                            control={form.control}
                            name={`product_attributes.${index}.label`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Label (e.g. Material)" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`product_attributes.${index}.value`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Value (e.g. Cotton)" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-1 text-destructive"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
