"use client";

import Loader from "@/components/custom/Loader";
import { useAppSelector } from "@/components/Redux/hooks";
import { useAllOrdersQuery, useDeleteOrderMutation } from "@/components/Redux/RTK/orderApi";
import { useCurrentToken } from "@/components/Redux/Slice/authSlice";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { currency, formatDate, TOrder } from "@/lib/orders/orders";
import {
    Download,
    Eye,
    FileText,
    Package,
    Search,
    ShieldAlert,
    ShoppingCart,
    Tag,
    User
} from "lucide-react"; // Added icons for card details
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import FraudCheckerModal from "./_components/FraudCheckerModal";
import OrderDetailsModal from "./_components/OrderDetailsModal";

const statusBadge = (status: string) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Added border
        case "processing":
            return "bg-blue-100 text-blue-800 border-blue-200"; // Added border
        case "shipped":
            return "bg-indigo-100 text-indigo-800 border-indigo-200"; // Added border
        case "delivered":
            return "bg-green-100 text-green-800 border-green-200"; // Added border
        case "paid":
            return "bg-emerald-100 text-emerald-800 border-emerald-200"; // Added border
        case "failed_delivery":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "out_for_delivery":
            return "bg-sky-100 text-sky-800 border-sky-200";
        case "returned":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "failed":
        case "canceled":
            return "bg-red-100 text-red-800 border-red-200"; // Added border
        default:
            return "bg-gray-100 text-gray-700 border-gray-200"; // Added border
    }
};

