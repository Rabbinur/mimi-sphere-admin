"use client"

import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi";
import { useAdminProductsQuery, useDeleteProductMutation, useImportCjProductsMutation, useUpdateProductMutation } from "@/components/Redux/RTK/productApi";
import { ChevronLeft, ChevronRight, Clock, Edit3, Filter, Flame, Loader2, Search, Star, Trash2, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TProduct {
    _id: string;
    product_title: string;
    product_description: string;
    thumbnail?: string;
    product_price: number;
    product_categories?: Array<{ _id: string; name: string }> | string[];
    quantity: number;
    in_stock: boolean;
    product_options?: Array<{
        option_name: string;
        option_values: string[];
    }>;
    product_variants?: Array<any>;
    product_status?: 'draft' | 'active';
    is_featured?: boolean;
    is_trendy?: boolean;
    is_limited_time_offer?: boolean;
    is_pre_order?: boolean;
    pre_order_message?: string;
}

interface ProductsResponse {
    pagination: {
        currentPage: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
    data: TProduct[];
}

interface TCategory {
    _id: string;
    name: string;
    parent_category_id: string | null;
}

const PRODUCTS_PER_PAGE = 10;

const AdminProductsPage = () => {
    const { data: categoriesData, isLoading: categoriesLoading } = useAllCategoryQuery(undefined) as {
        data: TCategory[] | undefined;
        isLoading: boolean;
    };



    const mainCategories = categoriesData ? categoriesData.filter(cat => !cat.parent_category_id) : [];

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [tempSearchTerm, setTempSearchTerm] = useState("");

    // Modal state
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importKeyword, setImportKeyword] = useState("hoodie");
    const [importCategoryId, setImportCategoryId] = useState("");
    const [importType, setImportType] = useState<"multi" | "single">("multi");

    const queryArgs = {
        searchTerm: searchTerm,
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        category: selectedCategory,
    };

    const {
        data,
        isLoading,
        error,
        isFetching,
        refetch
    } = useAdminProductsQuery(queryArgs) as {
        data: ProductsResponse | undefined;
        isLoading: boolean;
        error: any;
        isFetching: boolean;
        refetch: () => void;
    };

    const [deleteProduct, { isLoading: isDeleting, error: deleteError }] = useDeleteProductMutation();
    const [importCjProducts, { isLoading: isImporting }] = useImportCjProductsMutation();
    const [updateProduct] = useUpdateProductMutation();

    // ⚡ Toggle Handlers
    const handleToggleStatus = async (product: TProduct) => {
        const newStatus = product.product_status === 'active' ? 'draft' : 'active';
        try {
            await updateProduct({ id: product._id, data: { product_status: newStatus } }).unwrap();
            toast.success(`Product marked as ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleToggleFeatured = async (product: TProduct) => {
        try {
            await updateProduct({ id: product._id, data: { is_featured: !product.is_featured } }).unwrap();
            toast.success(product.is_featured ? "Removed from Featured" : "Marked as Featured");
        } catch (err) {
            toast.error("Failed to update Featured status");
        }
    };

    const handleToggleTrendy = async (product: TProduct) => {
        try {
            await updateProduct({ id: product._id, data: { is_trendy: !product.is_trendy } }).unwrap();
            toast.success(product.is_trendy ? "Removed from Trendy" : "Marked as Trendy");
        } catch (err) {
            toast.error("Failed to update Trendy status");
        }
    };

    const handleToggleLimitedOffer = async (product: TProduct) => {
        try {
            await updateProduct({ id: product._id, data: { is_limited_time_offer: !product.is_limited_time_offer } }).unwrap();
            toast.success(product.is_limited_time_offer ? "Removed from Limited Offers" : "Marked as Limited Offer");
        } catch (err) {
            toast.error("Failed to update Limited Offer status");
        }
    };

    const handleTogglePreOrder = async (product: TProduct) => {
        const nextPreOrderState = !product.is_pre_order;
        const updateData: any = { is_pre_order: nextPreOrderState };

        // If turning ON and no message is set, use default
        if (nextPreOrderState && !product.pre_order_message) {
            updateData.pre_order_message = "Shipping within (10 - 20) days";
        }

        try {
            await updateProduct({ id: product._id, data: updateData }).unwrap();
            toast.success(nextPreOrderState ? "Marked as Pre-order" : "Removed from Pre-order");
        } catch (err) {
            toast.error("Failed to update Pre-order status");
        }
    };
    const products = data?.data || [];
    const totalProducts = data?.pagination?.totalItems || 0;
    const totalPages = data?.pagination?.totalPages || 1;

    useEffect(() => {
        // If current page is beyond totalPages after deletion, move back a page
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalPages]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        setSearchTerm(tempSearchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setTempSearchTerm("");
        setCurrentPage(1);
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleDelete = async (productId: string) => {
        const ok = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
        if (!ok) return;

        try {
            await deleteProduct(productId).unwrap();
            // refetch list after delete
            refetch();
            // if you prefer optimistic update you could manipulate cache instead
            // but refetch is simpler and reliable
        } catch (err: any) {
            console.error("Delete failed:", err);
            alert(err?.data?.message || err?.message || "Failed to delete product");
        }
    };

    const handleExecuteImport = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await importCjProducts({
                keyword: importKeyword,
                categoryId: importCategoryId || undefined,
                importType
            }).unwrap();

            toast.success(result.message || "Imported successfully!");
            setIsImportModalOpen(false);
            refetch();
        } catch (err: any) {
            console.error("Import failed:", err);
            const errMsg = err?.data?.message || err?.message || "Failed to import products.";
            toast.error(`${errMsg} - Check your CJ_API_KEY.`);
        }
    };

    if (isLoading || categoriesLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-lg text-gray-600">Loading Products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600 border border-red-200 bg-red-50 rounded-lg m-8">
                <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
                <p>An error occurred: {error?.status || "Unknown Error"}. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">

            <header className="mb-8 border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Product Listings </h1>
                    <p className="text-sm text-gray-500 mt-1">Admin view — full product details</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/dashboard/products/create" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:opacity-95 whitespace-nowrap">
                        Add Product
                    </Link>


                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <form onSubmit={handleSearchSubmit} className="relative flex-grow flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={tempSearchTerm}
                            onChange={(e) => setTempSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        {(tempSearchTerm || searchTerm) && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition shadow-sm whitespace-nowrap"
                    >
                        Search
                    </button>
                </form>

                <div className="relative md:w-1/4">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-primary focus:border-primary bg-white"
                    >
                        <option value="">All Categories</option>
                        {mainCategories.map(cat => (
                            // use cat._id as value so backend filtering works correctly
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discovery</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isFetching && (
                            <tr>
                                <td colSpan={7} className="text-center py-2 text-primary bg-primary/5 text-xs font-medium">
                                    <Loader2 className="h-4 w-4 inline animate-spin mr-2" />
                                    Updating data...
                                </td>
                            </tr>
                        )}
                        {!isLoading && products.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500">
                                    No products found matching your criteria.
                                </td>
                            </tr>
                        )}
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                                                {product.thumbnail ? (
                                                    <img src={product.thumbnail} alt={product.product_title} className="h-10 w-10 rounded-lg object-cover" />
                                                ) : (
                                                    "IMG"
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]">{product.product_title}</div>
                                            {product.product_options && product.product_options.length > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    {product.product_options.length} {product.product_options.length > 1 ? 'options' : 'option'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(product.product_categories || []).map((c: any) => typeof c === 'string' ? c : c.name).join(', ') || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ৳{product.product_price.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}>
                                        {product.quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <div className="flex justify-center items-center gap-3">
                                        <button
                                            onClick={() => handleToggleFeatured(product)}
                                            title={product.is_featured ? "Featured" : "Mark as Featured"}
                                            className={`p-1.5 rounded-full transition-colors ${product.is_featured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:text-yellow-600'}`}
                                        >
                                            <Star className={`h-4 w-4 ${product.is_featured ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleTrendy(product)}
                                            title={product.is_trendy ? "Trendy" : "Mark as Trendy"}
                                            className={`p-1.5 rounded-full transition-colors ${product.is_trendy ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 hover:text-orange-600'}`}
                                        >
                                            <Flame className={`h-4 w-4 ${product.is_trendy ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleLimitedOffer(product)}
                                            title={product.is_limited_time_offer ? "Limited Offer" : "Mark as Limited Offer"}
                                            className={`p-1.5 rounded-full transition-colors ${product.is_limited_time_offer ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 hover:text-purple-600'}`}
                                        >
                                            <Zap className={`h-4 w-4 ${product.is_limited_time_offer ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleTogglePreOrder(product)}
                                            title={product.is_pre_order ? "Pre-order" : "Mark as Pre-order"}
                                            className={`p-1.5 rounded-full transition-colors ${product.is_pre_order ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:text-blue-600'}`}
                                        >
                                            <Clock className={`h-4 w-4 ${product.is_pre_order ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => handleToggleStatus(product)}
                                        className={`capitalize px-3 py-1 rounded-full text-xs font-bold transition-all border ${product.product_status === 'active'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                            }`}
                                    >
                                        {product.product_status || 'active'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-3">
                                    <Link
                                        href={`/dashboard/products/edit/${product._id}`}
                                        className="inline-flex items-center px-3 py-1 rounded-md text-sm border border-gray-200 hover:bg-gray-50"
                                    >
                                        <Edit3 className="h-4 w-4 mr-2" /> Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        disabled={isDeleting}
                                        className="inline-flex items-center px-3 py-1 rounded-md text-sm border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 mr-2" />
                                        )}
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pb-10">
                    <p className="text-sm text-gray-600">
                        Showing <strong>{((currentPage - 1) * PRODUCTS_PER_PAGE) + 1}</strong> to <strong>{Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)}</strong> of <strong>{totalProducts}</strong> products
                    </p>
                    <nav className="flex items-center space-x-1">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1 || isFetching}
                            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <div className="flex items-center space-x-1">
                            {(() => {
                                const pages: (number | "...")[] = [];
                                const showMax = 5;

                                if (totalPages <= 7) {
                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                } else {
                                    pages.push(1);
                                    if (currentPage > 3) pages.push("...");

                                    const start = Math.max(2, currentPage - 1);
                                    const end = Math.min(totalPages - 1, currentPage + 1);

                                    // Adjust if we are at the beginning or end
                                    let adjustedStart = start;
                                    let adjustedEnd = end;
                                    if (currentPage <= 3) adjustedEnd = 4;
                                    if (currentPage >= totalPages - 2) adjustedStart = totalPages - 3;

                                    for (let i = adjustedStart; i <= adjustedEnd; i++) {
                                        if (!pages.includes(i)) pages.push(i);
                                    }

                                    if (currentPage < totalPages - 2) pages.push("...");
                                    if (!pages.includes(totalPages)) pages.push(totalPages);
                                }

                                return pages.map((page, i) => (
                                    page === "..." ? (
                                        <span key={`dots-${i}`} className="px-2 text-gray-500">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition ${currentPage === page
                                                ? "bg-primary text-white border-primary"
                                                : "border-gray-300 text-gray-600 hover:bg-gray-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ));
                            })()}
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || isFetching}
                            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            )}

            {/* show delete error if any */}
            {deleteError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                    Error deleting product: {(deleteError as any)?.data?.message || (deleteError as any)?.message}
                </div>
            )}

            {/* CJ Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Import from CJ Dropshipping</h2>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleExecuteImport} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Keyword or Product ID / SKU</label>
                                <input
                                    type="text"
                                    required
                                    value={importKeyword}
                                    onChange={(e) => setImportKeyword(e.target.value)}
                                    placeholder="e.g., hoodie, watch, or Product ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Option</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="multi"
                                            checked={importType === 'multi'}
                                            onChange={() => setImportType('multi')}
                                            className="mr-2 text-primary focus:ring-primary h-4 w-4"
                                        />
                                        Multi Products
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="single"
                                            checked={importType === 'single'}
                                            onChange={() => setImportType('single')}
                                            className="mr-2 text-primary focus:ring-primary h-4 w-4"
                                        />
                                        Single/Actual Match
                                    </label>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Category (Optional)</label>
                                <select
                                    value={importCategoryId}
                                    onChange={(e) => setImportCategoryId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                                >
                                    <option value="">Auto-Detect Category</option>
                                    {categoriesData?.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name} {cat.parent_category_id ? " (Subcategory)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isImporting}
                                    className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center"
                                >
                                    {isImporting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Importing...
                                        </>
                                    ) : (
                                        "Import"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductsPage;
