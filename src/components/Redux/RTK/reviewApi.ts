import { baseApi } from "../baseApi";

const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReview: builder.mutation({
      query: (data) => ({
        url: "/reviews",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Review", "products"],
    }),
    getAllReviews: builder.query({
      query: (arg: Record<string, any>) => ({
        url: "/reviews",
        method: "GET",
        params: arg,
      }),
      providesTags: ["Review"],
    }),
    getReviewsByProduct: builder.query({
      query: (identifier: string) => ({
        url: `/reviews/${identifier}`,
        method: "GET",
      }),
      providesTags: ["Review"],
    }),
    deleteReview: builder.mutation({
      query: (id: string) => ({
        url: `/reviews/${id}`, // I need to implement this in backend if not exists
        method: "DELETE",
      }),
      invalidatesTags: ["Review", "products"],
    }),
    updateReviewStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/reviews/${id}/status`, // I need to implement this in backend
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Review", "products"],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useGetAllReviewsQuery,
  useGetReviewsByProductQuery,
  useDeleteReviewMutation,
  useUpdateReviewStatusMutation,
} = reviewApi;
