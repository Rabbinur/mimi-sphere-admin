import { TOrderStatus } from "@/types";
import { baseApi } from "../baseApi";

export interface CustomOrderPayload {
  productName: string;
  productImageUrl?: string;
  productDescription?: string;
  purchaseUrl?: string;

  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

const customOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 👉 Create Custom Order
    createCustomOrder: builder.mutation<any, CustomOrderPayload>({
      query: (body) => ({
        url: "/custom-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CustomOrder"],
    }),

    // 👉 Get All Custom Orders (Admin)
    getCustomOrders: builder.query({
      query: (search) => ({
        url: "/custom-orders/admin",
        method: "GET",
        params: search ? { search } : undefined,
      }),
      providesTags: ["CustomOrder"],
    }),

    // 👉 Get Single Custom Order
    getCustomOrderById: builder.query<any, string>({
      query: (id) => ({
        url: `/custom-orders/${id}`,
        method: "GET",
      }),
      providesTags: ["CustomOrder"],
    }),

    // 👉 Update Order Status
    updateCustomOrderStatus: builder.mutation<
      any,
      { id: string; status: TOrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/custom-orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["CustomOrder"],
    }),
  }),
});

export const {
  useCreateCustomOrderMutation,
  useGetCustomOrdersQuery,
  useGetCustomOrderByIdQuery,
  useUpdateCustomOrderStatusMutation,
} = customOrderApi;

export default customOrderApi;
