import { baseApi } from "../baseApi";

const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allSuppliers: builder.query({
      query: (searchTerm = "") => ({
        url: `/suppliers?searchTerm=${searchTerm}`,
        method: "GET",
      }),
      providesTags: ["supplier"],
    }),

    singleSupplier: builder.query({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "GET",
      }),
      providesTags: ["supplier"],
    }),

    createSupplier: builder.mutation({
      query: (body) => ({
        url: "/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["supplier"],
    }),

    updateSupplier: builder.mutation({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["supplier"],
    }),

    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["supplier"],
    }),
    
    addSupplierPayment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}/payments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["supplier"],
    }),
  }),
});

export const {
  useAllSuppliersQuery,
  useSingleSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useAddSupplierPaymentMutation,
} = supplierApi;
