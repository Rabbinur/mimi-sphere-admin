import { baseApi } from "../baseApi";

const googleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGoogleAnalytics: builder.query({
      query: (params) => ({
        url: "/google-analytics/analytics",
        method: "GET",
        params,
      }),
      providesTags: ["GoogleAnalytics"],
    }),
  }),
});

export const { useGetGoogleAnalyticsQuery } = googleApi;
