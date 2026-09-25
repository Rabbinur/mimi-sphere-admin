"use client";

import { useAllCollectionsQuery, useDeleteCollectionMutation, useUpdateCollectionMutation } from "@/components/Redux/RTK/collectionApi";
import { useGetCmsQuery, useUpdateCmsMutation } from "@/components/Redux/RTK/cmsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FilePagination } from "@/components/ui/file-paggination";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BentoGridManager from "./_components/BentoGridManager";

const COLLECTIONS_PER_PAGE = 10;

export default function CollectionsManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") === "bento" ? "bento" : "all";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [mounted, setMounted] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: response, isLoading, isError, refetch } = useAllCollectionsQuery({
        page: currentPage,
        limit: COLLECTIONS_PER_PAGE,
    });

    const { data: cmsResponse } = useGetCmsQuery();
    const [updateCms, { isLoading: isUpdatingCms }] = useUpdateCmsMutation();

    const isFeaturedCollectionsEnabled = cmsResponse?.data?.featuredCollections?.isEnabled ?? true;

    const [deleteCollection, { isLoading: deleting }] = useDeleteCollectionMutation();
    const [updateCollection] = useUpdateCollectionMutation();
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const collections = response?.data?.collections || [];
    const totalCollections = response?.data?.total || 0;
    const totalPages = Math.ceil(totalCollections / COLLECTIONS_PER_PAGE) || 1;

    const handleToggleFeaturedCollections = async (checked: boolean) => {
        if (!cmsResponse?.data) return;
        try {
            await updateCms({
                ...cmsResponse.data,
                featuredCollections: {
                    ...(cmsResponse.data.featuredCollections || {
                        title: "Featured Collections",
                        subtitle: "Explore our handpicked collections",
                    }),
                    isEnabled: checked,
                },
            }).unwrap();
            toast.success(
                checked
                    ? "Featured Collections section is now VISIBLE on homepage!"
                    : "Featured Collections section is now HIDDEN from homepage!"
            );
        } catch {
            toast.error("Failed to update Featured Collections visibility");
        }
    };

    const openEdit = (collection: any) => {
        router.push(`/dashboard/collections/edit/${collection._id}`);
    };

    const handleToggleActive = async (col: any) => {
        setTogglingId(col._id);
        try {
            const res = await updateCollection({ id: col._id, data: { isActive: !col.isActive } }).unwrap();
            if (res.success || res.statusCode === 200) {
                toast.success(`Collection "${col.name}" ${!col.isActive ? 'enabled' : 'disabled'}`);
                refetch();
            } else {
                toast.error("Failed to update collection status");
            }
        } catch {
            toast.error("Failed to update collection status");
        } finally {
            setTogglingId(null);
        }
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
        <div className="p-4 md:p-8 bg-white min-h-screen space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Collections Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage custom collections and the homepage Best Collections (Bento Grid) section.
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <TabsList className="grid w-full sm:w-[460px] grid-cols-2">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        All Collections
                    </TabsTrigger>
                    <TabsTrigger value="bento" className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        Best Collections (Bento)
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: All Collections */}
                <TabsContent value="all" className="space-y-4">
                    {/* Action Row: Toggle Switch on Left of + Create Collection */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-xs text-muted-foreground">
                            Manage individual collections and control whether the Featured Collections section appears on the homepage.
                        </p>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                            {/* Tab-wise Section Visibility Toggle */}
                            <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-sm">
                                <Label htmlFor="featured-tab-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                                    Section:
                                </Label>
                                <Switch
                                    id="featured-tab-toggle"
                                    checked={isFeaturedCollectionsEnabled}
                                    onCheckedChange={handleToggleFeaturedCollections}
                                    disabled={isUpdatingCms}
                                />
                                <span className={`text-xs font-bold ${isFeaturedCollectionsEnabled ? 'text-green-600' : 'text-red-500'}`}>
                                    {isFeaturedCollectionsEnabled ? "Visible" : "Hidden"}
                                </span>
                            </div>

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
                                                            <button
                                                                onClick={() => handleToggleActive(col)}
                                                                disabled={togglingId === col._id}
                                                                title={col.isActive ? "Click to disable" : "Click to enable"}
                                                                className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {togglingId === col._id ? (
                                                                    <Badge variant="outline" className="animate-pulse">Updating...</Badge>
                                                                ) : col.isActive ? (
                                                                    <Badge className="bg-green-500 hover:bg-red-500 transition-colors">● Active</Badge>
                                                                ) : (
                                                                    <Badge variant="destructive" className="hover:bg-green-500 transition-colors">● Inactive</Badge>
                                                                )}
                                                            </button>
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
                </TabsContent>

                {/* Tab 2: Best Collections (Bento) */}
                <TabsContent value="bento">
                    <BentoGridManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
