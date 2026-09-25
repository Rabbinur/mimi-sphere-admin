import { baseApi } from "../baseApi";

export interface IDiscountItem {
  _id?: string;
  name: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  discount_plan: string;
  valid_from: string;
  valid_to: string;
  days: string[];
  customer_group: string;
  apply_to: "all" | "specific";
  products: any[];
  is_active: boolean;
  status?: "Active" | "Inactive" | "Expired";
  createdAt?: string;
  updatedAt?: string;
}

export interface IDiscountQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customer?: string;
}

export const discountApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllDiscounts: builder.query<
      { success: boolean; data: IDiscountItem[]; meta: any },
      IDiscountQuery | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append("page", String(params.page));
        if (params?.limit) q.append("limit", String(params.limit));
        if (params?.search) q.append("search", params.search);
        if (params?.status) q.append("status", params.status);
        if (params?.customer) q.append("customer", params.customer);
        const qs = q.toString();
        return `/discounts${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["coupons"],
    }),

    getDiscountById: builder.query<any, string>({
      query: (id) => `/discounts/${id}`,
      providesTags: ["coupons"],
    }),

    createDiscount: builder.mutation<any, Partial<IDiscountItem>>({
      query: (body) => ({
        url: "/discounts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["coupons", "products"],
    }),

    updateDiscount: builder.mutation<any, { id: string; body: Partial<IDiscountItem> }>({
      query: ({ id, body }) => ({
        url: `/discounts/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["coupons", "products"],
    }),

    deleteDiscount: builder.mutation<any, string>({
      query: (id) => ({
        url: `/discounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["coupons", "products"],
    }),

    getActiveDiscounts: builder.query<any, { productId?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.productId) q.append("productId", params.productId);
        const qs = q.toString();
        return `/discounts/active${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["coupons"],
    }),
  }),
});

export const {
  useGetAllDiscountsQuery,
  useGetDiscountByIdQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetActiveDiscountsQuery,
} = discountApi;
