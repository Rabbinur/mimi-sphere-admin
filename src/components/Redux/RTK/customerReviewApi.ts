import { baseApi } from "../baseApi";

export interface ICustomerReview {
  _id?: string;
  name: string;
  image?: string;
  rating: number;
  review: string;
  tag?: string;
  is_verified?: boolean;
  is_featured?: boolean;
  status: 'active' | 'inactive';
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

const customerReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCustomerReview: builder.mutation({
      query: (data: Partial<ICustomerReview>) => ({
        url: "/customer-reviews",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CustomerReview"],
    }),
    getAllCustomerReviews: builder.query<{ success: boolean; data: ICustomerReview[] }, Record<string, any>>({
      query: (arg) => ({
        url: "/customer-reviews",
        method: "GET",
        params: arg,
      }),
      providesTags: ["CustomerReview"],
    }),
    getSingleCustomerReview: builder.query<{ success: boolean; data: ICustomerReview }, string>({
      query: (id) => ({
        url: `/customer-reviews/${id}`,
        method: "GET",
      }),
      providesTags: ["CustomerReview"],
    }),
    updateCustomerReview: builder.mutation({
      query: ({ id, data }: { id: string; data: Partial<ICustomerReview> }) => ({
        url: `/customer-reviews/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["CustomerReview"],
    }),
    deleteCustomerReview: builder.mutation({
      query: (id: string) => ({
        url: `/customer-reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomerReview"],
    }),
  }),
});

export const {
  useCreateCustomerReviewMutation,
  useGetAllCustomerReviewsQuery,
  useGetSingleCustomerReviewQuery,
  useUpdateCustomerReviewMutation,
  useDeleteCustomerReviewMutation,
} = customerReviewApi;
