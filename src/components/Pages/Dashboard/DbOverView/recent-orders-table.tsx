import { TRecentOrder } from "@/types"
import { ChevronRight } from "lucide-react"
import Link from "next/link"


const statusStyles: Record<TRecentOrder['order_status'], string> = {
  delivered: "bg-green-500/10 text-green-400",
  processing: "bg-blue-500/10 text-blue-400",
  shipped: "bg-indigo-500/10 text-indigo-400",
  pending: "bg-yellow-500/10 text-yellow-400",
  canceled: "bg-red-500/10 text-red-400",
}



export function RecentOrdersTable({ orders }: { orders: TRecentOrder[] }) {
  if (!orders.length) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        No recent orders found
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="px-6 py-4 font-medium">Order ID</th>
            <th className="px-6 py-4 font-medium">Customer</th>
            <th className="px-6 py-4 font-medium">Payment</th>
            <th className="px-6 py-4 font-medium text-right">Total</th>
            <th className="px-6 py-4 font-medium text-center">Status</th>
            <th className="px-6 py-4 font-medium">Date</th>
            <th className="px-6 py-4">View</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id}
              className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
            >
              <td className="px-6 py-4 font-mono text-xs">
                {order.order_id}
              </td>

              <td className="px-6 py-4 font-medium">
                {order.customer_name}
              </td>

              <td className="px-6 py-4 text-muted-foreground">
                {order.payment_method}
              </td>

              <td className="px-6 py-4 text-right font-medium">
                ৳{order.total_price.toFixed(2)}
              </td>

              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyles[order.order_status]
                    }`}
                >
                  {order.order_status}
                </span>
              </td>

              <td className="px-6 py-4 text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </td>

              <td className="px-6 py-4 text-right">

                <Link href={`/dashboard/orders/${order._id}`}>

                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* footer */}
      <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Showing {orders.length} of {orders.length} orders
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-border rounded hover:bg-muted">
            Previous
          </button>
          <button className="px-3 py-1 border border-border rounded hover:bg-muted">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
