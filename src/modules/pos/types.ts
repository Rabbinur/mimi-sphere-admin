export interface PosProductItem {
  product_id: string;
  variant_id?: string;
  product_name: string;
  combination_label?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  image?: string;
  category_id?: string;
  has_variants?: boolean;
  variants_count?: number;
  variants?: Array<{
    variant_id: string;
    combination_label: string;
    sku?: string;
    barcode?: string;
    price: number;
    cost_price?: number;
    stock_quantity: number;
    image?: string;
  }>;
}

export interface PosCartItem {
  product_id: string;
  variant_id?: string;
  product_name: string;
  combination_label?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  quantity: number;
  total: number;
  image?: string;
}

export interface PosReceiptData {
  receipt_number: string;
  order_number: string;
  order_id?: string;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: PosCartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: string;
  tendered_amount: number;
  change_amount: number;
}
