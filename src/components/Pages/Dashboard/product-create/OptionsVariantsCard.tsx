"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { MediaLibrary } from "@/components/ui/media-manager"
import type { ProductFormValues } from "@/lib/validators/productSchema"
import { ListTree, Plus, Sparkles, X } from "lucide-react"
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
                            Define attributes like size or color to auto-generate product SKUs.
                        </CardDescription>
                    </div>
                    <Button type="button" onClick={addOption} variant="outline" size="sm" className="h-8">
                        <Plus className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-6">
                {/* Options Section */}
                <div className="space-y-3">
                    {options.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground">No options defined. Click "Add Option" to start.</p>
                        </div>
                    ) : (
                        options.map((option, optionIndex) => (
                            <div key={optionIndex} className="relative group p-4 border rounded-lg bg-card hover:border-primary/30 transition-colors">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    onClick={() => removeOption(optionIndex)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Option Name</label>
                                        <Input
                                            value={option.name}
                                            onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                                            placeholder="e.g. Color"
                                            className="h-9"
                                            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Option Values</label>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {option.values.map((value, valueIndex) => (
                                                <Badge key={valueIndex} variant="secondary" className="pl-2 pr-1 py-0.5 gap-1 text-xs">
                                                    {value}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                                        className="hover:bg-destructive/20 rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={optionValue}
                                                onChange={(e) => setOptionValue(e.target.value)}
                                                placeholder="Add value..."
                                                className="h-8 text-sm"
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOptionValue(optionIndex))}
                                            />
                                            <Button type="button" size="sm" variant="secondary" className="h-8" onClick={() => addOptionValue(optionIndex)}>
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {options.length > 0 && (
                        <div className="flex justify-center pt-2">
                            <Button type="button"
                                className="w-full md:w-auto px-8"
                                disabled={!options.every((o) => o.name && o.values.length)}
                                onClick={() => generateVariants(options)}
                            >
                                Generate All Variants
                            </Button>
                        </div>
                    )}
                </div>

                {/* Variants Table Section */}
                {variants.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm inline-flex items-center gap-2">
                                Generated Variants
                                <Badge variant="outline" className="rounded-full text-[10px]">{variants.length}</Badge>
                            </h3>

                            {selectedIndices.length > 0 && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-2 p-1 pl-3 border rounded-md bg-primary/5 border-primary/20">
                                        <span className="text-[10px] font-bold text-primary uppercase whitespace-nowrap">
                                            Bulk Edit ({selectedIndices.length})
                                        </span>
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
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[120px]">Price (৳)</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[120px]">Compare (৳)</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[100px]">Quantity</th>
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
                                                <td key={j} className="px-3 py-2 font-medium">
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
                                                        <div className="relative h-10 w-10 rounded overflow-hidden border bg-background">
                                                            <Image
                                                                src={variant.image}
                                                                alt="Variant"
                                                                width={40}
                                                                height={40}
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
                                            <td className="px-3 py-2 font-mono">
                                                <Input
                                                    type="number"
                                                    value={variant.variant_price}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants]
                                                        newVariants[i] = { ...newVariants[i], variant_price: e.target.value }
                                                        setVariants(newVariants)
                                                    }}
                                                    className={`h-8 focus-visible:ring-1 ${selectedIndices.includes(i) ? 'border-primary' : ''}`}
                                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    value={variant.compare_at_price}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants]
                                                        newVariants[i] = { ...newVariants[i], compare_at_price: e.target.value }
                                                        setVariants(newVariants)
                                                    }}
                                                    className={`h-8 focus-visible:ring-1 text-muted-foreground ${selectedIndices.includes(i) ? 'border-primary' : ''}`}
                                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    value={variant.variant_quantity ?? 0}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants]
                                                        newVariants[i] = { ...newVariants[i], variant_quantity: Number(e.target.value) }
                                                        setVariants(newVariants)
                                                    }}
                                                    className={`h-8 focus-visible:ring-1 ${selectedIndices.includes(i) ? 'border-primary' : ''}`}
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