const OrderManagementPage = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [collectionTab, setCollectionTab] = useState<"all" | "success" | "others">("all");
    const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
    const [fraudCheckPhone, setFraudCheckPhone] = useState<string | null>(null);
    const token = useAppSelector(useCurrentToken);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

    const getEffectiveStatus = () => {
        if (collectionTab === "success") {
            return "success";
        }
        if (collectionTab === "others") {
            if (status && status !== "delivered") {
                return status;
            }
            return "others";
        }
        return status;
    };

    const { data, isLoading, isError, refetch } = useAllOrdersQuery({ 
        search, 
        status: getEffectiveStatus() 
    });
    const [deleteOrder] = useDeleteOrderMutation();

    const handleDeleteOrder = async (id: string) => {
        try {
            await deleteOrder(id).unwrap();
            toast.success("Order deleted successfully 🎉");
            setOrderToDelete(null);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete order");
        }
    };

    if (isLoading) return <Loader />;

    if (isError) {
        return (
            <div className="p-3 bg-red-100 text-red-700 border border-red-200 text-sm">
                🚨 Failed to load orders.
                <button
                    onClick={() => refetch()}
                    className="ml-3 text-red-600 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    const orders: TOrder[] = data?.data || [];

    const handleSearch = () => {
        refetch();
    };

    const handleDownloadInvoice = async (orderId: string) => {
        try {
            setIsDownloading(orderId);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/invoice/${orderId}`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to download invoice");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error(error);
            alert("Error downloading invoice. Please try again.");
        } finally {
            setIsDownloading(null);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            {/* Header and Search/Filter Section (Same compact layout) */}
            <div>
                <h1 className="text-xl font-bold text-gray-800">
                    Order Management
                </h1>
                <p className="text-sm text-gray-500">
                    Total: <strong>{orders.length}</strong>
                </p>
            </div>

            {/* Collection Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 border-b border-gray-150 pb-3">
                <div className="flex p-1 bg-gray-50 rounded-xl gap-1 border border-gray-200/50">
                    <button
                        onClick={() => {
                            setCollectionTab("all");
                            setStatus("");
                        }}
                        className={`flex items-center gap-2 px-5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 ${
                            collectionTab === "all"
                                ? "bg-white text-blue-600 shadow-sm border border-gray-200/50"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <span>All Orders</span>
                    </button>
                    <button
                        onClick={() => {
                            setCollectionTab("success");
                            setStatus("");
                        }}
                        className={`flex items-center gap-2 px-5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 ${
                            collectionTab === "success"
                                ? "bg-green-600 text-white shadow-sm"
                                : "text-gray-600 hover:text-green-600"
                        }`}
                    >
                        <span className={`w-2.5 h-2.5 rounded-full ${collectionTab === "success" ? "bg-white animate-pulse" : "bg-green-500"}`}></span>
                        <span>Success Orders</span>
                    </button>
                    <button
                        onClick={() => {
                            setCollectionTab("others");
                            setStatus("");
                        }}
                        className={`flex items-center gap-2 px-5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 ${
                            collectionTab === "others"
                                ? "bg-orange-500 text-white shadow-sm"
                                : "text-gray-600 hover:text-orange-600"
                        }`}
                    >
                        <span className={`w-2.5 h-2.5 rounded-full ${collectionTab === "others" ? "bg-white animate-pulse" : "bg-orange-500"}`}></span>
                        <span>Others Orders</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b bg-white border-gray-200 px-4 py-3 gap-4">

                {/* Left Section (Search) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Search by name, email, or phone"
                            className="w-full md:w-80 pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                        />
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>

                    {collectionTab !== "success" && (
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="failed_delivery">Failed Delivery</option>
                            {collectionTab === "all" && <option value="delivered">Delivered</option>}
                            <option value="canceled">Canceled</option>
                            <option value="returned">Returned</option>
                        </select>
                    )}

                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition whitespace-nowrap"
                    >
                        Search
                    </button>
                </div>

                {/* Right Section (Actions) */}
                <Link
                    href="/dashboard/orders/create"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition shadow-sm whitespace-nowrap"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Create Order
                </Link>

            </div>

            {/* Order Cards Grid */}
            <div className="grid mt-4 md:mt-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {orders.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-gray-500 bg-white border border-gray-200">
                        No orders found.
                    </div>
                ) : (
                    orders.map((order) => {
                        const totalItems = order.products.reduce(
                            (s, p) => s + p.quantity,
                            0,
                        );
                        const subtotal = order.products.reduce(
                            (s, p) => s + p.total_price,
                            0,
                        );
                        const totalPlusShipping = subtotal + (order.delivery_charge || 0);

                        const fullAddress = `${order.village_or_area}, ${order.upazila}, ${order.district}`;

                        const productNames = order.products.map((p) => p.title).join(", ");

                        return (
                            <div
                                key={order._id}
                                className="bg-white border border-gray-200 rounded-lg p-3 space-y-2 text-sm hover:border-blue-300 transition"
                            >
                                {/* Header (ID and Date) */}
                                <div className="border-b pb-2 mb-2">
                                    <h3 className="font-bold text-gray-800 text-base">
                                        <Tag className="w-4 h-4 inline mr-1 text-blue-500" />
                                        Order #
                                        <span className="font-mono text-xs">{order.order_id}</span>
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>

                                {/* Customer Info */}
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div className="truncate">
                                        <span className="font-medium">
                                            {order.customer_name || "Guest User"}
                                        </span>
                                        <span className="text-xs text-gray-500 block">
                                            {order.email || order.phone}
                                            {order.phone && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFraudCheckPhone(order.phone);
                                                    }}
                                                    className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tighter"
                                                    title="Check Fraud History"
                                                >
                                                    <ShieldAlert className="w-3 h-3" />
                                                    Fraud Check
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Statuses */}
                                <div className="space-y-1 pt-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <Package className="w-3.5 h-3.5 text-orange-500" /> Order:
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 font-semibold  rounded-md capitalize p-1 ${statusBadge(
                                                order.order_status,
                                            )}`}
                                        >
                                            {order.order_status.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <Tag className="w-3.5 h-3.5 text-green-500" /> Payment:
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 text- font-semibold  rounded-md capitalize p-1 ${statusBadge(
                                                order.payment_status,
                                            )}`}
                                        >
                                            {order.payment_status.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                </div>

                                {/* Totals and Items */}
                                <div className="flex justify-between items-center border-t pt-2 mt-2">
                                    <p className="flex items-center gap-1 text-gray-600 text-xs">
                                        <ShoppingCart className="w-3.5 h-3.5" /> Items:{" "}
                                        <strong className="text-gray-900">{totalItems}</strong>
                                    </p>
                                    <h4 className="font-extrabold text-base text-blue-600">
                                        {currency(totalPlusShipping)}
                                    </h4>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                                    {/* Quick View */}
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 border border-purple-200 rounded-md hover:bg-purple-200 hover:text-purple-800 transition whitespace-nowrap"
                                        title="Quick View"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Overview
                                    </button>

                                    {/* Full Details */}
                                    <Link
                                        href={`/dashboard/orders/${order._id}`}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition whitespace-nowrap"
                                        title="Full Details"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        View & Edit
                                    </Link>

                                    {/* Make Invoice */}
                                    <button
                                        onClick={() => handleDownloadInvoice(order._id)}
                                        disabled={isDownloading === order._id}
                                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md transition whitespace-nowrap ${isDownloading === order._id ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                                            }`}
                                        title="Make Invoice"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        {isDownloading === order._id ? "..." : "Invoice"}
                                    </button>

                                    {/* Delete Order */}

                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />

            <FraudCheckerModal
                phone={fraudCheckPhone || undefined}
                isOpen={!!fraudCheckPhone}
                onClose={() => setFraudCheckPhone(null)}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
                <DialogContent className="sm:max-w-[400px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-gray-800 font-bold">Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Are you sure you want to delete this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setOrderToDelete(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => orderToDelete && handleDeleteOrder(orderToDelete)}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrderManagementPage;
