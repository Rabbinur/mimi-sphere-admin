"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Printer,
  User,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetChannelOrdersManagementQuery,
  useOrderStatusUpdateMutation,
  useDeleteOrderMutation,
} from "@/components/Redux/RTK/orderApi";
import { currency, formatDate, TOrder } from "@/lib/orders/orders";
import OrderDetailsModal from "../_components/OrderDetailsModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PosOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, isFetching, refetch } = useGetChannelOrdersManagementQuery({
    channel: "POS",
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });

  const [updateStatus] = useOrderStatusUpdateMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  const orders: TOrder[] = data?.data?.orders || [];
  const stats = data?.data?.stats || {
    total_orders: 0,
    total_revenue: 0,
    delivered: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
  };
  const pagination = data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

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
      a.download = `pos_receipt_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Receipt PDF downloaded");
    } catch (err) {
      toast.error("Error downloading receipt");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder(orderToDelete).unwrap();
      toast.success("POS order deleted");
      setOrderToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete order");
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50/60 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">POS Orders & Counter Sales</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                Outlet Counter
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Review store counter transactions, print receipts, and track cashier sales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-purple-600" : ""}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/pos"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Open POS Terminal
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Counter Orders</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.total_orders || 0}</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Completed Sales</span>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2">{stats.delivered?.count || 0}</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-purple-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Total POS Revenue</span>
          <div className="text-3xl font-extrabold text-purple-700 mt-2">
            ৳{stats.total_revenue?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by receipt #, customer name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-purple-600"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Receipt # & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Payment & Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
                    <span>Loading counter orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span className="font-medium text-slate-600">No POS orders found</span>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900 font-mono flex items-center gap-1">
                        #{order.order_id}
                        <button onClick={() => handleCopy(order.order_id)} className="text-slate-400 hover:text-slate-600">
                          {copiedId === order.order_id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500">{formatDate(order.createdAt)}</div>
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 rounded mt-1">
                        POS COUNTER
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-900">{order.customer_name || "Walk-in Customer"}</div>
                      <div className="text-[11px] text-slate-500">{order.phone || "No phone"}</div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1 max-w-[240px]">
                        {order.products?.slice(0, 2).map((item, i) => {
                          const itemName =
                            item.title ||
                            item.product_title ||
                            (item as any).product_name ||
                            "Product";
                          return (
                            <div key={i} className="text-xs truncate">
                              <span className="font-medium">{itemName}</span>{" "}
                              <span className="text-slate-400">×{item.quantity}</span>
                            </div>
                          );
                        })}
                        {(order.products?.length || 0) > 2 && (
                          <span className="text-[10px] text-purple-600 font-semibold">
                            +{order.products.length - 2} more item(s)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="font-extrabold text-sm text-slate-900">
                        ৳{order.total_price?.toLocaleString() || 0}
                      </div>
                      <div className="text-[10px] text-slate-500">{order.payment_method || "CASH"}</div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        {order.order_status || "delivered"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order._id)}
                          disabled={isDownloading === order._id}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Total: <span className="font-semibold text-slate-900">{pagination.total}</span> orders
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 font-medium">Page {page} of {pagination.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      <Dialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <DialogContent className="sm:max-w-[420px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Confirm Order Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm mt-2">
              Are you sure you want to delete this POS order?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setOrderToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
