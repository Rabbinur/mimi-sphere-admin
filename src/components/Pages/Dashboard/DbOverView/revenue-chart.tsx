"use client"

import { TDashboardOverview } from "@/types"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function RevenueChart({ overview }: { overview: TDashboardOverview }) {
  // 🔐 SAFE fallback
  const chartData = overview.chart ?? []

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground">
          Revenue Over Time
        </h3>
        <p className="text-2xl font-bold">
          ৳{overview.revenue?.totalRevenue?.toLocaleString() ?? 0}
        </p>
      </div>

      {!chartData.length ? (
        <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
          No revenue data available
        </div>
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `৳${v}`}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-chart-1)"
                fill="var(--color-chart-1)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
