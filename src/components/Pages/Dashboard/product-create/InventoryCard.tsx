import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Barcode, Plus, Sparkles, Trash2 } from "lucide-react"

import type { ProductFormValues } from "@/lib/validators/productSchema"
import type { UseFormReturn } from "react-hook-form"
import { useFieldArray } from "react-hook-form"

export default function InventoryCard({
    form,
    hasVariants = false,
}: {
    form: UseFormReturn<ProductFormValues>
    hasVariants?: boolean
}) {
    const { data: categories } = useAllCategoryQuery(false)
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "product_attributes",
    })

    const getCategoryCode = (name?: string) => {
        if (!name) return "PRD";
        const words = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return "PRD";
        if (words.length === 1) return words[0].substring(0, 4).toUpperCase();
        if (words.length === 2) {
            return `${words[0].charAt(0).toUpperCase()}${words[1].substring(0, 3).toUpperCase()}`;
        }
        return words.map(w => w.charAt(0).toUpperCase()).join("").substring(0, 4);
    };

    const getProductCode = (title?: string) => {
        if (!title) return "ITM";
        const words = title.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return "ITM";
        if (words.length === 1) return words[0].substring(0, 4).toUpperCase();
        if (words.length === 2) {
            return `${words[0].charAt(0).toUpperCase()}${words[1].substring(0, 3).toUpperCase()}`;
        }
        return words.map(w => w.charAt(0).toUpperCase()).join("").substring(0, 4);
    };

    const generateSKU = () => {
        const title = form.getValues("product_title") || "PRD";
        const selectedCatIds = form.getValues("product_categories") || [];
        const matchedCategory = categories?.find((c: any) => selectedCatIds.includes(c._id));

        const catCode = getCategoryCode(matchedCategory?.name);
        const prodCode = getProductCode(title);
        const rand = Math.floor(1000 + Math.random() * 9000);
        const generatedSKU = `${catCode}-${prodCode}-${rand}`;
        form.setValue("sku", generatedSKU, { shouldValidate: true });
    };

    const generateBarcode = () => {
        // Generate EAN/Code-128 random numeric barcode
        const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000);
        form.setValue("barcode", String(randomDigits), { shouldValidate: true });
    };

    return (
        <div className="rounded-lg border bg-card p-4 space-y-4 shadow-2xs">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                Inventory & Barcode
            </h3>

            {hasVariants ? (
                <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>
                        <strong>Variants Active:</strong> Stock, SKU, and Barcodes are managed per variant in the <strong>Variants Matrix</strong> below.
                    </span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SKU Field */}
                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-xs font-semibold">SKU (Stock Keeping Unit)</FormLabel>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={generateSKU}
                                    className="h-6 px-2 text-primary hover:text-primary hover:bg-primary/5 gap-1"
                                >
                                    <Sparkles size={13} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Auto SKU</span>
                                </Button>
                            </div>
                            <FormControl>
                                <Input placeholder="e.g. SKU-SHIRT-8921" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Barcode Field */}
                <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-xs font-semibold">Barcode (ISBN, UPC, GTIN)</FormLabel>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={generateBarcode}
                                    className="h-6 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1"
                                >
                                    <Barcode size={13} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Auto Barcode</span>
                                </Button>
                            </div>
                            <FormControl>
                                <Input placeholder="e.g. 890123456789" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Quantity */}
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-semibold">Stock Quantity</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    value={field.value ?? 0}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* MOQ */}
                <FormField
                    control={form.control}
                    name="moq"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-semibold">Minimum Order Quantity (MOQ)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="1"
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

            {/* Continue selling checkbox */}
            <FormField
                control={form.control}
                name="continue_selling"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-1">
                        <FormControl>
                            <Checkbox
                                checked={field.value ?? false}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <FormLabel className="text-xs font-medium text-slate-700 cursor-pointer">
                            Continue selling when out of stock
                        </FormLabel>
                    </FormItem>
                )}
            />
                </>
            )}

            {/* Custom Attributes */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Product Attributes</h4>
                    <Button type="button" variant="secondary" size="sm" onClick={() => append({ label: "", value: "" })}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Attribute
                    </Button>
                </div>

                {fields.length === 0 && <p className="text-xs text-muted-foreground">No custom attributes added yet.</p>}

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
                                        <Input placeholder="Value (e.g. 100% Cotton)" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-1 text-destructive hover:bg-destructive/10"
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
