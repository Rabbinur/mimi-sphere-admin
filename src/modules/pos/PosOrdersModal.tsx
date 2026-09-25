"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Printer,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useGetPosOrdersListQuery } from "@/components/Redux/RTK/posApi";
import { toast } from "sonner";

interface PosOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintReceipt?: (orderData: any) => void;
  onLoadOrderToCart?: (products: any[]) => void;
}

export function PosOrdersModal({
  isOpen,
  onClose,
  onPrintReceipt,
  onLoadOrderToCart,
}: PosOrdersModalProps) {
  const [activeTab, setActiveTab] = useState<"onhold" | "unpaid" | "paid" | "all">("paid");
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: response, isLoading, isFetching } = useGetPosOrdersListQuery(
    {
      status: activeTab,
      search: search.trim() || undefined,
      page: 1,
      per_page: 30,
    },
    { skip: !isOpen }
  );

  if (!isOpen) return null;

  const orders = response?.data?.orders || [];
  const totalOrders = response?.data?.total || 0;

  const handlePrint = (order: any) => {
    if (onPrintReceipt) {
      onPrintReceipt({
        receipt_number: order.order_id,
        order_number: order.order_id,
        order_id: String(order._id),
        created_at: order.date,
        customer_name: order.customer,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email,
        subtotal: order.total + (order.discount || 0),
        discount: order.discount || 0,
        tax: 0,
        total: order.total,
        payment_method: order.payment_method,
        tendered_amount: order.total,
        change_amount: 0,
        items: (order.products || []).map((p: any) => ({
          product_id: p.product_id,
          variant_id: p.variant_id,
          product_name: p.title,
          quantity: p.quantity,
          price: p.price,
          total: p.total_price || p.price * p.quantity,
        })),
      });
    } else {
      toast.info(`Preparing print for ${order.order_id}`);
    }
  };

  const handleOpenOrder = (order: any) => {
    if (onLoadOrderToCart && order.products && order.products.length > 0) {
      onLoadOrderToCart(order.products);
      toast.success(`Loaded items from ${order.order_id} to cart!`);
      onClose();
    } else {
      toast.info(`Viewing Order #${order.order_id}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 flex items-center justify-center animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching Image 2 */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              Orders
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              {totalOrders}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Subheader: Filter Tabs (Onhold, Unpaid, Paid) & Search Input */}
        <div className="px-5 pt-3.5 pb-3 border-b border-slate-100 space-y-3 shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("onhold")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "onhold"
                  ? "bg-[#ff9f43] text-white shadow-xs font-black"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Onhold
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unpaid")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "unpaid"
                  ? "bg-[#ff9f43] text-white shadow-xs font-black"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Unpaid
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paid")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "paid"
                  ? "bg-[#ff9f43] text-white shadow-xs font-black"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Paid
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#ff9f43] text-white shadow-xs font-black"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone, or Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
            />
            {(isLoading || isFetching) && (
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0 ml-2" />
            )}
          </div>
        </div>

        {/* Orders Card List (Matching Image 2) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5 custom-scrollbar">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Loading POS orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-2">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700">No orders found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No orders match your filter criteria.
              </p>
            </div>
          ) : (
            orders.map((order: any) => {
              const isExpanded = expandedOrderId === order.order_id;
              return (
                <div
                  key={order.order_id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  {/* Top row: Order ID Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-[#0a2540] text-white font-mono text-xs font-black tracking-wide">
                      Order ID : #{order.order_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        order.payment_status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </div>

                  {/* Metadata Grid matching Image 2 */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-500 font-medium">Cashier : </span>
                      <span className="font-bold text-slate-800">{order.cashier}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Customer : </span>
                      <span className="font-bold text-slate-800 truncate">{order.customer}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Total : </span>
                      <span className="font-mono font-black text-slate-900">
                        ৳{order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Date : </span>
                      <span className="font-medium text-slate-700">{order.date}</span>
                    </div>
                  </div>

                  {/* Note Banner if present */}
                  {order.note ? (
                    <div className="p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-blue-800 text-[11px] font-medium">
                      {order.note}
                    </div>
                  ) : null}

                  {/* Expandable Products List */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 pt-2 space-y-1.5 animate-in fade-in duration-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Ordered Items ({order.items_count})
                      </span>
                      <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl p-2 max-h-36 overflow-y-auto custom-scrollbar">
                        {order.products?.map((item: any, idx: number) => (
                          <div key={idx} className="py-1 flex items-center justify-between text-xs">
                            <span className="text-slate-700 font-medium truncate max-w-[200px]">
                              {item.title} × {item.quantity}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              ৳{(item.total_price || item.price * item.quantity).toLocaleString("en-US")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons matching Image 2: Open Order (Orange) | View Products (Teal) | Print (Blue) */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenOrder(order)}
                      className="flex-1 py-1.5 px-3 bg-[#ff9f43] hover:bg-[#f39c12] active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Open Order</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.order_id)
                      }
                      className="flex-1 py-1.5 px-3 bg-[#009688] hover:bg-[#00897b] active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? "Hide" : "View"} Products</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrint(order)}
                      className="flex-1 py-1.5 px-3 bg-[#4338ca] hover:bg-[#3730a3] active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
