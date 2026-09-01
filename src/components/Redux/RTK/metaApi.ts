import { baseApi } from "../baseApi";

const metaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMetaAnalytics: builder.query({
      query: (params) => ({
        url: "/meta-events/analytics",
        method: "GET",
        params,
      }),
      providesTags: ["MetaEvents"],
    }),
  }),
});

export const { useGetMetaAnalyticsQuery } = metaApi;
