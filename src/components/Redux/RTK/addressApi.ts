import { baseApi } from "../baseApi";

const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserAddresses: builder.query({
      query: () => ({
        url: "/address/my-addresses",
        method: "GET",
      }),
      providesTags: ["address"],
    }),
    createAddress: builder.mutation({
      query: (data) => ({
        url: "/address",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["address"],
    }),
    updateAddress: builder.mutation({
      query: ({ id, data }) => ({
        url: `/address/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["address"],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/address/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["address"],
    }),
  }),
});

export const {
  useGetUserAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
