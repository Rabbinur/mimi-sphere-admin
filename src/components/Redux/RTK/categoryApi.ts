import { baseApi } from "../baseApi";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allCategory: builder.query({
      query: (sub_categories = false) => ({
        url: `/categories?sub_categories=${Boolean(sub_categories)}`,
        method: "GET",
      }),
      providesTags: ["category"],
    }),

    singleCategory: builder.query({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      providesTags: ["category"],
    }),

    createCategory: builder.mutation({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["category"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["category"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["category"],
    }),
    reorderCategory: builder.mutation({
      query: (categoryOrders) => ({
        url: "/categories/reorder",
        method: "PATCH",
        body: { categories: categoryOrders, categoryOrders },
      }),
      invalidatesTags: ["category"],
    }),
  }),
});

export const {
  useAllCategoryQuery,
  useSingleCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoryMutation,
} = categoryApi;
