import { baseApi } from "../baseApi";

export interface IFinancialReportQuery {
  startDate?: string;
  endDate?: string;
  channel?: "all" | "pos" | "online";
}

export interface IProductSalesReportQuery {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  brand?: string;
  startDate?: string;
  endDate?: string;
  channel?: "all" | "pos" | "online";
}

export interface IPurchaseReportQuery {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  brand?: string;
  startDate?: string;
  endDate?: string;
}

export const reportsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProfitLossReport: builder.query<any, IFinancialReportQuery | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.startDate) q.append("startDate", params.startDate);
        if (params?.endDate) q.append("endDate", params.endDate);
        if (params?.channel) q.append("channel", params.channel);
        const qs = q.toString();
        return `/reports/profit-loss${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["order", "products"],
    }),

    getProductSalesReport: builder.query<any, IProductSalesReportQuery | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append("page", String(params.page));
        if (params?.per_page) q.append("per_page", String(params.per_page));
        if (params?.search) q.append("search", params.search);
        if (params?.category) q.append("category", params.category);
        if (params?.brand) q.append("brand", params.brand);
        if (params?.startDate) q.append("startDate", params.startDate);
        if (params?.endDate) q.append("endDate", params.endDate);
        if (params?.channel) q.append("channel", params.channel);
        const qs = q.toString();
        return `/reports/product-sales${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["order", "products"],
    }),

    getPurchaseReport: builder.query<any, IPurchaseReportQuery | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append("page", String(params.page));
        if (params?.per_page) q.append("per_page", String(params.per_page));
        if (params?.search) q.append("search", params.search);
        if (params?.category) q.append("category", params.category);
        if (params?.brand) q.append("brand", params.brand);
        if (params?.startDate) q.append("startDate", params.startDate);
        if (params?.endDate) q.append("endDate", params.endDate);
        const qs = q.toString();
        return `/reports/purchase${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["products"],
    }),
  }),
});

export const {
  useGetProfitLossReportQuery,
  useLazyGetProfitLossReportQuery,
  useGetProductSalesReportQuery,
  useLazyGetProductSalesReportQuery,
  useGetPurchaseReportQuery,
  useLazyGetPurchaseReportQuery,
} = reportsApi;
