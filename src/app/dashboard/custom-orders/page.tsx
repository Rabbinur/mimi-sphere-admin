"use client";

import {
    useGetCustomOrdersQuery,
    useUpdateCustomOrderStatusMutation,
} from "@/components/Redux/RTK/customOrderApi";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TOrderStatus } from "@/types";
import {
    Clock,
    ExternalLink,
    Image as ImageIcon,
    Loader2,
    Mail,
    Package,
    Phone,
    User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Assuming you use Sonner or similar for notifications


export default function AdminCustomOrdersPage() {
    const [search, setSearch] = useState("");

    const { data: orders, isLoading } = useGetCustomOrdersQuery(search);
    const [updateStatus, { isLoading: isUpdating }] =
        useUpdateCustomOrderStatusMutation();

    const handleStatusUpdate = async (
        orderId: string,
        newStatus: TOrderStatus,
    ) => {
        try {
            const res = await updateStatus({
                id: orderId,
                status: newStatus,
            }).unwrap();

            toast.success(res.message || `Order marked as ${newStatus}`);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update status");
        }
    };

    const getStatusStyles = (status: TOrderStatus) => {
        switch (status) {
            case "pending":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "processing":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "shipped":
                return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "delivered":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "canceled":
                return "bg-rose-100 text-rose-700 border-rose-200";
            default:
                return "bg-amber-100 text-amber-700 border-amber-200";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <div className=" space-y-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Custom Import Requests
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Manage and update customer procurement statuses.
                        </p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100">
                        Total Requests: {orders?.data?.length || 0}
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Search by name, email or phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm w-full max-w-sm"
                />

                {/* Orders Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {orders?.data?.map((order: any) => (
                        <div
                            key={order._id}
                            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col"
                        >
                            {/* Top Header: Date & Status Selector */}
                            <div className="px-5 py-4 bg-slate-50/50 border-b flex justify-between items-center">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Clock size={14} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <Select
                                    defaultValue={order.status}
                                    onValueChange={(value) =>
                                        handleStatusUpdate(order._id, value as TOrderStatus)
                                    }
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger
                                        className={`w-[140px] h-9 rounded-lg font-bold text-[11px] uppercase border shadow-sm transition-all ${getStatusStyles(order.status)}`}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className=" bg-white">
                                        <SelectItem
                                            value="pending"
                                            className="text-amber-600 font-medium text-xs"
                                        >
                                            PENDING
                                        </SelectItem>
                                        <SelectItem
                                            value="processing"
                                            className="text-blue-600 font-medium text-xs"
                                        >
                                            PROCESSING
                                        </SelectItem>

                                        <SelectItem
                                            value="cancelled"
                                            className="text-rose-600 font-medium text-xs"
                                        >
                                            CANCELLED
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-6 flex gap-6">
                                {/* Product Image */}
                                <div className="hidden sm:block w-28 h-28 rounded-2xl border-2 border-slate-100 bg-white overflow-hidden shrink-0 shadow-inner">
                                    {order.productImageUrl ? (
                                        <img
                                            src={order.productImageUrl}
                                            alt="product"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-indigo-600 transition-colors">
                                            {order.productName}
                                        </h3>
                                        <a
                                            href={order.purchaseUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-xs font-bold mt-2 hover:underline"
                                        >
                                            Product Source <ExternalLink size={12} />
                                        </a>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                                        "{order.productDescription}"
                                    </div>

                                    {/* Contact Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 pt-2">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <User size={16} />
                                            </div>
                                            <span className="font-semibold text-slate-700">
                                                {order.customerName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Phone size={16} />
                                            </div>
                                            <span className="text-slate-600 tabular-nums">
                                                {order.customerPhone}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:col-span-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Mail size={16} />
                                            </div>
                                            <span className="text-slate-600 truncate">
                                                {order.customerEmail}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {!isLoading && orders?.data?.length === 0 && (
                    <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-300">
                        <Package size={48} className="mx-auto text-slate-200 mb-4" />
                        <h2 className="text-xl font-bold text-slate-900">
                            No requests yet
                        </h2>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2">
                            Check back later for new customer import requests.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
