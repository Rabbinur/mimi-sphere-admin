import { baseApi } from "../baseApi";

const blogCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allBlogCategories: builder.query<any, void>({
      query: () => ({
        url: "/blog-categories",
        method: "GET",
      }),
      providesTags: ["blogs"],
    }),
    createBlogCategory: builder.mutation<any, any>({
      query: (data) => ({
        url: "/blog-categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["blogs"],
    }),
    deleteBlogCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/blog-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["blogs"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAllBlogCategoriesQuery,
  useCreateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} = blogCategoryApi;
