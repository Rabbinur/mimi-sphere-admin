"use client";

import { useGetMetaAnalyticsQuery } from "@/components/Redux/RTK/metaApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilePagination } from "@/components/ui/file-paggination";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, subDays } from "date-fns";
import {
  CheckCircle,
  ExternalLink,
  Eye,
  Info,
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
  XCircle
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });


const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

const AnalyticsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data, isLoading, refetch, isFetching } = useGetMetaAnalyticsQuery({
    startDate,
    endDate,
    page: currentPage,
    limit,
  });

  const analytics = data?.data;
  const pagination = analytics?.pagination;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  const eventSummary = analytics?.eventCounts || [];
  const dailyTrends = analytics?.dailyTrends || [];
  const statusSummary = analytics?.statusCounts || [];
  const recentEvents = analytics?.recentEvents || [];

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meta Conversions Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your server-side events and ad performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1 shadow-sm">
            <div className="flex items-center gap-2">
              <label htmlFor="startDate" className="text-xs font-medium text-muted-foreground">From:</label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 w-[130px] border-none focus-visible:ring-0 text-xs p-0"
              />
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <label htmlFor="endDate" className="text-xs font-medium text-muted-foreground">To:</label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 w-[130px] border-none focus-visible:ring-0 text-xs p-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={eventSummary.reduce((acc: number, curr: any) => acc + curr.count, 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Total tracked actions"
        />
        <StatsCard
          title="Purchases"
          value={eventSummary.find((e: any) => e._id === "Purchase")?.count || 0}
          icon={<ShoppingCart className="h-4 w-4" />}
          description="Confirmed transactions"
          color="text-green-500"
        />
        <StatsCard
          title="View Content"
          value={eventSummary.find((e: any) => e._id === "ViewContent")?.count || 0}
          icon={<Eye className="h-4 w-4" />}
          description="Product detail views"
          color="text-blue-500"
        />
        <StatsCard
          title="Success Rate"
          value={`${Math.round(
            ((statusSummary.find((s: any) => s._id === "sent")?.count || 0) /
              (statusSummary.reduce((acc: number, curr: any) => acc + curr.count, 0) || 1)) *
            100
          )}%`}
          icon={<CheckCircle className="h-4 w-4" />}
          description="API delivery success"
          color="text-purple-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Daily Trends Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Daily Event Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="_id"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Event Distribution Bar Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventSummary} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="_id"
                    type="category"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {eventSummary.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Conversion Events</CardTitle>
          <Badge variant="outline" className="font-mono">
            Total: {pagination?.total || 0}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Product/Content</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.length > 0 ? (
                  recentEvents.map((event: any) => (
                    <TableRow key={event._id}>
                      <TableCell className="font-semibold">
                        <div className="flex flex-col">
                          <span>{event.eventName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {event._id.slice(-8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm" title={event.customData?.content_name}>
                          {event.customData?.content_name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-primary">
                          {event.customData?.value?.toLocaleString()} {event.customData?.currency}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={event.status === "sent" ? "default" : "destructive"}
                          className={event.status === "sent" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" : ""}
                        >
                          {event.status === "sent" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <EventDetailsDialog event={event} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No recent events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <FilePagination
              currentPage={currentPage}
              totalPages={pagination?.totalPages || 1}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EventDetailsDialog = ({ event }: { event: any }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon">
        <Info className="h-4 w-4" />
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Event Details: {event.eventName}
          <Badge variant="outline" className="text-[10px]">{event._id}</Badge>
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <DetailSection title="General Information">
            <DetailItem label="Status" value={event.status} />
            <DetailItem label="Created At" value={new Date(event.createdAt).toLocaleString()} />
            <DetailItem label="Action Source" value={event.actionSource} />
            <DetailItem label="Source URL" value={event.eventSourceUrl} isLink />
          </DetailSection>

          <DetailSection title="User Data">
            <DetailItem label="IP Address" value={event.userData?.client_ip_address} />
            <DetailItem label="User Agent" value={event.userData?.client_user_agent} />
            <DetailItem label="FBP" value={event.userData?.fbp || "N/A"} />
            <DetailItem label="FBC" value={event.userData?.fbc || "N/A"} />
          </DetailSection>
        </div>

        <DetailSection title="Custom Data">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Value" value={`${event.customData?.value} ${event.customData?.currency}`} />
            <DetailItem label="Content Type" value={event.customData?.content_type} />
            <DetailItem label="Content Name" value={event.customData?.content_name} />
            <DetailItem label="Content IDs" value={event.customData?.content_ids?.join(", ")} />
          </div>
        </DetailSection>

        <DetailSection title="Raw Data (JSON)">
          <pre className="bg-muted p-4 rounded-md text-[10px] overflow-auto max-h-[200px]">
            {JSON.stringify(event, null, 2)}
          </pre>
        </DetailSection>
      </div>
    </DialogContent>
  </Dialog>
);

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
    <div className="space-y-1">{children}</div>
  </div>
);

const DetailItem = ({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-muted-foreground">{label}</span>
    {isLink ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 truncate">
        {value} <ExternalLink className="h-2 w-2" />
      </a>
    ) : (
      <span className="text-xs font-medium break-all">{value || "N/A"}</span>
    )}
  </div>
);

const StatsCard = ({ title, value, icon, description, color = "text-muted-foreground" }: any) => (
  <Card className="overflow-hidden relative">
    <div className="absolute top-0 right-0 p-3 opacity-10">
      {React.cloneElement(icon as React.ReactElement)}
    </div>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={color}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

export default AnalyticsPage;
