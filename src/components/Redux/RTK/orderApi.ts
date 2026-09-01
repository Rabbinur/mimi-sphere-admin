// components/Redux/RTK/orderApi.ts
import { baseApi } from "../baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    orderNow: builder.mutation({
      query: (orderData: any) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["order"],
    }),
    createOrderAdmin: builder.mutation({
      query: (orderData: any) => ({
        url: "/orders/admin",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["order"],
    }),
    orderStatusUpdate: builder.mutation({
      query: ({ id, data }) => ({
        url: `/orders/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["order"],
    }),
    trackOrder: builder.mutation({
      query: ({ order_id, phone }) => ({
        url: "/orders/track",
        method: "POST",
        body: { order_id, phone },
      }),
      invalidatesTags: ["order"],
    }),

    myOrders: builder.query({
      query: (status?: string) => ({
        url: `/orders/my-orders${status ? `?status=${status}` : ""}`,
        method: "GET",
      }),
      providesTags: ["order"],
    }),

    singleOrders: builder.query({
      query: (id: string) => ({
        url: `orders/${id}`,
        method: "GET",
      }),
      providesTags: ["order"],
    }),

    orderById: builder.query({
      query: (order_id: string) => ({
        url: `orders/order-id/${order_id}`,
        method: "GET",
      }),
      providesTags: ["order"],
    }),
    singleOrderAdmin: builder.query({
      query: (id: string) => ({
        url: `orders/admin/${id}`,
        method: "GET",
      }),
      providesTags: ["order"],
    }),
    nextOrderId: builder.query({
      query: () => ({
        url: `orders/admin/next-order-id`,
        method: "GET",
      }),
    }),

    allOrders: builder.query({
      query: ({ search, status }: { search?: string; status?: string }) => ({
        url: `orders?search=${search || ""}${status ? `&status=${status}` : ""}`,
        method: "GET",
      }),
      providesTags: ["order"],
    }),
    sendToSteadfast: builder.mutation({
      query: (id: string) => ({
        url: `/orders/send-to-steadfast/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["order"],
    }),
    sendToCarrybee: builder.mutation({
      query: (id: string) => ({
        url: `/orders/send-to-carrybee/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["order"],
    }),
    checkFraud: builder.mutation({
      query: (phone: string) => ({
        url: `/orders/check-fraud`,
        method: "POST",
        body: { phone },
      }),
    }),
    deleteOrder: builder.mutation({
      query: (id: string) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["order"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useOrderNowMutation,
  useMyOrdersQuery,
  useSingleOrdersQuery,
  useAllOrdersQuery,
  useOrderStatusUpdateMutation,
  useSingleOrderAdminQuery,
  useNextOrderIdQuery,
  useTrackOrderMutation,
  useOrderByIdQuery,
  useCreateOrderAdminMutation,
  useSendToSteadfastMutation,
  useSendToCarrybeeMutation,
  useCheckFraudMutation,
  useDeleteOrderMutation,
} = orderApi;
