import { baseApi } from "../baseApi";

export interface IFinancialReportQuery {
  startDate?: string;
  endDate?: string;
  channel?: "all" | "pos" | "online";
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
  }),
});

export const { useGetProfitLossReportQuery, useLazyGetProfitLossReportQuery } = reportsApi;
