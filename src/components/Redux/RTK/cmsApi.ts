import { baseApi } from "../baseApi";
import { TCMS } from "@/types";

const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCms: builder.query<{ data: TCMS }, void>({
      query: () => ({
        url: "/cms",
        method: "GET",
      }),
      providesTags: ["CMS"],
    }),
    updateCms: builder.mutation<{ data: TCMS }, Partial<TCMS>>({
      query: (data) => ({
        url: "/cms",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CMS"],
    }),
  }),
});

export const { useGetCmsQuery, useUpdateCmsMutation } = cmsApi;
