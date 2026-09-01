"use client";

import { useGetGoogleAnalyticsQuery } from "@/components/Redux/RTK/googleApi";
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
  Eye,
  Globe,
  Info,
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
  Users
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });

const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#8E44AD", "#F39C12"];

const GoogleAnalyticsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data, isLoading, refetch, isFetching } = useGetGoogleAnalyticsQuery({
    startDate,
    endDate,
    page: currentPage,
    limit,
  });

  const analytics = data?.data;
  const liveData = analytics?.liveGAData;

  // --- Parse Expanded Live GA4 Data ---
  const liveStats = useMemo(() => {
    if (!liveData?.rows) return { totalUsers: 0, countries: [], events: [], pages: [], sources: [], devices: [] };

    const countriesMap: Record<string, number> = {};
    const eventsMap: Record<string, number> = {};
    const pagesMap: Record<string, number> = {};
    const sourcesMap: Record<string, number> = {};
    const devicesMap: Record<string, number> = {};
    const uniqueUsersByDay: Record<string, number> = {};

    liveData.rows.forEach((row: any) => {
      const eventName = row.dimensionValues[0].value;
      const country = row.dimensionValues[1].value;
      const date = row.dimensionValues[2].value;
      const pagePath = row.dimensionValues[3].value;
      const source = row.dimensionValues[4].value;
      const device = row.dimensionValues[5].value;

      const users = parseInt(row.metricValues[0].value);
      const eventCount = parseInt(row.metricValues[1].value);

      // Unique Users estimation
      if (eventName === 'session_start') {
        uniqueUsersByDay[date + country + source] = users;
      }

      countriesMap[country] = Math.max(countriesMap[country] || 0, users);
      eventsMap[eventName] = (eventsMap[eventName] || 0) + eventCount;
      pagesMap[pagePath] = (pagesMap[pagePath] || 0) + eventCount;
      sourcesMap[source] = (sourcesMap[source] || 0) + users;
      devicesMap[device] = (devicesMap[device] || 0) + users;
    });

    const totalUsers = Object.values(uniqueUsersByDay).reduce((a, b) => a + b, 0);

    const sortAndSlice = (map: Record<string, number>, limit = 6) =>
      Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, limit);

    return {
      totalUsers: totalUsers || 0,
      countries: sortAndSlice(countriesMap, 5),
      events: sortAndSlice(eventsMap, 6),
      pages: sortAndSlice(pagesMap, 8),
      sources: sortAndSlice(sourcesMap, 5),
      devices: sortAndSlice(devicesMap, 3)
    };
  }, [liveData]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4285F4]"></div>
      </div>
    );
  }

  const eventSummary = analytics?.eventCounts || [];
  const dailyTrends = analytics?.dailyTrends || [];
  const recentEvents = analytics?.recentEvents || [];

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics Pro</h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Live Sync Active
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="hover:bg-white shadow-sm border"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Sync Now
          </Button>
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 shadow-sm">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-7  border-none focus-visible:ring-0 text-xs p-0 bg-transparent"
            />
            <span className="text-slate-300">|</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-7  border-none focus-visible:ring-0 text-xs p-0 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Users"
          value={liveStats.totalUsers}
          icon={<Users className="h-5 w-5" />}
          description="Total in selected period"
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Top Source"
          value={liveStats.sources[0]?.name || "N/A"}
          icon={<Globe className="h-5 w-5" />}
          description={`${liveStats.sources[0]?.value || 0} sessions`}
          color="bg-green-50 text-green-600"
        />
        <StatsCard
          title="Conversion Rate"
          value={liveStats.totalUsers > 0 ? ((eventSummary.find((e: any) => e._id === "purchase")?.count || 0) / liveStats.totalUsers * 100).toFixed(1) + "%" : "0%"}
          icon={<ShoppingCart className="h-5 w-5" />}
          description="Checkout Success"
          color="bg-purple-50 text-purple-600"
        />
        <StatsCard
          title="Page Views"
          value={liveStats.events.find(e => e.name === 'page_view')?.value || 0}
          icon={<Eye className="h-5 w-5" />}
          description="Total hits on site"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        {/* Main Chart */}
        <Card className="lg:col-span-8 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-white/50 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" /> Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrends}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4285F4" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4285F4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#4285F4" strokeWidth={4} dot={{ r: 5, fill: "#4285F4", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader className="bg-white/50 border-b">
            <CardTitle className="text-lg font-bold">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {liveStats.sources.map((s, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 capitalize">{s.name}</span>
                    <span className="text-slate-500 font-mono">{s.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#4285F4] h-full rounded-full transition-all duration-500"
                      style={{ width: `${(s.value / liveStats.totalUsers * 100) || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Device Split</h4>
              <div className="flex items-center justify-around">
                {liveStats.devices.map((d, i) => (
                  <div key={i} className="text-center">
                    <p className="text-lg font-bold text-slate-800">{d.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{d.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Pages */}
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader className="bg-white/50 border-b">
            <CardTitle className="text-lg font-bold">Top Content & Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60%] pl-6">Page Path</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right pr-6">Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveStats.pages.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6 font-mono text-xs truncate max-w-[200px] text-slate-600">
                      {p.name === '/' ? 'Home' : p.name}
                    </TableCell>
                    <TableCell className="font-bold">{p.value}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="inline-flex items-center gap-1 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                        <TrendingUp className="w-3 h-3" /> Trending
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Countries Map-list */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-white/50 border-b">
            <CardTitle className="text-lg font-bold">Top Regions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {liveStats.countries.map((c, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg shadow-sm border border-slate-100">
                    {c.name === 'Bangladesh' ? '🇧🇩' : '🌍'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{c.name}</p>
                    <p className="text-[10px] text-slate-500">{c.value} active users</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-900">{Math.round(c.value / liveStats.totalUsers * 100) || 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Log */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-slate-900 text-white">
          <CardTitle className="text-lg">Real-time Backend Logs</CardTitle>
          <p className="text-xs text-slate-400">Activity captured via Measurement Protocol API</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="pl-6">Event</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvents.length > 0 ? (
                recentEvents.map((event: any) => (
                  <TableRow key={event._id} className="group">
                    <TableCell className="pl-6 font-bold text-slate-700">{event.eventName}</TableCell>
                    <TableCell className="text-xs text-slate-500 italic">
                      {format(new Date(event.createdAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={event.status === "sent" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100"}
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <EventDetailsDialog event={event} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-400 text-sm italic">
                    Waiting for new server events...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t bg-white">
            <FilePagination
              currentPage={currentPage}
              totalPages={analytics?.pagination?.totalPages || 1}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ... keep StatsCard and EventDetailsDialog ...


const EventDetailsDialog = ({ event }: { event: any }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon">
        <Info className="h-4 w-4" />
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Event Details: {event.eventName}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold">Client ID</p>
            <p className="font-mono break-all">{event.clientId}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold">Status</p>
            <p>{event.status}</p>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase font-bold mb-1">Parameters</p>
          <pre className="bg-muted p-3 rounded text-[10px] overflow-auto max-h-[300px]">
            {JSON.stringify(event.params || {}, null, 2)}
          </pre>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const StatsCard = ({ title, value, icon, description, color }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={color}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

export default GoogleAnalyticsPage;

