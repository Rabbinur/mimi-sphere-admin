// components/Redux/RTK/checkoutLeadApi.ts
import { baseApi } from "../baseApi";

export const checkoutLeadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCheckoutLeads: builder.query({
      query: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
        const { page = 1, limit = 10, status = "", search = "" } = params;
        return {
          url: `/checkout-leads?page=${page}&limit=${limit}&status=${status}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["CheckoutLead" as any],
    }),
    addFollowUpLog: builder.mutation({
      query: ({ leadId, log }: { leadId: string; log: { agentName: string; action: string; remarks?: string } }) => ({
        url: `/checkout-leads/${leadId}/follow-up`,
        method: "POST",
        body: log,
      }),
      invalidatesTags: ["CheckoutLead" as any],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllCheckoutLeadsQuery,
  useAddFollowUpLogMutation,
} = checkoutLeadApi;
