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

interface ErrorResponse {
  error?: {
    code?: number;
  };
  data?: any;
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include", // Essential for sending/receiving cookies
});

const baseQueryWithUnauthorizedHandler: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Initial request (browser will send cookies if available)
  let result = await baseQuery(args, api, extraOptions);

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
    const refreshResult = await baseQuery(
      {
        url: "/user/refresh-token",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Retry original request (cookies are now updated in the browser)
      result = await baseQuery(args, api, extraOptions);
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
