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
  File,
  Award,
  Layers,
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

export const dashboardRoutes: DashboardRoute[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    label: "Products",
    icon: Package,
    children: [
      { href: "/dashboard/products", label: "All Products" },
      { href: "/dashboard/products/create", label: "Create Product" },
      { href: "/dashboard/products/inventory", label: "Stock & Inventory" },
    ],
  },
  {
    href: "/dashboard/pos",
    icon: ShoppingCart,
    label: "POS Terminal",
  },
  {
    href: "/dashboard/categories",
    icon: Tags,
    label: "Categories",
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
  {
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { href: "/dashboard/orders", label: "All Orders" },
      { href: "/dashboard/pos", label: "POS Terminal" },
      { href: "/dashboard/orders/create", label: "Create Order" },
      { href: "/dashboard/custom-orders", label: "Request Orders" },
      { href: "/dashboard/orders/checkout-recovery", label: "Checkout Recovery" },
    ],
  },

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
    href: "/dashboard/coupons",
    icon: Gift,
    label: "Coupons",
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
];
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
