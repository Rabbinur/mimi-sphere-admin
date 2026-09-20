"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useEffect, useMemo, useState } from "react";

import {
    useAllCategoryQuery,
    useDeleteCategoryMutation,
    useUpdateCategoryMutation,
} from "@/components/Redux/RTK/categoryApi";

import { FolderTree, Tag } from "lucide-react";
import { toast } from "sonner";
import CreateEditCategoryDialog from "./_components/CreateEditCategoryDialog";
import ReorderCategoriesDialog from "./_components/ReorderCategoriesDialog";

export interface TCategory {
    _id: string;
    name: string;
    description?: string;
    parent_category_id: null | string;
    imageUrl?: string;
    bannerImage?: string;
    isActive: boolean;
    showInNavbar?: boolean;
    order?: number;
    createdAt: Date | string;
    sub_categories?: TCategory[];
}

export default function CategoryManagementPage() {
    const [mounted, setMounted] = useState(false);
    const { data: categories, isLoading, isError, refetch } = useAllCategoryQuery(true);
    const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [togglingNavbarId, setTogglingNavbarId] = useState<string | null>(null);

    const [editingCategory, setEditingCategory] = useState<TCategory | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Flatten tree into an ordered list where child subcategories immediately follow their parent
    const { displayList, totalMain, totalSub } = useMemo(() => {
        if (!categories || !Array.isArray(categories)) {
            return { displayList: [], totalMain: 0, totalSub: 0 };
        }

        const getCategoryOrder = (c: TCategory) =>
            typeof c.order === "number" && !isNaN(c.order) && c.order > 0
                ? c.order
                : Number.MAX_SAFE_INTEGER;

        const sortList = (list: TCategory[]) => {
            return [...list].sort((a, b) => {
                const diff = getCategoryOrder(a) - getCategoryOrder(b);
                if (diff !== 0) return diff;
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeA - timeB;
            });
        };

        const sortedCategories = sortList(categories);

        const list: (TCategory & { isSub: boolean; parentName?: string; subCount?: number })[] = [];
        let mainCount = 0;
        let subCount = 0;

        sortedCategories.forEach((cat: TCategory) => {
            const hasSubs = Array.isArray(cat.sub_categories) && cat.sub_categories.length > 0;
            if (!cat.parent_category_id) {
                mainCount++;
            } else {
                subCount++;
            }

            list.push({
                ...cat,
                isSub: Boolean(cat.parent_category_id),
                subCount: hasSubs ? cat.sub_categories!.length : 0,
            });

            // If it has nested subcategories, push them right below the parent
            if (hasSubs) {
                const sortedSubs = sortList(cat.sub_categories!);
                sortedSubs.forEach((sub: TCategory) => {
                    subCount++;
                    list.push({
                        ...sub,
                        isSub: true,
                        parentName: cat.name,
                    });
                });
            }
        });

        return { displayList: list, totalMain: mainCount, totalSub: subCount };
    }, [categories]);

    if (!mounted) return null;

    const openEdit = (cat: TCategory) => {
        setEditingCategory(cat);
        setEditOpen(true);
    };

    const handleToggleActive = async (cat: TCategory) => {
        const nextStatus = cat.isActive === false ? true : false;
        setTogglingId(cat._id);
        try {
            const res = await updateCategory({
                id: cat._id,
                data: { isActive: nextStatus },
            }).unwrap();

            if (res.statusCode === 200 || res.success) {
                toast.success(`Category "${cat.name}" is now ${nextStatus ? "Active (Visible)" : "Hidden"}`);
                refetch();
            } else {
                toast.error(res.message || "Failed to update category status");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update visibility");
        } finally {
            setTogglingId(null);
        }
    };

    const handleToggleNavbar = async (cat: TCategory) => {
        const nextStatus = cat.showInNavbar === false ? true : false;
        setTogglingNavbarId(cat._id);
        try {
            const res = await updateCategory({
                id: cat._id,
                data: { showInNavbar: nextStatus },
            }).unwrap();

            if (res.statusCode === 200 || res.success) {
                toast.success(`Category "${cat.name}" is now ${nextStatus ? "Visible in Navbar" : "Hidden from Navbar"}`);
                refetch();
            } else {
                toast.error(res.message || "Failed to update navbar status");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update navbar visibility");
        } finally {
            setTogglingNavbarId(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

        try {
            const res = await deleteCategory(id).unwrap();

            if (res.statusCode === 200) {
                toast.success(res.message || "Category deleted successfully");
                refetch();
            } else {
                toast.error(res.message || "Something went wrong");
            }
        } catch (error: any) {
            toast.error(
                error?.data?.message ||
                error?.data?.error ||
                "Failed to delete category"
            );
        }
    };

    // simple formatter
    const formatDate = (d: any) => {
        if (!d) return "-";
        const date = new Date(d);
        return !isNaN(date.getTime()) ? date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }) : "-";
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
                        <FolderTree className="w-7 h-7 text-amber-500" />
                        Category Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Organize main categories and subcategories, banners, display orders, and storefront visibility.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <ReorderCategoriesDialog
                        categories={categories || []}
                        onSuccess={() => refetch()}
                    />
                    <CreateEditCategoryDialog
                        mode="create"
                        triggerLabel="+ Create Category"
                        onSuccess={() => refetch()}
                    />
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                            All Categories & Subcategories
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                Main Categories: <strong>{totalMain}</strong>
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                Subcategories: <strong>{totalSub}</strong>
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading && <div className="p-8 text-center text-slate-500">Loading categories...</div>}
                    {isError && <div className="p-8 text-center text-red-500 font-medium">Failed to load categories.</div>}

                    {!isLoading && !isError && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                        <TableHead className="w-[70px] text-center font-bold">Order</TableHead>
                                        <TableHead className="w-[280px]">Category Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Thumbnail</TableHead>
                                        <TableHead>Banner</TableHead>
                                        <TableHead className="text-center">Visibility</TableHead>
                                        <TableHead className="text-center">Navbar</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {displayList?.length ? (
                                        displayList.map((cat) => {
                                            const isSubcategory = cat.isSub;

                                            return (
                                                <TableRow 
                                                    key={cat._id} 
                                                    className={isSubcategory ? "bg-amber-50/30 hover:bg-amber-50/60" : "hover:bg-slate-50/60"}
                                                >
                                                    <TableCell className="text-center">
                                                        <span className="inline-flex items-center justify-center font-bold text-xs text-slate-700 bg-slate-100 border border-slate-200/80 rounded-md px-2 py-0.5">
                                                            {typeof cat.order === "number" && !isNaN(cat.order) && cat.order > 0 ? cat.order : "-"}
                                                        </span>
                                                    </TableCell>

                                                    <TableCell className="font-medium">
                                                        {isSubcategory ? (
                                                            <div className="flex items-center gap-2 pl-6">
                                                                <span className="text-amber-500 font-bold text-base select-none">↳</span>
                                                                <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                                <span className="text-slate-800 font-semibold text-sm">{cat.name}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <FolderTree className="w-4 h-4 text-slate-700 shrink-0" />
                                                                <span className="text-slate-900 font-bold text-sm">{cat.name}</span>
                                                                {cat.subCount && cat.subCount > 0 ? (
                                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600 font-medium">
                                                                        {cat.subCount} sub
                                                                    </Badge>
                                                                ) : null}
                                                            </div>
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {isSubcategory ? (
                                                            <Badge variant="outline" className="text-[11px] py-0.5 px-2 bg-amber-50 text-amber-800 border-amber-300 font-semibold">
                                                                Sub of {cat.parentName || "Parent"}
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="text-[11px] py-0.5 px-2 bg-[#002447] text-white font-semibold">
                                                                Main Category
                                                            </Badge>
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {cat.imageUrl ? (
                                                            <img
                                                                src={cat.imageUrl}
                                                                alt={cat.name}
                                                                className="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-2xs"
                                                            />
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">No Image</span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {cat.bannerImage ? (
                                                            <div className="w-16 h-9 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                                                                <img
                                                                    src={cat.bannerImage}
                                                                    alt={`${cat.name} Banner`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="inline-block text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                                                                No Banner
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <div className="inline-flex items-center justify-center gap-2">
                                                            <Switch
                                                                checked={cat.isActive !== false}
                                                                disabled={togglingId === cat._id}
                                                                onCheckedChange={() => handleToggleActive(cat)}
                                                            />
                                                            <span className={`text-[11px] font-semibold w-12 text-left ${cat.isActive !== false ? "text-emerald-600" : "text-slate-400"}`}>
                                                                {cat.isActive !== false ? "Active" : "Hidden"}
                                                            </span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <div className="inline-flex items-center justify-center gap-2">
                                                            <Switch
                                                                checked={cat.showInNavbar !== false}
                                                                disabled={togglingNavbarId === cat._id}
                                                                onCheckedChange={() => handleToggleNavbar(cat)}
                                                            />
                                                            <span className={`text-[11px] font-semibold w-12 text-left ${cat.showInNavbar !== false ? "text-indigo-600" : "text-slate-400"}`}>
                                                                {cat.showInNavbar !== false ? "Visible" : "Hidden"}
                                                            </span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-xs text-slate-500">
                                                        {formatDate(cat.createdAt)}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end items-center gap-1.5">
                                                            {!isSubcategory && (
                                                                <CreateEditCategoryDialog
                                                                    mode="create"
                                                                    triggerLabel="+ Sub"
                                                                    triggerVariant="secondary"
                                                                    triggerSize="sm"
                                                                    defaultParentId={cat._id}
                                                                    onSuccess={() => refetch()}
                                                                />
                                                            )}

                                                            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs font-semibold" onClick={() => openEdit(cat)}>
                                                                Edit
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="h-8 px-2.5 text-xs font-semibold"
                                                                disabled={deleting}
                                                                onClick={() => handleDelete(cat._id, cat.name)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                                                No categories found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* EDIT DIALOG */}
            <CreateEditCategoryDialog
                mode="edit"
                open={editOpen}
                onOpenChange={(v) => {
                    setEditOpen(v);
                    if (!v) setEditingCategory(null);
                }}
                categoryToEdit={editingCategory}
                onSuccess={() => refetch()}
            />
        </div>
    );
}

