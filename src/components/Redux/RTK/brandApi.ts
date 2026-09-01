import { baseApi } from "../baseApi";

const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allBrands: builder.query({
      query: (params?: { page?: number; limit?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        return {
          url: `/brands${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["brands"],
    }),

    singleBrand: builder.query({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "brands", id }],
    }),

    createBrand: builder.mutation({
      query: (body) => ({
        url: "/brands/create-brand",
        method: "POST",
        body,
      }),
      invalidatesTags: ["brands"],
    }),

    updateBrand: builder.mutation({
      query: ({ id, data }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["brands"],
    }),

    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["brands"],
    }),

    updateBrandOrder: builder.mutation({
      query: (brandOrders) => ({
        url: "/brands/update-order",
        method: "POST",
        body: { brandOrders },
      }),
      invalidatesTags: ["brands"],
    }),

    syncBrands: builder.mutation({
      query: () => ({
        url: "/brands/sync-from-products",
        method: "POST",
      }),
      invalidatesTags: ["brands"],
    }),
  }),
});

export const {
  useAllBrandsQuery,
  useSingleBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useUpdateBrandOrderMutation,
  useSyncBrandsMutation,
} = brandApi;
