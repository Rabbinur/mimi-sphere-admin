import { baseApi } from "../baseApi";

const serverLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServerLogs: builder.query({
      query: (type: string) => ({
        url: "/server-logs",
        method: "GET",
        params: { type },
      }),
      providesTags: ["ServerLogs"],
    }),
    getBackupList: builder.query({
      query: () => ({
        url: "/server-logs/backups",
        method: "GET",
      }),
      providesTags: ["ServerLogs"],
    }),
  }),
});

export const { useGetServerLogsQuery, useGetBackupListQuery } = serverLogApi;
