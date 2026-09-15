import { baseApi } from "../baseApi";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allCategory: builder.query({
      query: (sub_categories = false) => ({
        url: `/categories?sub_categories=${Boolean(sub_categories)}`,
        method: "GET",
      }),
    }),

    singleCategory: builder.query({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
    }),

    createCategory: builder.mutation({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
    }),

    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
    }),
    reorderCategory: builder.mutation({
      query: (categoryOrders) => ({
        url: "/categories/reorder",
        method: "PUT",
        body: { categoryOrders },
      }),
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
