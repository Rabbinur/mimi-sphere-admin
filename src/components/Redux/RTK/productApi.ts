// components/Redux/RTK/productApi.ts
import { baseApi } from "../baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // inside productApi endpoints
    createProduct: builder.mutation({
      query: ({ data }) => ({
        url: "/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["products"],
    }),

    allProducts: builder.query({
      query: ({
        searchTerm,
        page = 1,
        limit = 10,
        category,
        sort,
        brand,
        variantFilters = {},
      }) => {
        const params = new URLSearchParams();

        // only append if value exists
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (category) params.append("category", category);
        if (sort) params.append("sort", sort);
        if (brand) params.append("brand", brand);
        Object.entries(variantFilters as Record<string, string>).forEach(
          ([name, value]) => {
            if (value) params.append(`variant_${name.toLowerCase()}`, value);
          },
        );

        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return {
          url: `/products?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["products"],
    }),

    productFilters: builder.query({
      query: () => ({
        url: "/products/filters",
        method: "GET",
      }),
      providesTags: ["products"],
    }),

    adminProducts: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10, category = "" }) => ({
        url: `/products/admin?searchTerm=${encodeURIComponent(
          searchTerm,
        )}&page=${page}&limit=${limit}&category=${encodeURIComponent(
          category,
        )}`,
        method: "GET",
      }),
      providesTags: ["products"],
    }),

    singleProduct: builder.query({
      query: (slug) => ({
        url: `/products/slug/${slug}`,
        method: "GET",
      }),
      providesTags: ["products"],
    }),
    singleProductById: builder.query({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: ["products"],
    }),

    productByCategory: builder.query({
      query: ({ id, page = 1, limit = 5 }) => ({
        url: `/products/by-category/${id}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["products"],
    }),

    featuredProduct: builder.query({
      query: () => ({
        url: `products/featured?featured=top`,
        method: "GET",
      }),
      providesTags: ["products"],
    }),
    trendyProduct: builder.query({
      query: () => ({
        url: `products/trendy`,
        method: "GET",
      }),
      providesTags: ["products"],
    }),

    // delete product (admin)
    deleteProduct: builder.mutation({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["products"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["products"],
    }),

    importCjProducts: builder.mutation({
      query: (data) => ({
        url: "/products/import-cj",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["products"],
    }),
    importKcbazarProduct: builder.mutation({
      query: (data) => ({
        url: "/products/import-kcbazar",
        method: "POST",
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useAllProductsQuery,
  useAdminProductsQuery,
  useSingleProductQuery,
  useFeaturedProductQuery,
  useProductFiltersQuery,
  useProductByCategoryQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useSingleProductByIdQuery,
  useUpdateProductMutation,
  useImportCjProductsMutation,
  useImportKcbazarProductMutation,
  useTrendyProductQuery,
} = productApi;
