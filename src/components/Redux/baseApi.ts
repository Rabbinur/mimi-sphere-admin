import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "./store";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { tagTypes } from "@/constants/tagTypes";
import { logOut, setToken } from "./Slice/authSlice";

import { getApiBaseUrl } from "@/lib/api-config";

interface ErrorResponse {
  error?: {
    code?: number;
  };
  data?: any;
}

const rawBaseQuery = (args: string | FetchArgs, api: any, extraOptions: any) => {
  const dynamicBaseQuery = fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    credentials: "include", // Essential for sending/receiving cookies
  });
  return dynamicBaseQuery(args, api, extraOptions);
};

const baseQueryWithUnauthorizedHandler: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Initial request (browser will send cookies if available)
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const errorData = result.error?.data as any;
    const isUserNotFound = errorData?.message && errorData.message.includes("User was not found");

    if (isUserNotFound) {
      api.dispatch(logOut());
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return result;
    }

    // Call refresh token endpoint (server will rotate cookies and return status)
    const refreshResult = await rawBaseQuery(
      {
        url: "/user/refresh-token",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Retry original request (cookies are now updated in the browser)
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh failed (token expired or invalid)
      api.dispatch(logOut());
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithUnauthorizedHandler,
  tagTypes: tagTypes,
  endpoints: () => ({}),
});
