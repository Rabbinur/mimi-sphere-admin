import { baseApi } from "../baseApi";

const newsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation<any, { email: string }>({
      query: (data) => ({
        url: "/newsletter",
        method: "POST",
        body: data,
      }),
    }),
    allSubscribers: builder.query<any, void>({
      query: () => ({
        url: "/newsletter",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSubscribeNewsletterMutation,
  useAllSubscribersQuery,
} = newsletterApi;
