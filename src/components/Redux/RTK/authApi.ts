import { baseApi } from "../baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    verifyOTP: builder.mutation({
      query: (data: any) => {
        return {
          url: "/otp/verify",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["auth"],
    }),

    resendVerifyOTP: builder.mutation({
      query: (data: any) => ({
        url: "/otp/resend",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
    sendPasswordResetEmail: builder.mutation({
      query: (data: any) => ({
        url: "/user/password/email",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
    /* ================= FORGOT PASSWORD ================= */
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/user/forgot-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    /* ================= VERIFY FORGOT OTP (OPTIONAL) ================= */
    verifyForgotOtp: builder.mutation({
      query: (data) => ({
        url: "/otp/verify/forget-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    /* ================= RESET PASSWORD ================= */
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/user/reset-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/user/change-password",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/user/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    myProfile: builder.query({
      query: () => ({
        url: "/user/",
        method: "GET",
      }),
      providesTags: ["auth"],
    }),
    allUsers: builder.query({
      query: ({ page }) => ({
        url: `/user/all?page=${page}&limit=10`,
        method: "GET",
      }),
      providesTags: ["auth"],
    }),
    updateUserByAdmin: builder.mutation({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
    deleteUserByAdmin: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["auth"],
    }),
    createUserByAdmin: builder.mutation({
      query: (data) => ({
        url: "/user/create-account",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
    dbOverview: builder.query({
      query: () => ({
        url: "/user/db/overview",
        method: "GET",
      }),
    }),
    authCheck: builder.query({
      query: () => ({
        url: "/user/auth-check",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useVerifyOTPMutation,
  useResendVerifyOTPMutation,
  useSendPasswordResetEmailMutation,
  useForgotPasswordMutation,
  useVerifyForgotOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useMyProfileQuery,
  useAllUsersQuery,
  useUpdateProfileMutation,
  useDbOverviewQuery,
  useUpdateUserByAdminMutation,
  useDeleteUserByAdminMutation,
  useCreateUserByAdminMutation,
  useAuthCheckQuery,
} = authApi;
