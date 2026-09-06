export interface Variant {
    id: number;
    product_id: number;
    combination_label: string;
    sku: string;
    barcode?: string;
    available_quantity: number;
    total_sale: number;
    product: {
        id: number;
        name: string;
    };
    product_image: string | null;
}

export const SORT_OPTIONS = [
    { label: "Newest First", value: "created_at", order: "desc" },
    { label: "Oldest First", value: "created_at", order: "asc" },
    { label: "Product Name (A-Z)", value: "name", order: "asc" },
    { label: "Product Name (Z-A)", value: "name", order: "desc" },
    { label: "Stock (Low to High)", value: "available_quantity", order: "asc" },
    { label: "Stock (High to Low)", value: "available_quantity", order: "desc" },
    { label: "Sales (High to Low)", value: "total_sale", order: "desc" },
];
