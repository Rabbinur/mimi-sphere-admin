"use client";

import {
  DollarSign,
  Package,
  ShoppingCart,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import {
  Area,
  CartesianGrid,
  Cell,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ✅ Only dynamically import the parent chart containers
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });


// Shadcn UI (Simplified for direct use)

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Redux / Types
import { MetricCard } from "@/components/DashboardCommonFile/MetricCard";
import { useDbOverviewQuery } from "@/components/Redux/RTK/authApi";
import { Button } from "@/components/ui/button";
import { TDashboardOverview } from "@/types";

export default function InformativeDashboard() {
  const { data, isLoading } = useDbOverviewQuery(undefined);

  // 1. Logic & Derived Metrics
  const overview: TDashboardOverview = data?.data;

  const stats = useMemo(() => {
    if (!overview) return null;
    const totalOrders = overview.orders.totalOrders || 0;
    const revenue = overview.revenue.totalRevenue || 0;
    const activeProducts = overview.products.activeProducts || 0;

    return {
      aov: totalOrders > 0 ? (revenue / totalOrders).toFixed(2) : '0.00',
      fulfillmentRate:
        totalOrders > 0
          ? ((overview.orders.status.delivered / totalOrders) * 100).toFixed(0)
          : '0',
      stockHealth:
        activeProducts > 0
          ? (
            ((activeProducts - overview.products.lowStockProducts) / activeProducts) *
            100
          ).toFixed(0)
          : '100',
    };
  }, [overview]);

  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse">
        Analyzing Store Data...
      </div>
    );
  if (!overview)
    return <div className="p-10 text-center">No data available.</div>;

  // Pie Chart Data for Category Health
  const categoryData = [
    {
      name: "Active",
      value: overview.categories.totalCategories,
      fill: "#6366f1",
    },
    {
      name: "Low Stock",
      value: overview.products.lowStockProducts,
      fill: "#f43f5e",
    },
  ];
  const pendingCount =
    overview.orders.status["pending"] +
    overview.orders.status["processing"] +
    overview.orders.status["shipped"];

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <div className="space-y-4 md:space-y-8">

        {/* Header with KPI Pulse */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Summary
            </h1>
            <p className="text-sm md:text-base text-slate-500">
              Performance insights for{" "}
              <span className="font-semibold text-indigo-600">Q1 2026</span>
            </p>
          </div>

          {/* KPI Mini-Cards - Wrapped in a scrollable or grid container for mobile */}
          <div className="grid grid-cols-3 md:flex gap-2 md:gap-4 p-2 bg-white rounded-2xl shadow-sm border w-full lg:w-auto">
            <div className="px-2 md:px-4 border-r text-center md:text-left">
              <p className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold">AOV</p>
              <p className="text-sm md:text-lg font-bold text-slate-800">৳{stats?.aov}</p>
            </div>
            <div className="px-2 md:px-4 border-r text-center md:text-left">
              <p className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold">Fulfillment</p>
              <p className="text-sm md:text-lg font-bold text-green-600">{stats?.fulfillmentRate}%</p>
            </div>
            <div className="px-2 md:px-4 text-center md:text-left">
              <p className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold">Stock Health</p>
              <p className="text-sm md:text-lg font-bold text-indigo-600">{stats?.stockHealth}%</p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Gross Revenue"
            value={`৳${overview.revenue.totalRevenue}`}
            trend="+14%"
            icon={<DollarSign className="w-5 h-5" />}
            chartColor="#10b981"
          />
          <MetricCard
            title="Order Volume"
            value={overview.orders.totalOrders}
            trend="+5%"
            icon={<ShoppingCart className="w-5 h-5" />}
            chartColor="#3b82f6"
          />
          <MetricCard
            title="Inventory Items"
            value={overview.products.activeProducts}
            trend="Stable"
            icon={<Package className="w-5 h-5" />}
            chartColor="#6366f1"
          />
          <MetricCard
            title="Pending Actions"
            value={pendingCount}
            trend="High"
            isWarning
            icon={<Zap className="w-5 h-5" />}
            chartColor="#f59e0b"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* 1. Deep Revenue Analysis */}
          <Card className="lg:col-span-8 overflow-hidden border-none shadow-md ring-1 ring-slate-200">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-7">
              <div>
                <CardTitle className="text-lg md:text-xl font-bold">Revenue Velocity</CardTitle>
                <CardDescription className="text-xs md:text-sm">Real-time transaction flow</CardDescription>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none">
                Target: ৳5,000
              </Badge>
            </CardHeader>
            <CardContent className="h-[250px] md:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.chart} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 2. Stock & Categories */}
          <Card className="lg:col-span-4 border-none shadow-md ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-bold">Inventory Risk</CardTitle>
              <CardDescription>Critical stock levels</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-[180px] md:h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-4 mt-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Low Stock Risk</span>
                    <span className="text-red-600">{overview.products.lowStockProducts} Units</span>
                  </div>
                  <Progress value={overview.products.activeProducts > 0 ? (overview.products.lowStockProducts / overview.products.activeProducts) * 100 : 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Transactional Ledger - Responsive Table Container */}
          <Card className="lg:col-span-12 border-none shadow-md ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/30">
              <div className="flex flex-row justify-between items-center">
                <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
                <Button variant="outline" size="sm" className="text-xs">Audit Logs</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[120px] pl-6 uppercase text-[10px] font-bold">Trace ID</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold">Customer</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold">Status</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold">Gateway</TableHead>
                      <TableHead className="text-right pr-6 uppercase text-[10px] font-bold">Net Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.recentOrders.map((order) => (
                      <TableRow key={order.order_id} className="hover:bg-slate-50/50">
                        <TableCell className="font-mono text-[10px] md:text-xs pl-6">{order.order_id}</TableCell>
                        <TableCell className="font-semibold text-slate-700 text-sm">{order.customer_name}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold ${order.order_status === "delivered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            <div className={`w-1 h-1 rounded-full ${order.order_status === "delivered" ? "bg-green-600" : "bg-amber-600"}`} />
                            {order.order_status.toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs">{order.payment_method}</TableCell>
                        <TableCell className="text-right pr-6 font-bold text-slate-900 text-sm">৳{order.total_price.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


