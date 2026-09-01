import { baseApi } from "../baseApi";

export const bkashApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBkashPayment: builder.mutation({
      query: (data: { orderId: string; amount: number }) => ({
        url: "/bkash/create-payment",
        method: "POST",
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useCreateBkashPaymentMutation } = bkashApi;
