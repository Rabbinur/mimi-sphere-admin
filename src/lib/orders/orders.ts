// src/lib/orders.ts
export interface TOrderProduct {
  product_id: string;
  variant_id: null | string;
  title?: string;
  thumbnail: string;
  price: number;
  quantity: number;
  total_price: number;
  selected_variant_values?: SelectedVariantValues;
  product_title?: string;
  _id?: string;
}

export interface SelectedVariantValues {
  _id: string;
  name: string;
  value: string;
}

export interface TOrder {
  _id: string;
  customer_name: string;
  order_id: string;
  phone: string;
  village_or_area: string;
  upazila: string;
  district: string;
  delivery_zone?: string;
  products: TOrderProduct[];
  payment_method: string;
  payment_status: string;
  trnx_id: string;
  delivery_charge?: number;
  order_status: string;
  notes: string;
  coupon: null;
  total_price?: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  email?: string;
  post_office?: string;
  online_payment_details?: {
    provider: string;
    trx_id: string;
    proof?: string;
  };
  courier_details?: {
    consignment_id?: string;
    tracking_code?: string;
    status?: string;
    courier_name?: string;
  };
}

export const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-orange-100 text-orange-600";
    case "processing":
      return "bg-blue-100 text-blue-600";
    case "shipped":
      return "bg-indigo-100 text-indigo-600";
    case "delivered":
      return "bg-emerald-100 text-emerald-600";
    case "failed_delivery":
      return "bg-orange-100 text-orange-800";
    case "out_for_delivery":
      return "bg-sky-100 text-sky-800";
    case "returned":
      return "bg-purple-100 text-purple-600";
    case "canceled":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-500 ";
  }
};

export const formatDate = (d?: string | Date) => {
  try {
    if (!d) return "-";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleString();
  } catch {
    return String(d);
  }
};

export const currency = (n?: number) => {
  return `৳${(n || 0).toFixed(2)}`;
};
