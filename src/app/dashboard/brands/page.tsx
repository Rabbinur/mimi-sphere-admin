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

import { useAllBrandsQuery, useDeleteBrandMutation, useSyncBrandsMutation } from "@/components/Redux/RTK/brandApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FilePagination } from "@/components/ui/file-paggination";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BRANDS_PER_PAGE = 10;

export interface TBrand {
    _id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    isActive: boolean;
    order: number;
    displayOrder?: number;
    isFeatured?: boolean;
    heroTitle?: string;
    heroDescription?: string;
    coverImage?: string;
    content?: string;
    FAQs?: any[];
    featuredProducts?: any[];
    featuredBlogs?: any[];
    createdAt: Date | string;
}

export default function BrandManagementPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: response, isLoading, isError, refetch } = useAllBrandsQuery({
        page: currentPage,
        limit: BRANDS_PER_PAGE
    });

    const [deleteBrand, { isLoading: deleting }] = useDeleteBrandMutation();
    const [syncBrands, { isLoading: syncing }] = useSyncBrandsMutation();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const brands = (response as any)?.data?.brands || [];
    const totalBrands = (response as any)?.data?.total || 0;
    const totalPages = Math.ceil(totalBrands / BRANDS_PER_PAGE) || 1;

    const openEdit = (brand: TBrand) => {
        router.push(`/dashboard/brands/edit/${brand._id}`);
    };

    const handleSync = async () => {
        try {
            const res = await syncBrands(undefined).unwrap();
            if (res.success) {
                toast.success(res.message || "Brands synced successfully");
                refetch();
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Sync failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this brand?")) return;

        try {
            const res = await deleteBrand(id).unwrap();

            if (res.success) {
                toast.success(res.message || "Brand deleted successfully");
                refetch();
            } else {
                toast.error(res.message || "Failed to delete brand");
            }
        } catch (error: any) {
            toast.error(
                error?.data?.message ||
                "An error occurred while deleting the brand"
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
                <h1 className="text-3xl font-semibold">Brands</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={syncing}
                        className="gap-2"
                    >
                        <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
                        {syncing ? "Syncing..." : "Sync from Products"}
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/brands/create">+ Create Brand</Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">All Brands</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading && <div className="p-4 text-center">Loading...</div>}
                    {isError && <div className="p-4 text-center text-red-500">Failed to load brands.</div>}

                    {!isLoading && !isError && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead>Logo</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {brands && brands.length > 0 ? (
                                        brands.map((brand: TBrand) => (
                                            <TableRow key={brand._id}>
                                                <TableCell>
                                                    {brand.logoUrl ? (
                                                        <img src={brand.logoUrl} alt={brand.name} className="w-10 h-10 object-contain rounded" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">No Logo</div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{brand.name}</TableCell>
                                                <TableCell className="text-sm text-gray-500">{brand.slug}</TableCell>
                                                <TableCell>
                                                    {brand.isActive ? (
                                                        <Badge className="bg-green-500">Active</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Inactive</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{brand.order}</TableCell>
                                                <TableCell className="text-xs text-gray-500">{formatDate(brand.createdAt)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={`https://shoppingcart.bd/brands/${brand.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => openEdit(brand)}>Edit</Button>
                                                        <Button size="sm" variant="destructive" disabled={deleting} onClick={() => handleDelete(brand._id)}>Delete</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-6 text-gray-500">No brands found.</TableCell>
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
                        Showing <strong>{((currentPage - 1) * BRANDS_PER_PAGE) + 1}</strong> to <strong>{Math.min(currentPage * BRANDS_PER_PAGE, totalBrands)}</strong> of <strong>{totalBrands}</strong> brands
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

