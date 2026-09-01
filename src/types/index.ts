export interface TBadge {
  text: string;
  type: string;
}

export type TOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled"
  | "returned"
  | "failed_delivery"
  | "out_for_delivery";

export interface TShippingInfo {
  freeShipping: boolean;
  deliveryTime: string;
  shippingCost?: number;
}

export interface TAddress {
  label?: string;
  customer_name: string;
  phone: string;
  district: string;
  upazila: string;
  village_or_area: string;
  isDefault: boolean;
}

export interface TProduct {
  _id: string;

  product_title: string;
  product_description: string;
  url_handle?: string;

  thumbnail?: string;
  product_images?: string[];

  product_price: number;
  compare_at_price?: number;

  discount_percentage?: number;

  sku?: string;
  quantity: number;
  moq?: number;

  country_of_origin?: string;
  delivery_charge?: {
    inside_dhaka?: number;
    outside_dhaka?: number;
  };

  product_categories: string[] | TCategory[];

  product_vendor?: string;

  product_status?: "draft" | "active";
  is_featured?: boolean;
  is_trendy?: boolean;
  is_limited_time_offer?: boolean;
  is_free_delivery?: boolean;
  product_attributes?: {
    label: string;
    value: string;
  }[];

  product_options?: {
    option_name: string;
    option_values: string[];
  }[];

  product_variants?: {
    variant_option_values: Record<string, string>;
    variant_price: number;
    variant_quantity?: number;
    compare_at_price?: number;
    image?: string;
  }[];

  createdAt?: Date;
  updatedAt?: Date;
  category?: TCategory;
  is_pre_order?: boolean;
  pre_order_message?: string;
}

export interface TPagination {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface TCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parent_category_id: null | string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TOrder {
  _id: string;
  email: string;
  products: Product[];
  trnx_id: string;
  customer_name: string;
  phone: string;
  village_or_area: string;
  post_office: string;
  upazila: string;
  district: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface Product {
  product_id: string;
  quantity: number;
  price: number;
  total_price: number;
  _id: string;
}

/* -----------------INVOICE------------------ */

export interface InvoiceItem {
  name?: string;
  qty?: number;
  ctn?: string;
  kg?: number;
  rate?: number;
  amount?: number;
}

export interface TInvoiceData {
  _id: string;
  billNo: string;

  customerName?: string;
  address?: string;

  shipment?: string;
  shipmentNo?: string;
  reporting?: string;
  remarks?: string;

  date?: Date;

  items?: InvoiceItem[];

  totalAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
  amountInWords?: string;

  status?: "PAID" | "PARTIAL" | "DUE";

  pdfUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface TCompany {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface TSocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface TSocial {
  links: TSocialLink[];
}

export interface THeroSlide {
  image: string;
  link: string;
  alt: string;
}

export interface THeroFeature {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface TCMS {
  company: TCompany;
  social: TSocial;
  heroSliderDesktop: THeroSlide[];
  heroSliderMobile: THeroSlide[];
  heroFeatures: THeroFeature[];
}

export interface TDashboardOverview {
  orders: TOrders;
  revenue: TRevenue;
  chart: TRevenueChartItem[];
  products: TProducts;
  categories: TCategories;
  recentOrders: TRecentOrder[];
}

export interface TCategories {
  totalCategories: number;
  inactiveCategories: number;
}

export interface TOrders {
  totalOrders: number;
  status: Status;
}

export interface Status {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  canceled: number;
  returned?: number;
  failed_delivery?: number;
  out_for_delivery?: number;
}

export interface TProducts {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
}

export interface TRecentOrder {
  _id: string;
  order_id: string;
  customer_name: string;
  payment_method: string;
  order_status: string;
  total_price: number;
  createdAt: Date;
}

export interface TRevenue {
  totalRevenue: number;
}
export type TRevenueChartItem = {
  date: string;
  revenue: number;
};

export * from "./blog";
