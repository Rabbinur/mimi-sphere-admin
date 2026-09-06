import { baseApi } from "../baseApi";

export const posApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    scanBarcode: builder.mutation<any, { barcode: string }>({
      query: (data) => ({
        url: `/admin/pos/scan?barcode=${encodeURIComponent(data.barcode)}`,
        method: "GET",
      }),
    }),
    getPosProducts: builder.query<
      any,
      { search?: string; category_id?: string | number; per_page?: number; page?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.search) queryParams.append("search", params.search);
          if (params.category_id) queryParams.append("category_id", params.category_id.toString());
          if (params.per_page) queryParams.append("per_page", params.per_page.toString());
          if (params.page) queryParams.append("page", params.page.toString());
        }
        return `/admin/pos/products?${queryParams.toString()}`;
      },
      providesTags: ["products"],
    }),
    createPosOrder: builder.mutation<any, any>({
      query: (data) => ({
        url: "/admin/pos/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["products", "order"],
    }),
    getPosShiftSummary: builder.query<any, void>({
      query: () => "/admin/pos/shift-summary",
      providesTags: ["order"],
    }),
  }),
});

export const {
  useScanBarcodeMutation,
  useGetPosProductsQuery,
  useCreatePosOrderMutation,
  useGetPosShiftSummaryQuery,
} = posApi;
