"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { MediaLibrary } from "@/components/ui/media-manager"
import type { ProductFormValues } from "@/lib/validators/productSchema"
import { ListTree, Plus, Sparkles, X, Barcode } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"

export default function OptionsVariantsSeoCard({
    options,
    optionValue,
    setOptionValue,
    addOption,
    removeOption,
    updateOptionName,
    addOptionValue,
    removeOptionValue,
    variants,
    setVariants,
    generateVariants,
}: {
    options: { name: string; values: string[] }[]
    optionValue: string
    setOptionValue: (s: string) => void
    addOption: () => void
    removeOption: (i: number) => void
    updateOptionName: (i: number, n: string) => void
    addOptionValue: (i: number) => void
    removeOptionValue: (i: number, v: number) => void
    variants: any[]
    setVariants: (v: any[]) => void
    generateVariants: (o: { name: string; values: string[] }[]) => void
    form: UseFormReturn<ProductFormValues>
}) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([])
    const [bulkPrice, setBulkPrice] = useState("")
    const [bulkComparePrice, setBulkComparePrice] = useState("")
    const [bulkQuantity, setBulkQuantity] = useState("")

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIndices(variants.map((_, i) => i))
        } else {
            setSelectedIndices([])
        }
    }

    const toggleSelect = (index: number, checked: boolean) => {
        if (checked) {
            setSelectedIndices(prev => [...prev, index])
        } else {
            setSelectedIndices(prev => prev.filter(i => i !== index))
        }
    }

    const applyBulkUpdate = () => {
        if (!bulkPrice && !bulkComparePrice && !bulkQuantity) return

        const newVariants = [...variants]
        selectedIndices.forEach(index => {
            const updated = { ...newVariants[index] }
            if (bulkPrice) updated.variant_price = bulkPrice
            if (bulkComparePrice) updated.compare_at_price = bulkComparePrice
            if (bulkQuantity) updated.variant_quantity = Number(bulkQuantity)
            newVariants[index] = updated
        })
        setVariants(newVariants)
        setBulkPrice("")
        setBulkComparePrice("")
        setBulkQuantity("")
        setSelectedIndices([])
    }

    const autoGenerateVariantBarcodes = () => {
        const newVariants = variants.map((v, idx) => {
            const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000);
            return {
                ...v,
                barcode: v.barcode || String(randomBarcode),
            };
        });
        setVariants(newVariants);
    };

    return (
        <Card className="shadow-sm border-muted-foreground/20">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ListTree className="h-5 w-5 text-primary" />
                            Variants Configuration
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Define attributes like size or color to auto-generate variant combinations, SKUs & barcodes.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {variants.length > 0 && (
                            <Button
                                type="button"
                                onClick={autoGenerateVariantBarcodes}
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-indigo-600 hover:bg-indigo-50"
                            >
                                <Barcode className="h-3.5 w-3.5 mr-1" /> Auto Barcodes
                            </Button>
                        )}
                        <Button type="button" onClick={addOption} variant="outline" size="sm" className="h-8">
                            <Plus className="h-4 w-4 mr-1" /> Add Option
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
                {options.map((option, index) => (
                    <div key={index} className="p-4 rounded-xl border bg-muted/20 space-y-3 relative group">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Option Name</label>
                                <Input
                                    value={option.name}
                                    placeholder="e.g. Size, Color, Material"
                                    onChange={(e) => updateOptionName(index, e.target.value)}
                                    className="h-9 font-medium"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Option Values</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={optionValue}
                                        placeholder="Type a value and click Add (e.g. Red, XL)"
                                        onChange={(e) => setOptionValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                addOptionValue(index)
                                            }
                                        }}
                                        className="h-9"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => addOptionValue(index)}
                                        variant="secondary"
                                        size="sm"
                                        className="h-9 px-4"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {option.values.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {option.values.map((val, valIdx) => (
                                    <Badge
                                        key={valIdx}
                                        variant="secondary"
                                        className="pl-2.5 pr-1.5 py-1 text-xs font-medium flex items-center gap-1.5 bg-background border"
                                    >
                                        {val}
                                        <button
                                            type="button"
                                            onClick={() => removeOptionValue(index, valIdx)}
                                            className="text-muted-foreground hover:text-destructive rounded-full hover:bg-muted p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {variants.length > 0 && (
                    <div className="space-y-4 pt-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="font-semibold text-sm">
                                Generated Variant Matrix ({variants.length})
                            </h4>

                            {selectedIndices.length > 0 && (
                                <div className="flex items-center gap-2 bg-primary/10 p-1 px-2.5 rounded-lg border border-primary/20 text-xs animate-in fade-in">
                                    <span className="font-medium text-primary">{selectedIndices.length} selected</span>
                                    <div className="h-4 w-px bg-primary/20" />
                                    <div className="flex items-center gap-1.5">
                                        <Input
                                            type="number"
                                            placeholder="Price"
                                            value={bulkPrice}
                                            onChange={(e) => setBulkPrice(e.target.value)}
                                            className="h-7 w-20 text-xs py-0"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyBulkUpdate())}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Compare"
                                            value={bulkComparePrice}
                                            onChange={(e) => setBulkComparePrice(e.target.value)}
                                            className="h-7 w-20 text-xs py-0"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyBulkUpdate())}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Qty"
                                            value={bulkQuantity}
                                            onChange={(e) => setBulkQuantity(e.target.value)}
                                            className="h-7 w-16 text-xs py-0"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyBulkUpdate())}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={applyBulkUpdate}
                                            className="h-7 text-[10px] px-2"
                                        >
                                            <Sparkles className="h-3 w-3 mr-1" /> Apply
                                        </Button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedIndices([])}
                                        className="h-7 w-7 p-0 rounded-full"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="rounded-md border bg-muted/10 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-3 py-2 text-left w-[40px]">
                                            <Checkbox
                                                checked={selectedIndices.length === variants.length && variants.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </th>
                                        {options.map((option, i) => (
                                            <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{option.name}</th>
                                        ))}
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[80px]">Image</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[110px]">Price (৳)</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[110px]">Compare (৳)</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[90px]">Stock</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[120px]">SKU</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[120px]">Barcode</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {variants.map((variant, i) => (
                                        <tr key={i} className={`hover:bg-muted/5 transition-colors ${selectedIndices.includes(i) ? 'bg-primary/5' : ''}`}>
                                            <td className="px-3 py-2">
                                                <Checkbox
                                                    checked={selectedIndices.includes(i)}
                                                    onCheckedChange={(checked) => toggleSelect(i, !!checked)}
                                                />
                                            </td>
                                            {options.map((option, j) => (
                                                <td key={j} className="px-3 py-2 font-medium text-xs">
                                                    {variant.variant_option_values[option.name]}
                                                </td>
                                            ))}
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <MediaLibrary
                                                        onSelect={(files) => {
                                                            if (files.length > 0) {
                                                                const newVariants = [...variants]
                                                                newVariants[i] = { ...newVariants[i], image: files[0].url }
                                                                setVariants(newVariants)
                                                            }
                                                        }}
                                                        multiple={false}
                                                        maxFiles={1}
                                                        title={variant.image ? "Change" : "Select"}
                                                    />

                                                    {variant.image ? (
                                                        <div className="relative h-9 w-9 rounded overflow-hidden border bg-background shrink-0">
                                                            <Image
                                                                src={variant.image}
                                                                alt="Variant"
                                                                width={36}
                                                                height={36}
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newVariants = [...variants]
                                                                    newVariants[i] = { ...newVariants[i], image: "" }
                                                                    setVariants(newVariants)
                                                                }}
                                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 hover:bg-red-600 transition-colors"
                                                            >
                                                                <X className="h-2 w-2" />
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 font-mono">
                                                <Input
                                                    type="number"
                                                    value={variant.variant_price}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants]
                                                        newVariants[i] = { ...newVariants[i], variant_price: e.target.value }
                                                        setVariants(newVariants)
                                                    }}
                                                    className={`h-8 text-xs ${selectedIndices.includes(i) ? 'border-primary' : ''}`}
                                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <Input
                                                    type="number"
                                                    value={variant.compare_at_price || ""}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants]
                                                        newVariants[i] = { ...newVariants[i], compare_at_price: e.target.value }
                                                        setVariants(newVariants)
                                                    }}
                                                    className={`h-8 text-xs text-muted-foreground ${selectedIndices.includes(i) ? 'border-primary' : ''}`}
                                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <Input
                                                    type="number"
                                                    value={variant.variant_quantity ?? 0}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants]
                                                        newVariants[i] = { ...newVariants[i], variant_quantity: Number(e.target.value) }
                                                        setVariants(newVariants)
                                                    }}
                                                    className={`h-8 text-xs ${selectedIndices.includes(i) ? 'border-primary' : ''}`}
                                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <Input
                                                    type="text"
                                                    placeholder="SKU"
                                                    value={variant.sku || ""}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants]
                                                        newVariants[i] = { ...newVariants[i], sku: e.target.value }
                                                        setVariants(newVariants)
                                                    }}
                                                    className="h-8 text-xs font-mono"
                                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Barcode"
                                                    value={variant.barcode || ""}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants]
                                                        newVariants[i] = { ...newVariants[i], barcode: e.target.value }
                                                        setVariants(newVariants)
                                                    }}
                                                    className="h-8 text-xs font-mono"
                                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
