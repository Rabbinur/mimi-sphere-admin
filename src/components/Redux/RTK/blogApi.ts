import { baseApi } from "../baseApi";

const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allBlogs: builder.query<any, { page?: number; limit?: number } | void>({
      query: (params) => {
        const { page = 1, limit = 10 } = params || {};
        return {
          url: `/blogs?page=${page}&limit=${limit}`,
          method: "GET",
        };
      },
      providesTags: ["blogs"],
    }),
    singleBlog: builder.query<any, string>({
      query: (slug) => ({
        url: `/blogs/${slug}`,
        method: "GET",
      }),
      providesTags: ["blogs"],
    }),
    blogById: builder.query<any, string>({
      query: (id) => ({
        url: `/blogs/id/${id}`,
        method: "GET",
      }),
      providesTags: ["blogs"],
    }),
    adminBlogs: builder.query<any, { page?: number; limit?: number } | void>({
      query: (params) => {
        const { page = 1, limit = 10 } = params || {};
        return {
          url: `/blogs/admin?page=${page}&limit=${limit}`,
          method: "GET",
        };
      },
      providesTags: ["blogs"],
    }),
    updateBlog: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["blogs"],
    }),
    deleteBlog: builder.mutation<any, string>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["blogs"],
    }),
    createBlog: builder.mutation<any, any>({
      query: (data) => ({
        url: "/blogs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["blogs"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAllBlogsQuery,
  useSingleBlogQuery,
  useBlogByIdQuery,
  useCreateBlogMutation,
  useAdminBlogsQuery,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
