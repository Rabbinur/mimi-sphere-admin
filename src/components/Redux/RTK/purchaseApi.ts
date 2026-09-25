import { baseApi } from "../baseApi";

const purchaseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allPurchases: builder.query({
      query: (searchTerm = "") => ({
        url: `/purchases?searchTerm=${searchTerm}`,
        method: "GET",
      }),
      providesTags: ["purchase", "supplier", "products"],
    }),

    singlePurchase: builder.query({
      query: (id) => ({
        url: `/purchases/${id}`,
        method: "GET",
      }),
      providesTags: ["purchase"],
    }),

    createPurchase: builder.mutation({
      query: (body) => ({
        url: "/purchases",
        method: "POST",
        body,
      }),
      invalidatesTags: ["purchase", "supplier", "products"],
    }),

    updatePurchase: builder.mutation({
      query: ({ id, data }) => ({
        url: `/purchases/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["purchase", "supplier", "products"],
    }),

    deletePurchase: builder.mutation({
      query: (id) => ({
        url: `/purchases/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchase", "supplier", "products"],
    }),
  }),
});

export const {
  useAllPurchasesQuery,
  useSinglePurchaseQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
} = purchaseApi;
