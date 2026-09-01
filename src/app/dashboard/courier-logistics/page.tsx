"use client";

import Loader from "@/components/custom/Loader";
import { useAllOrdersQuery } from "@/components/Redux/RTK/orderApi";
import { currency, formatDate, TOrder } from "@/lib/orders/orders";
import {
  Calendar,
  ExternalLink,
  Eye,
  MapPin,
  Package,
  Search,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CourierLogisticsPage = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useAllOrdersQuery({ search });

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg">
        🚨 Failed to load logistics data.
        <button onClick={() => refetch()} className="ml-3 underline font-bold">
          Retry
        </button>
      </div>
    );
  }

  // Filter orders that have courier details
  const orders: TOrder[] = (data?.data || []).filter(
    (order: TOrder) => order.courier_details?.consignment_id,
  );

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen space-y-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            Courier Logistics
          </h1>
          <p className="text-sm text-gray-500">
            Monitoring {orders.length} dispatched shipments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shipments..."
              className="w-full md:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {orders.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              No dispatched orders found.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {order.courier_details?.courier_name || "Steadfast"}
                    </span>
                    <h3 className="font-bold text-gray-900">
                      Order #{order.order_id}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {order.customer_name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900">
                    {currency(order.total_price)}
                  </p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Total Value
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Tracking Code
                    </label>
                    <p className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 mt-1 truncate">
                      {order.courier_details?.tracking_code}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        Consignment ID
                      </label>
                      <span className="text-sm font-semibold text-gray-700">
                        #{order.courier_details?.consignment_id}
                      </span>
                    </div>
                    <div className="text-right">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        Courier Status
                      </label>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {order.courier_details?.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed truncate">
                      {order.village_or_area}, {order.upazila}, {order.district}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/orders/${order._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Eye className="w-3 h-3" /> Order Details
                    </Link>
                    {order.courier_details?.courier_name === "Carrybee" ? (
                      <a
                        href={`https://merchant.carrybee.com/order-track/${order.courier_details?.consignment_id}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                      >
                        <ExternalLink className="w-3 h-3" /> Tracking Portal
                      </a>
                    ) : (
                      <a
                        href={`https://portal.packzy.com/tracking?code=${order.courier_details?.tracking_code}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                      >
                        <ExternalLink className="w-3 h-3" /> Tracking Portal
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourierLogisticsPage;
