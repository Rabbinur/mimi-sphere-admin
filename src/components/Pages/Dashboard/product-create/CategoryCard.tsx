"use client"

import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi"
import { Badge } from "@/components/ui/badge"
import { FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ProductFormValues } from "@/lib/validators/productSchema"
import type { TCategory } from "@/types"
import {
    ChevronDown,
    ChevronRight,
    CornerDownRight,
    Folder,
    FolderTree,
    Plus,
    Search,
    Tag,
    X,
} from "lucide-react"
import Link from "next/link"
import React, { useMemo, useState } from "react"
import type { UseFormReturn } from "react-hook-form"

interface CategoryTreeNode {
    category: TCategory;
    subCategories: TCategory[];
}

export default function CategoryCard({ form }: { form: UseFormReturn<ProductFormValues> }) {
    // Fetch all categories (tree structure with subcategories populated)
    const { data: categories = [], isLoading } = useAllCategoryQuery(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({})

    const selectedIds: string[] = form.watch("product_categories") || []

    // Lookup map for fast category name/parent lookup (including nested subcategories)
    const categoryMap = useMemo(() => {
        const map = new Map<string, TCategory>()
        if (!categories || !Array.isArray(categories)) return map

        categories.forEach((c: TCategory) => {
            map.set(c._id, c)
            if (Array.isArray(c.sub_categories)) {
                c.sub_categories.forEach((sub: TCategory) => {
                    map.set(sub._id, {
                        ...sub,
                        parent_category_id: c._id, // ensure parent_category_id is linked
                    })
                })
            }
        })
        return map
    }, [categories])

    // Build hierarchical tree: Root Categories -> SubCategories
    const treeData: CategoryTreeNode[] = useMemo(() => {
        if (!categories || !Array.isArray(categories)) return []

        const rootNodes: CategoryTreeNode[] = []
        const subMap = new Map<string, TCategory[]>()

        // 1. Collect any child subcategories from flat list
        categories.forEach((cat: TCategory) => {
            if (cat.parent_category_id) {
                const pId = typeof cat.parent_category_id === "string" 
                    ? cat.parent_category_id 
                    : (cat.parent_category_id as any)?._id || String(cat.parent_category_id)
                const existing = subMap.get(pId) || []
                existing.push(cat)
                subMap.set(pId, existing)
            }
        })

        // 2. Build root nodes
        categories.forEach((cat: TCategory) => {
            if (!cat.parent_category_id) {
                // Combine both nested sub_categories (if API returned tree) and subMap (if API returned flat)
                const nestedSubs = Array.isArray(cat.sub_categories) ? cat.sub_categories : []
                const mappedSubs = subMap.get(cat._id) || []
                
                // Merge unique subcategories by _id
                const subMapById = new Map<string, TCategory>()
                nestedSubs.forEach((s: TCategory) => subMapById.set(s._id, s))
                mappedSubs.forEach((s: TCategory) => subMapById.set(s._id, s))

                rootNodes.push({
                    category: cat,
                    subCategories: Array.from(subMapById.values()),
                })
            }
        })

        // 3. Catch any orphan subcategories whose parent isn't in root
        const rootIds = new Set(rootNodes.map(r => r.category._id))
        categories.forEach((cat: TCategory) => {
            if (cat.parent_category_id) {
                const pId = typeof cat.parent_category_id === "string" 
                    ? cat.parent_category_id 
                    : (cat.parent_category_id as any)?._id || String(cat.parent_category_id)
                if (!rootIds.has(pId)) {
                    // Treat orphan subcategory as standalone item
                    rootNodes.push({
                        category: cat,
                        subCategories: [],
                    })
                }
            }
        })

        return rootNodes
    }, [categories])

    // Toggle parent expansion
    const toggleExpand = (parentId: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setExpandedParents(prev => ({
            ...prev,
            [parentId]: !prev[parentId],
        }))
    }

    // Filter tree by search term
    const filteredTree = useMemo(() => {
        if (!searchTerm.trim()) return treeData

        const term = searchTerm.toLowerCase()
        return treeData
            .map((node) => {
                const parentMatches = node.category.name.toLowerCase().includes(term)
                const matchingSubs = node.subCategories.filter((sub) =>
                    sub.name.toLowerCase().includes(term)
                )

                if (parentMatches || matchingSubs.length > 0) {
                    return {
                        category: node.category,
                        subCategories: parentMatches ? node.subCategories : matchingSubs,
                    }
                }
                return null
            })
            .filter(Boolean) as CategoryTreeNode[]
    }, [treeData, searchTerm])

    // Helper to get full display label (Parent > Subcategory)
    const getCategoryDisplayLabel = (catId: string) => {
        const cat = categoryMap.get(catId)
        if (!cat) return "Unknown"

        if (cat.parent_category_id) {
            const parentId = typeof cat.parent_category_id === "string"
                ? cat.parent_category_id
                : (cat.parent_category_id as any)?._id || String(cat.parent_category_id)
            const parent = categoryMap.get(parentId)
            if (parent) {
                return `${parent.name} > ${cat.name}`
            }
        }
        return cat.name
    }

    const toggleCategorySelection = (categoryId: string, checked: boolean, parentId?: string | null) => {
        let updated = checked
            ? [...selectedIds, categoryId]
            : selectedIds.filter((id) => id !== categoryId)

        // If selecting a subcategory, automatically ensure parent is also included if desired
        if (checked && parentId && !updated.includes(parentId)) {
            updated = [...updated, parentId]
        }

        form.setValue("product_categories", Array.from(new Set(updated)))
    }

    return (
        <div className="rounded-xl border bg-card p-4 space-y-3.5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FolderTree size={16} className="text-primary" />
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Categories & Subcategories
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            Assign primary categories and subcategories
                        </p>
                    </div>
                </div>

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

            {/* Search and Quick Add */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search category or subcategory..."
                        className="pl-8 h-8 text-xs focus-visible:ring-primary/20 bg-muted/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Link
                    href="/dashboard/categories"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline px-2 py-1 bg-primary/10 rounded-md border border-primary/20 hover:bg-primary/20 transition-colors"
                    title="Manage / Create Categories & Subcategories"
                >
                    <Plus size={12} />
                    <span>New</span>
                </Link>
            </div>

            {/* Selected Hierarchy Badges */}
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-muted/20 rounded-lg border border-border/50 scrollbar-hide">
                    {selectedIds.map((id: string) => {
                        const isSub = Boolean(categoryMap.get(id)?.parent_category_id)
                        return (
                            <Badge
                                key={id}
                                variant="secondary"
                                className={`text-[10px] px-2 py-0.5 h-6 flex items-center gap-1 rounded-md transition-all ${
                                    isSub
                                        ? "bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/30"
                                        : "bg-primary/10 text-primary border border-primary/20"
                                }`}
                            >
                                {isSub && <CornerDownRight size={10} className="text-amber-600" />}
                                <span>{getCategoryDisplayLabel(id)}</span>
                                <X
                                    size={11}
                                    className="cursor-pointer hover:text-destructive transition-colors ml-0.5"
                                    onClick={() => {
                                        form.setValue(
                                            "product_categories",
                                            selectedIds.filter((selId: string) => selId !== id)
                                        )
                                    }}
                                />
                            </Badge>
                        )
                    })}
                </div>
            )}

            {/* Category Tree Selector */}
            <FormField
                control={form.control}
                name="product_categories"
                render={() => (
                    <FormItem>
                        <div className="border rounded-lg p-2 max-h-[260px] overflow-y-auto space-y-1.5 bg-muted/10">
                            {isLoading ? (
                                <div className="p-6 text-center text-xs text-muted-foreground animate-pulse">
                                    Loading categories & subcategories...
                                </div>
                            ) : filteredTree.length > 0 ? (
                                filteredTree.map(({ category, subCategories }) => {
                                    const isParentChecked = selectedIds.includes(category._id)
                                    const hasSubs = subCategories.length > 0
                                    const isExpanded =
                                        searchTerm.trim().length > 0 ||
                                        (expandedParents[category._id] ?? true) // default expanded for visibility

                                    // Count how many subcategories are selected under this parent
                                    const selectedSubCount = subCategories.filter(s =>
                                        selectedIds.includes(s._id)
                                    ).length

                                    return (
                                        <div
                                            key={category._id}
                                            className="rounded-lg border border-border/60 bg-background overflow-hidden shadow-2xs"
                                        >
                                            {/* Parent Category Row */}
                                            <div
                                                className={`flex items-center justify-between p-2 text-xs transition-colors ${
                                                    isParentChecked
                                                        ? "bg-primary/5 text-primary font-bold"
                                                        : "hover:bg-muted/40 text-foreground"
                                                }`}
                                            >
                                                <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={isParentChecked}
                                                        onChange={(e) =>
                                                            toggleCategorySelection(
                                                                category._id,
                                                                e.target.checked,
                                                                null
                                                            )
                                                        }
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer accent-[#002447]"
                                                    />
                                                    <Folder size={14} className="text-amber-500 flex-shrink-0" />
                                                    <span className="truncate">{category.name}</span>
                                                </label>

                                                {hasSubs && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleExpand(category._id, e)}
                                                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
                                                    >
                                                        {selectedSubCount > 0 && (
                                                            <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full">
                                                                {selectedSubCount} sub
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {subCategories.length}
                                                        </span>
                                                        {isExpanded ? (
                                                            <ChevronDown size={14} />
                                                        ) : (
                                                            <ChevronRight size={14} />
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Subcategories (Indented Tree) */}
                                            {hasSubs && isExpanded && (
                                                <div className="pl-6 pr-2 py-1.5 bg-muted/15 border-t border-border/40 space-y-1">
                                                    {subCategories.map((sub) => {
                                                        const isSubChecked = selectedIds.includes(sub._id)
                                                        return (
                                                            <label
                                                                key={sub._id}
                                                                className={`flex items-center gap-2 text-xs py-1 px-2 rounded-md cursor-pointer transition-all ${
                                                                    isSubChecked
                                                                        ? "bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                                                                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSubChecked}
                                                                    onChange={(e) =>
                                                                        toggleCategorySelection(
                                                                            sub._id,
                                                                            e.target.checked,
                                                                            category._id
                                                                        )
                                                                    }
                                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500/20 cursor-pointer accent-amber-600"
                                                                />
                                                                <CornerDownRight
                                                                    size={12}
                                                                    className="text-amber-500/70 flex-shrink-0"
                                                                />
                                                                <span className="truncate">{sub.name}</span>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
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

