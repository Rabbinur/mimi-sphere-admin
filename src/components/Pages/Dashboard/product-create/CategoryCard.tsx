"use client"

import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi"
import { Badge } from "@/components/ui/badge"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ProductFormValues } from "@/lib/validators/productSchema"
import type { TCategory } from "@/types"
import { Search, Tag, X } from "lucide-react"
import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"

export default function CategoryCard({ form }: { form: UseFormReturn<ProductFormValues> }) {
    const { data: categories } = useAllCategoryQuery(false)
    const [searchTerm, setSearchTerm] = useState("")

    const selectedIds = form.watch("product_categories") || []

    const filteredCategories = categories?.filter((category: TCategory) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    const selectedCategories = categories?.filter((c: TCategory) => selectedIds.includes(c._id)) || []

    return (
        <div className="rounded-lg border bg-card p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <Tag size={14} className="text-primary" />
                    Product Categories
                </h3>
                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                        <>
                            <button 
                                type="button"
                                onClick={() => form.setValue("product_categories", [])}
                                className="text-[10px] text-destructive hover:underline font-medium"
                            >
                                Clear All
                            </button>
                            <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                                {selectedIds.length}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search categories..."
                    className="pl-9 h-9 text-xs focus-visible:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Selected Badges Preview */}
            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1 scrollbar-hide">
                    {selectedCategories.map((c: TCategory) => (
                        <Badge key={c._id} variant="secondary" className="text-[10px] px-2 py-0 h-5 flex items-center gap-1 bg-primary/10 text-primary border-transparent hover:bg-primary/20">
                            {c.name}
                            <X 
                                size={10} 
                                className="cursor-pointer hover:text-destructive transition-colors" 
                                onClick={() => {
                                    form.setValue("product_categories", selectedIds.filter((id: string) => id !== c._id))
                                }}
                            />
                        </Badge>
                    ))}
                </div>
            )}

            <FormField
                control={form.control}
                name="product_categories"
                render={({ field }) => (
                    <FormItem>
                        <div className="border rounded-md p-1.5 max-h-[220px] overflow-y-auto space-y-1 bg-muted/5">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category: TCategory) => {
                                    const checked = selectedIds.includes(category._id)
                                    return (
                                        <label
                                            key={category._id}
                                            className={`flex items-center gap-3 cursor-pointer text-xs p-2 rounded-md transition-all duration-200 border ${
                                                checked 
                                                ? "bg-primary/5 border-primary/20 text-primary font-medium" 
                                                : "hover:bg-muted/50 border-transparent text-muted-foreground"
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                checked ? "bg-primary border-primary scale-110 shadow-sm" : "border-gray-300 bg-white"
                                            }`}>
                                                {checked && (
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={checked}
                                                onChange={(e) => {
                                                    const current = field.value || []
                                                    if (e.target.checked) {
                                                        field.onChange([...current, category._id])
                                                    } else {
                                                        field.onChange(current.filter((id: string) => id !== category._id))
                                                    }
                                                }}
                                            />
                                            <span className="truncate">{category.name}</span>
                                        </label>
                                    )
                                })
                            ) : (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    <p>No categories found matching "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
