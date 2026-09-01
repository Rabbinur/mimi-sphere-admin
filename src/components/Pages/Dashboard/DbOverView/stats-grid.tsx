import { ArrowUpRight, DollarSign, Package, ShoppingCart } from "lucide-react"

interface StatsGridProps {
  revenue: { totalRevenue: number }
  orders: { totalOrders: number }
  products: { totalProducts: number }
}

export function StatsGrid({ revenue, orders, products }: StatsGridProps) {
  const stats = [
    {
      label: "Total Revenue",
      value: `$${revenue.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-blue-400",
    },
    { label: "Total Orders", value: orders.totalOrders.toLocaleString(), icon: ShoppingCart, color: "text-yellow-400" },
    { label: "Total Products", value: products.totalProducts.toLocaleString(), icon: Package, color: "text-red-400" },
    {
      label: "Avg. Order Value",
      value: `$${(revenue.totalRevenue / orders.totalOrders).toFixed(2)}`,
      icon: ArrowUpRight,
      color: "text-purple-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:border-muted-foreground/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-xs text-green-400 font-medium">+12.5%</span>
          </div>
        </div>
      ))}
    </div>
  )
}
