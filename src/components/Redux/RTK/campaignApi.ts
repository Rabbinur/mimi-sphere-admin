import { baseApi } from "../baseApi";

const campaignApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query({
      query: () => ({
        url: "/campaigns",
        method: "GET",
      }),
      providesTags: ["Campaign"],
    }),

    getSingleCampaign: builder.query({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "GET",
      }),
      providesTags: ["Campaign"],
    }),

    getRecipientPreview: builder.query({
      query: (target) => ({
        url: `/campaigns/preview?target=${target}`,
        method: "GET",
      }),
    }),

    createCampaign: builder.mutation({
      query: (data) => ({
        url: "/campaigns",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),

    updateCampaign: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/campaigns/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),

    deleteCampaign: builder.mutation({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaign"],
    }),

    sendCampaign: builder.mutation({
      query: (id) => ({
        url: `/campaigns/${id}/send`,
        method: "POST",
      }),
      invalidatesTags: ["Campaign"],
    }),

    // --- Templates ---
    getTemplates: builder.query({
      query: () => ({
        url: "/campaigns/templates",
        method: "GET",
      }),
      providesTags: ["CampaignTemplate" as any],
    }),

    getSingleTemplate: builder.query({
      query: (id) => ({
        url: `/campaigns/templates/${id}`,
        method: "GET",
      }),
      providesTags: ["CampaignTemplate" as any],
    }),

    createTemplate: builder.mutation({
      query: (data) => ({
        url: "/campaigns/templates",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CampaignTemplate" as any],
    }),

    updateTemplate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/campaigns/templates/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["CampaignTemplate" as any],
    }),

    deleteTemplate: builder.mutation({
      query: (id) => ({
        url: `/campaigns/templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CampaignTemplate" as any],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetSingleCampaignQuery,
  useGetRecipientPreviewQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useSendCampaignMutation,
  useGetTemplatesQuery,
  useGetSingleTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = campaignApi;
