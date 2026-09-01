"use client";

import { useAllCollectionsQuery, useDeleteCollectionMutation } from "@/components/Redux/RTK/collectionApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FilePagination } from "@/components/ui/file-paggination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const COLLECTIONS_PER_PAGE = 10;

export default function CollectionsManagementPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: response, isLoading, isError, refetch } = useAllCollectionsQuery({
        page: currentPage,
        limit: COLLECTIONS_PER_PAGE,
    });

    const [deleteCollection, { isLoading: deleting }] = useDeleteCollectionMutation();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const collections = response?.data?.collections || [];
    const totalCollections = response?.data?.total || 0;
    const totalPages = Math.ceil(totalCollections / COLLECTIONS_PER_PAGE) || 1;

    const openEdit = (collection: any) => {
        router.push(`/dashboard/collections/edit/${collection._id}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this collection?")) return;

        try {
            const res = await deleteCollection(id).unwrap();

            if (res.success || res.statusCode === 200) {
                toast.success(res.message || "Collection deleted successfully");
                refetch();
            } else {
                toast.error(res.message || "Failed to delete collection");
            }
        } catch (error: any) {
            toast.error(
                error?.data?.message ||
                "An error occurred while deleting the collection"
            );
        }
    };

    const formatDate = (d: any) => {
        if (!d) return "-";
        const date = new Date(d);
        return !isNaN(date.getTime()) ? date.toLocaleDateString() : "-";
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-3xl font-semibold">Collections</h1>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/dashboard/collections/create">+ Create Collection</Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">All Collections</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading && <div className="p-4 text-center">Loading...</div>}
                    {isError && <div className="p-4 text-center text-red-500">Failed to load collections.</div>}

                    {!isLoading && !isError && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead>Banner</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Display Order</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {collections && collections.length > 0 ? (
                                        collections.map((col: any) => (
                                            <TableRow key={col._id}>
                                                <TableCell>
                                                    {col.bannerImage ? (
                                                        <img src={col.bannerImage} alt={col.name} className="w-14 h-8 object-cover rounded" />
                                                    ) : (
                                                        <div className="w-14 h-8 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">No Banner</div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{col.name}</TableCell>
                                                <TableCell className="text-sm text-gray-500">{col.slug}</TableCell>
                                                <TableCell>
                                                    <Badge variant={col.productSelectionMode === "automatic" ? "secondary" : "outline"}>
                                                        {col.productSelectionMode === "automatic" ? "Automatic" : "Manual"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {col.isActive ? (
                                                        <Badge className="bg-green-500">Active</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Inactive</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{col.displayOrder}</TableCell>
                                                <TableCell className="text-xs text-gray-500">{formatDate(col.createdAt)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={`http://localhost:3000/collections/${col.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => openEdit(col)}>Edit</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(col._id)}>Delete</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-6 text-gray-500">No collections found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pb-10">
                    <p className="text-sm text-gray-600">
                        Showing <strong>{((currentPage - 1) * COLLECTIONS_PER_PAGE) + 1}</strong> to <strong>{Math.min(currentPage * COLLECTIONS_PER_PAGE, totalCollections)}</strong> of <strong>{totalCollections}</strong> collections
                    </p>
                    <FilePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    );
}
