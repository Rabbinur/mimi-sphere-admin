import { baseApi } from "../baseApi";

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyCoupon: builder.mutation({
      query: (data) => ({
        url: "/coupons/apply",
        method: "POST",
        body: data,
      }),
    }),
    getCoupons: builder.query({
      query: () => "/coupons",
      providesTags: ["coupons"],
    }),
    getCouponById: builder.query({
      query: (id) => `/coupons/${id}`,
      providesTags: (result, error, id) => [{ type: "coupons", id }],
    }),
    createCoupon: builder.mutation({
      query: (newCoupon) => ({
        url: "/coupons",
        method: "POST",
        body: newCoupon,
      }),
      invalidatesTags: ["coupons"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...updatedCoupon }) => ({
        url: `/coupons/${id}`,
        method: "PUT",
        body: updatedCoupon,
      }),
      invalidatesTags: (result, error, { id }) => [
        "coupons",
        { type: "coupons", id },
      ],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["coupons"],
    }),
  }),
});

export const {
  useApplyCouponMutation,
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
