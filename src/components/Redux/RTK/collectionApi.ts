import { baseApi } from "../baseApi";

const collectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allCollections: builder.query<any, { page?: number; limit?: number; searchTerm?: string } | void>({
      query: (params) => {
        const { page = 1, limit = 10, searchTerm = "" } = params || {};
        return {
          url: `/collections?page=${page}&limit=${limit}&searchTerm=${encodeURIComponent(searchTerm)}`,
          method: "GET",
        };
      },
      providesTags: ["collections" as any],
    }),
    singleCollection: builder.query<any, string>({
      query: (id) => ({
        url: `/collections/${id}`,
        method: "GET",
      }),
      providesTags: ["collections" as any],
    }),
    createCollection: builder.mutation<any, any>({
      query: (data) => ({
        url: "/collections",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["collections" as any],
    }),
    updateCollection: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/collections/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["collections" as any],
    }),
    deleteCollection: builder.mutation<any, string>({
      query: (id) => ({
        url: `/collections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["collections" as any],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAllCollectionsQuery,
  useSingleCollectionQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} = collectionApi;
