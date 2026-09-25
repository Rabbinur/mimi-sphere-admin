"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  Globe,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  FileText,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Package,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetChannelOrdersManagementQuery,
  useOrderStatusUpdateMutation,
  useDeleteOrderMutation,
  useSendToSteadfastMutation,
  useSendToCarrybeeMutation,
} from "@/components/Redux/RTK/orderApi";
import { formatDate, TOrder } from "@/lib/orders/orders";
import OrderDetailsModal from "../_components/OrderDetailsModal";
import FraudCheckerModal from "../_components/FraudCheckerModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  shipped: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  out_for_delivery: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  failed_delivery: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  returned: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  canceled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export default function OnlineOrdersPage() {
  // Query state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  const [fraudPhone, setFraudPhone] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page on filter change
  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  // API query
  const { data, isLoading, isFetching, refetch } = useGetChannelOrdersManagementQuery({
    channel: "ONLINE",
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] = useOrderStatusUpdateMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [sendToSteadfast, { isLoading: isBookingSteadfast }] = useSendToSteadfastMutation();
  const [sendToCarrybee, { isLoading: isBookingCarrybee }] = useSendToCarrybeeMutation();

  const orders: TOrder[] = data?.data?.orders || [];
  const stats = data?.data?.stats || {
    total_orders: 0,
    total_revenue: 0,
    pending: { count: 0, amount: 0 },
    processing: { count: 0, amount: 0 },
    delivered: { count: 0, amount: 0 },
    cancelled: { count: 0, amount: 0 },
  };
  const pagination = data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // Status update handler
  const handleInlineStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus({
        id: orderId,
        data: { order_status: newStatus },
      }).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  // Courier booking handlers
  const handleSteadfastBooking = async (orderId: string) => {
    try {
      await sendToSteadfast(orderId).unwrap();
      toast.success("Order dispatched to Steadfast Courier successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Steadfast courier booking failed");
    }
  };

  const handleCarrybeeBooking = async (orderId: string) => {
    try {
      await sendToCarrybee(orderId).unwrap();
      toast.success("Order dispatched to CarryBee Courier successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "CarryBee courier booking failed");
    }
  };

  // Invoice download handler
  const handleDownloadInvoice = async (orderId: string) => {
    try {
      setIsDownloading(orderId);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/invoice/${orderId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to download invoice");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Invoice PDF downloaded successfully");
    } catch (err) {
      toast.error("Error downloading invoice. Please try again.");
    } finally {
      setIsDownloading(null);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder(orderToDelete).unwrap();
      toast.success("Order deleted successfully");
      setOrderToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete order");
    }
  };

  // Copy order id
  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Order ID copied to clipboard");
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50/60 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#f97316]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Online Orders Management</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                  Website Channel
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Manage live web store orders, review new checkouts, run fraud detection & dispatch couriers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#f97316]" : ""}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/orders/create"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#f97316] hover:bg-[#ea580c] rounded-lg shadow-sm transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Create Order
          </Link>
        </div>
      </div>

      {/* Top Interactive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: New / Pending Orders (Highlighted) */}
        <div
          onClick={() => handleStatusChange("pending")}
          className={`relative p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400"
              : "bg-white border-amber-200/80 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                statusFilter === "pending" ? "text-amber-100" : "text-amber-700"
              }`}
            >
              New & Pending
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                statusFilter === "pending" ? "bg-amber-600/60 text-white" : "bg-amber-100 text-amber-700"
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-extrabold tracking-tight">
                {stats.pending?.count || 0}
              </div>
              <div
                className={`text-xs font-medium mt-0.5 ${
                  statusFilter === "pending" ? "text-amber-100" : "text-slate-500"
                }`}
              >
                Amount: ৳{stats.pending?.amount?.toLocaleString() || 0}
              </div>
            </div>
            {(stats.pending?.count || 0) > 0 && (
              <span
                className={`px-2 py-1 text-[11px] font-bold rounded-full animate-pulse ${
                  statusFilter === "pending"
                    ? "bg-white text-amber-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                Needs Action
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Processing */}
        <div
          onClick={() => handleStatusChange("processing")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            statusFilter === "processing"
              ? "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400"
              : "bg-white border-blue-200/80 hover:border-blue-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                statusFilter === "processing" ? "text-blue-100" : "text-blue-700"
              }`}
            >
              Processing
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                statusFilter === "processing" ? "bg-blue-700/60 text-white" : "bg-blue-100 text-blue-700"
              }`}
            >
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight">
              {stats.processing?.count || 0}
            </div>
            <div
              className={`text-xs font-medium mt-0.5 ${
                statusFilter === "processing" ? "text-blue-100" : "text-slate-500"
              }`}
            >
              Amount: ৳{stats.processing?.amount?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {/* Card 3: Delivered */}
        <div
          onClick={() => handleStatusChange("delivered")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            statusFilter === "delivered"
              ? "bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400"
              : "bg-white border-emerald-200/80 hover:border-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                statusFilter === "delivered" ? "text-emerald-100" : "text-emerald-700"
              }`}
            >
              Delivered
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                statusFilter === "delivered" ? "bg-emerald-700/60 text-white" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight">
              {stats.delivered?.count || 0}
            </div>
            <div
              className={`text-xs font-medium mt-0.5 ${
                statusFilter === "delivered" ? "text-emerald-100" : "text-slate-500"
              }`}
            >
              Amount: ৳{stats.delivered?.amount?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {/* Card 4: Cancelled */}
        <div
          onClick={() => handleStatusChange("cancelled")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            statusFilter === "cancelled"
              ? "bg-rose-600 text-white border-rose-700 ring-2 ring-rose-400"
              : "bg-white border-rose-200/80 hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                statusFilter === "cancelled" ? "text-rose-100" : "text-rose-700"
              }`}
            >
              Cancelled / Returned
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                statusFilter === "cancelled" ? "bg-rose-700/60 text-white" : "bg-rose-100 text-rose-700"
              }`}
            >
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight">
              {stats.cancelled?.count || 0}
            </div>
            <div
              className={`text-xs font-medium mt-0.5 ${
                statusFilter === "cancelled" ? "text-rose-100" : "text-slate-500"
              }`}
            >
              Amount: ৳{stats.cancelled?.amount?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Filter Tabs and Search Bar */}
        <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
              {[
                { key: "all", label: "All Orders", count: stats.total_orders },
                { key: "pending", label: "New / Pending", count: stats.pending?.count, badgeClass: "bg-amber-100 text-amber-800" },
                { key: "processing", label: "Processing", count: stats.processing?.count },
                { key: "delivered", label: "Delivered", count: stats.delivered?.count },
                { key: "cancelled", label: "Cancelled", count: stats.cancelled?.count },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleStatusChange(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                    statusFilter === tab.key
                      ? "bg-white text-[#f97316] shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                        statusFilter === tab.key
                          ? "bg-orange-100 text-[#f97316]"
                          : tab.badgeClass || "bg-slate-200/70 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#f97316] transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Secondary Filter Row: Date Range & Limit */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date Range:
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#f97316]"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#f97316]"
              />
              {(startDate || endDate || searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#f97316]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Payment & Total</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Courier Booking</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#f97316]" />
                      <span>Loading online orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <span className="font-medium text-slate-600">No online orders found</span>
                      <p className="text-xs text-slate-400">
                        {statusFilter !== "all" || searchTerm
                          ? "Try clearing filters to see more results"
                          : "New web orders will appear here automatically"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusStyle =
                    statusColors[order.order_status?.toLowerCase()] || {
                      bg: "bg-slate-50",
                      text: "text-slate-700",
                      border: "border-slate-200",
                    };

                  const fullAddress = [
                    order.village_or_area,
                    order.upazila,
                    order.district,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  const steadfastCid =
                    order.courier_details?.consignment_id ||
                    (order as any).steadfast_consignment_id;
                  const carrybeeCid =
                    (order as any).carrybee_consignment_id;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Column 1: Order ID & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 font-mono">
                              #{order.order_id}
                            </span>
                            <button
                              onClick={() => handleCopyOrderId(order.order_id)}
                              className="text-slate-400 hover:text-slate-600 transition"
                              title="Copy Order ID"
                            >
                              {copiedId === order.order_id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDate(order.createdAt)}
                          </div>
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 rounded">
                            ONLINE
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Customer */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1 max-w-[200px]">
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{order.customer_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{order.phone}</span>
                          </div>
                          <div
                            className="text-[11px] text-slate-500 truncate flex items-center gap-1"
                            title={fullAddress || "N/A"}
                          >
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{fullAddress || "N/A"}</span>
                          </div>
                          {order.phone && (
                            <button
                              onClick={() => setFraudPhone(order.phone)}
                              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded hover:bg-amber-100 transition"
                            >
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              Fraud Check
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Items Summary */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5 max-w-[240px]">
                          {order.products?.slice(0, 2).map((item, idx) => {
                            const itemName =
                              item.title ||
                              item.product_title ||
                              (item as any).product_name ||
                              "Product";
                            const itemImage =
                              item.thumbnail || (item as any).product_image;

                            return (
                              <div key={idx} className="flex items-center gap-2">
                                {itemImage ? (
                                  <img
                                    src={itemImage}
                                    alt={itemName}
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p
                                    className="text-xs font-medium text-slate-800 truncate"
                                    title={itemName}
                                  >
                                    {itemName}
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    Qty: {item.quantity} × ৳{item.price}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {(order.products?.length || 0) > 2 && (
                            <div className="text-[10px] font-semibold text-orange-600">
                              + {order.products.length - 2} more item(s)
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Payment & Total */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <div className="font-extrabold text-sm text-slate-900">
                            ৳{order.total_price?.toLocaleString() || 0}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded">
                              {order.payment_method || "COD"}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                                order.payment_status?.toLowerCase() === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.payment_status || "Pending"}
                            </span>
                          </div>
                          {order.delivery_charge !== undefined && (
                            <div className="text-[10px] text-slate-400">
                              Delivery: ৳{order.delivery_charge}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Status with Inline Selector */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {order.order_status}
                          </span>
                          <div>
                            <select
                              value={order.order_status}
                              disabled={isUpdatingStatus}
                              onChange={(e) =>
                                handleInlineStatusUpdate(order._id, e.target.value)
                              }
                              className="text-[11px] py-1 px-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#f97316] text-slate-700 font-medium cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="canceled">Canceled</option>
                              <option value="returned">Returned</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Courier Booking */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          {steadfastCid ? (
                            <div className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded">
                              <span className="font-semibold block">Steadfast Booked</span>
                              <span className="font-mono text-[10px]">CID: {steadfastCid}</span>
                            </div>
                          ) : carrybeeCid ? (
                            <div className="text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded">
                              <span className="font-semibold block">CarryBee Booked</span>
                              <span className="font-mono text-[10px]">CID: {carrybeeCid}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleSteadfastBooking(order._id)}
                                disabled={isBookingSteadfast}
                                className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition"
                              >
                                <Truck className="w-3 h-3" /> Steadfast
                              </button>
                              <button
                                onClick={() => handleCarrybeeBooking(order._id)}
                                disabled={isBookingCarrybee}
                                className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition"
                              >
                                <Truck className="w-3 h-3" /> CarryBee
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Download Invoice */}
                          <button
                            onClick={() => handleDownloadInvoice(order._id)}
                            disabled={isDownloading === order._id}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Download Invoice PDF"
                          >
                            {isDownloading === order._id ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete Order */}
                          <button
                            onClick={() => setOrderToDelete(order._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {pagination.total === 0 ? 0 : (page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(page * limit, pagination.total)}
            </span>{" "}
            of <span className="font-semibold text-slate-900">{pagination.total}</span> orders
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {/* Page indicators */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (pagination.totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                  if (pageNum > pagination.totalPages) {
                    pageNum = pagination.totalPages - (4 - i);
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                      page === pageNum
                        ? "bg-[#f97316] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Fraud Checker Modal */}
      {fraudPhone && (
        <FraudCheckerModal
          phone={fraudPhone}
          isOpen={!!fraudPhone}
          onClose={() => setFraudPhone(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <DialogContent className="sm:max-w-[420px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Confirm Order Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm mt-2">
              Are you sure you want to permanently delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrderToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
