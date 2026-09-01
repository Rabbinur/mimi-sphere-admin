import { baseApi } from "../baseApi";

const fileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFiles: builder.mutation({
      query: (formData: FormData) => ({
        url: `/file/upload`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["File"],
    }),

    uploadFileFromUrl: builder.mutation<
      any, // response
      { fileUrl: string } // request payload
    >({
      query: ({ fileUrl }) => ({
        url: `/file/upload-from-url`,
        method: "POST",
        body: JSON.stringify({ fileUrl }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["File"],
    }),
    getAllFiles: builder.query({
      query: ({ page, limit, search }) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return {
          url: `/file/all?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["File"],
    }),

    // Get single file by ID
    getFileById: builder.query<any, string>({
      query: (id) => ({
        url: `/file/single/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "File", id }],
    }),

    // Update file by ID
    updateFile: builder.mutation<
      any, // response
      { id: string; updateData: Partial<any> } // request payload
    >({
      query: ({ id, updateData }) => ({
        url: `/file/update/${id}`,
        method: "PUT",
        body: updateData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "File", id }],
    }),

    // Delete file by ID
    deleteFile: builder.mutation<any, string>({
      query: (id) => ({
        url: `/file/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["File"],
    }),

    deleteMultipleFiles: builder.mutation<any, string[]>({
      query: (ids) => ({
        url: `/file/delete`,
        method: "DELETE",
        body: { ids }, // sends: { ids: [...] }
      }),
      invalidatesTags: ["File"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useUploadFilesMutation,
  useGetAllFilesQuery,
  useGetFileByIdQuery,
  useUpdateFileMutation,
  useDeleteFileMutation,
  useUploadFileFromUrlMutation,
  useDeleteMultipleFilesMutation,
} = fileApi;
