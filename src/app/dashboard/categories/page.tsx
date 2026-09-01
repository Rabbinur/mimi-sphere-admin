"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";

import {
    useAllCategoryQuery,
    useDeleteCategoryMutation,
} from "@/components/Redux/RTK/categoryApi";

import { toast } from "sonner";
import CreateEditCategoryDialog from "./_components/CreateEditCategoryDialog";
import ReorderCategoriesDialog from "./_components/ReorderCategoriesDialog";

export interface TCategory {
    _id: string;
    name: string;
    description: string;
    parent_category_id: null | string;
    imageUrl?: string;
    isActive: boolean;
    createdAt: Date | string;

}

export default function CategoryManagementPage() {
    const [mounted, setMounted] = useState(false);
    const { data: categories, isLoading, isError, refetch } = useAllCategoryQuery(true);
    const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

    const [editingCategory, setEditingCategory] = useState<TCategory | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const openEdit = (cat: TCategory) => {
        setEditingCategory(cat);
        setEditOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category?")) return;

        try {
            const res = await deleteCategory(id).unwrap();

            // ✅ Check backend statusCode
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
        return !isNaN(date.getTime()) ? date.toLocaleString() : "-";
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-3xl font-semibold">Categories</h1>

                <div className="flex gap-2">
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

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">All Categories</CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading && <div className="p-4 text-center">Loading...</div>}
                    {isError && <div className="p-4 text-center text-red-500">Failed to load categories.</div>}

                    {!isLoading && !isError && (
                        <>
                            <div className="px-4 py-3 text-sm text-gray-600 border-b">
                                Total Categories: <strong>{categories?.length ?? 0}</strong>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/40">
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>

                                            <TableHead>Image</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>

                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {categories?.length ? (
                                            categories.map((cat: TCategory) => {
                                                const parent = categories.find(
                                                    (p: TCategory) => p._id === cat.parent_category_id
                                                );

                                                return (
                                                    <TableRow key={cat._id}>
                                                        <TableCell className="font-medium">
                                                            {cat.name}
                                                        </TableCell>

                                                        <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                                                            {cat.description || "-"}
                                                        </TableCell>


                                                        <TableCell>
                                                            {cat.imageUrl ? (
                                                                <img
                                                                    src={cat.imageUrl}
                                                                    className="w-10 h-10 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">No Image</span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            {cat.isActive ? (
                                                                <Badge className="bg-green-500">Active</Badge>
                                                            ) : (
                                                                <Badge variant="destructive">Inactive</Badge>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="text-xs text-gray-500">
                                                            {formatDate(cat.createdAt)}
                                                        </TableCell>



                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>
                                                                    Edit
                                                                </Button>

                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    disabled={deleting}
                                                                    onClick={() => handleDelete(cat._id)}
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
                                                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                                                    No categories found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
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
