import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Tags,
  Warehouse,
  FileText,
  Truck,
  Star,
  Gift,
  Bell,
  Award,
  Layers,
  ShoppingBag,
  Ticket,
  Percent,
  Receipt,
  RotateCcw,
  FileQuestion,
  Clock,
} from "lucide-react";

import { LucideIcon } from "lucide-react";

export type DashboardRoute = {
  href?: string;
  icon: LucideIcon;
  label: string;
  children?: {
    href: string;
    label: string;
  }[];
};

export type DashboardSection = {
  sectionTitle: string;
  routes: DashboardRoute[];
};

export const dashboardSections: DashboardSection[] = [
  {
    sectionTitle: "Main",
    routes: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      {
        href: "/dashboard/pos",
        icon: ShoppingCart,
        label: "POS Terminal",
      },
    ],
  },
  {
    sectionTitle: "Inventory",
    routes: [
      {
        label: "Products",
        icon: Package,
        children: [
          { href: "/dashboard/products", label: "All Products" },
          { href: "/dashboard/products/create", label: "Create Product" },
        ],
      },
      {
        href: "/dashboard/categories",
        icon: Tags,
        label: "Category",
      },
      {
        href: "/dashboard/brands",
        icon: Award,
        label: "Brands",
      },
      {
        href: "/dashboard/collections",
        icon: Layers,
        label: "Collections",
      },
    ],
  },
  {
    sectionTitle: "Stock",
    routes: [
      {
        href: "/dashboard/products/inventory",
        icon: Warehouse,
        label: "Manage Stock",
      },
    ],
  },
  {
    sectionTitle: "Sales",
    routes: [
      {
        label: "Sales",
        icon: ShoppingCart,
        children: [
          { href: "/dashboard/orders", label: "All Orders" },
          { href: "/dashboard/orders/create", label: "Create Order" },
          { href: "/dashboard/orders/checkout-recovery", label: "Checkout Recovery" },
        ],
      },
      {
        href: "/dashboard/orders",
        icon: FileText,
        label: "Invoices",
      },
      {
        href: "/dashboard/custom-orders",
        icon: FileQuestion,
        label: "Quotation / Custom Orders",
      },
      {
        href: "/dashboard/pos",
        icon: ShoppingBag,
        label: "POS",
      },
    ],
  },
  {
    sectionTitle: "Promo",
    routes: [
      {
        href: "/dashboard/coupons",
        icon: Ticket,
        label: "Coupons",
      },
      {
        href: "/dashboard/pos/members",
        icon: Gift,
        label: "Membership & Loyalty",
      },
      {
        label: "Discount",
        icon: Percent,
        children: [
          { href: "/dashboard/promo/discount?tab=plans", label: "Discount Plan" },
          { href: "/dashboard/promo/discount", label: "Discount" },
        ],
      },
    ],
  },
  {
    sectionTitle: "Purchases",
    routes: [
      {
        href: "/dashboard/purchases",
        icon: ShoppingBag,
        label: "Purchases",
      },
      {
        href: "/dashboard/purchases/order",
        icon: FileText,
        label: "Purchase Order",
      },
      {
        href: "/dashboard/purchases/return",
        icon: RotateCcw,
        label: "Purchase Return",
      },
    ],
  },
  {
    sectionTitle: "Reports",
    routes: [
      {
        href: "/dashboard/reports/sales",
        icon: BarChart3,
        label: "Sales Report",
      },
      {
        href: "/dashboard/reports/purchase",
        icon: Clock,
        label: "Purchase report",
      },
      {
        href: "/dashboard/products/inventory",
        icon: Warehouse,
        label: "Inventory Report",
      },
      {
        href: "/dashboard/orders",
        icon: Receipt,
        label: "Invoice Report",
      },
      {
        href: "/dashboard/reports/profit-loss",
        icon: BarChart3,
        label: "Profit & Loss Report",
      },
    ],
  },
  {
    sectionTitle: "Settings & Others",
    routes: [
      {
        href: "/dashboard/customers",
        icon: Users,
        label: "Customers",
      },
      {
        href: "/dashboard/blogs",
        icon: FileText,
        label: "Blogs",
      },
      {
        href: "/dashboard/reviews",
        icon: Star,
        label: "Reviews",
      },
      {
        label: "Marketing",
        icon: Bell,
        children: [
          { href: "/dashboard/campaigns", label: "Email Campaigns" },
          { href: "/dashboard/campaigns/templates", label: "Email Templates" },
        ],
      },
      {
        label: "Analytics",
        icon: BarChart3,
        children: [
          { href: "/dashboard/analytics/meta", label: "Meta Analytics" },
          { href: "/dashboard/analytics/google", label: "Google Analytics" },
        ],
      },
      {
        href: "/dashboard/courier-logistics",
        icon: Truck,
        label: "Courier Logistics",
      },
      {
        label: "Settings",
        icon: Settings,
        children: [
          { href: "/dashboard/settings", label: "Site Settings" },
          { href: "/dashboard/settings/logs", label: "Maintenance" },
          { href: "/dashboard/settings/change-password", label: "Change Password" },
        ],
      },
    ],
  },
];

// Flat list for any consumers that iterate flat array
export const dashboardRoutes: DashboardRoute[] = dashboardSections.flatMap(
  (section) => section.routes
);

export const customerDashboardRoutes = [
  {
    href: "/customer-dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/customer-dashboard/products",
    icon: Package,
    label: "Products",
  },
  {
    href: "/customer-dashboard/categories",
    icon: Tags,
    label: "Categories",
  },
  {
    href: "/customer-dashboard/orders",
    icon: ShoppingCart,
    label: "Orders",
  },
  {
    href: "/customer-dashboard/customers",
    icon: Users,
    label: "Customers",
  },
  {
    href: "/customer-dashboard/settings",
    icon: Settings,
    label: "Settings",
  },
];
