import { baseApi } from "../baseApi";

export const posApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    scanBarcode: builder.mutation<any, { barcode: string }>({
      query: (data) => ({
        url: `/admin/pos/scan?barcode=${encodeURIComponent(data.barcode)}`,
        method: "GET",
      }),
    }),
    getPosProducts: builder.query<
      any,
      { search?: string; category_id?: string | number; per_page?: number; page?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.search) queryParams.append("search", params.search);
          if (params.category_id) queryParams.append("category_id", params.category_id.toString());
          if (params.per_page) queryParams.append("per_page", params.per_page.toString());
          if (params.page) queryParams.append("page", params.page.toString());
        }
        return `/admin/pos/products?${queryParams.toString()}`;
      },
      providesTags: ["products"],
    }),
    createPosOrder: builder.mutation<any, any>({
      query: (data) => ({
        url: "/admin/pos/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["products", "order"],
    }),
    getPosShiftSummary: builder.query<any, { date?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.date) q.append("date", params.date);
        const qs = q.toString();
        return `/admin/pos/shift-summary${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["order"],
    }),
    getPosTodayProfit: builder.query<any, { channel?: string; date?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params && typeof params === "object") {
          if (params.channel) q.append("channel", params.channel);
          if (params.date) q.append("date", params.date);
        }
        const qs = q.toString();
        return `/admin/pos/today-profit${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["order"],
    }),
    createPosExpense: builder.mutation<
      any,
      {
        title: string;
        amount: number;
        category?: string;
        notes?: string;
        date?: string;
      }
    >({
      query: (data) => ({
        url: "/admin/pos/expenses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["order"],
    }),
    getPosExpenses: builder.query<any, { date?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.date) q.append("date", params.date);
        const qs = q.toString();
        return `/admin/pos/expenses${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["order"],
    }),
    deletePosExpense: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/pos/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["order"],
    }),
    getLastPosReceipt: builder.query<any, void>({
      query: () => "/admin/pos/last-receipt",
      providesTags: ["order"],
    }),
    lookupCustomer: builder.query<any, string>({
      query: (phone) => `/admin/pos/customer/${encodeURIComponent(phone)}`,
      providesTags: ["order"],
    }),

    // ── Membership Management ────────────────────────────────────────
    getMembersList: builder.query<any, { search?: string; tier?: string; page?: number; per_page?: number } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params) {
          if (params.search)   q.append("search", params.search);
          if (params.tier)     q.append("tier", params.tier);
          if (params.page)     q.append("page", String(params.page));
          if (params.per_page) q.append("per_page", String(params.per_page));
        }
        return `/admin/pos/members?${q.toString()}`;
      },
      providesTags: ["order"],
    }),
    getCustomerHistory: builder.query<any, string>({
      query: (phone) => `/admin/pos/customer/${encodeURIComponent(phone)}/history`,
      providesTags: ["order"],
    }),
    getMembershipSettings: builder.query<any, void>({
      query: () => "/admin/pos/membership-settings",
      providesTags: ["order"],
    }),
    updateMembershipSettings: builder.mutation<any, { silver_threshold: number; silver_discount: number; gold_threshold: number; gold_discount: number }>({
      query: (data) => ({ url: "/admin/pos/membership-settings", method: "PUT", body: data }),
      invalidatesTags: ["order"],
    }),
    getPosOrdersList: builder.query<
      any,
      { status?: string; search?: string; page?: number; per_page?: number } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params) {
          if (params.status) q.append("status", params.status);
          if (params.search) q.append("search", params.search);
          if (params.page) q.append("page", String(params.page));
          if (params.per_page) q.append("per_page", String(params.per_page));
        }
        return `/admin/pos/orders-list?${q.toString()}`;
      },
      providesTags: ["order"],
    }),
    getPosTransactions: builder.query<
      any,
      { type?: string; search?: string; page?: number; per_page?: number } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params) {
          if (params.type) q.append("type", params.type);
          if (params.search) q.append("search", params.search);
          if (params.page) q.append("page", String(params.page));
          if (params.per_page) q.append("per_page", String(params.per_page));
        }
        return `/admin/pos/transactions?${q.toString()}`;
      },
      providesTags: ["order"],
    }),
    updatePosTransaction: builder.mutation<
      any,
      {
        id: string;
        data: {
          customer_name?: string;
          customer_phone?: string;
          payment_method?: string;
          payment_status?: string;
          order_status?: string;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/admin/pos/transactions/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["order"],
    }),
  }),
});

export const {
  useScanBarcodeMutation,
  useGetPosProductsQuery,
  useCreatePosOrderMutation,
  useGetPosShiftSummaryQuery,
  useGetLastPosReceiptQuery,
  useLazyGetLastPosReceiptQuery,
  useLookupCustomerQuery,
  useLazyLookupCustomerQuery,
  useGetMembersListQuery,
  useGetCustomerHistoryQuery,
  useGetMembershipSettingsQuery,
  useUpdateMembershipSettingsMutation,
  useGetPosOrdersListQuery,
  useGetPosTransactionsQuery,
  useUpdatePosTransactionMutation,
  useCreatePosExpenseMutation,
  useGetPosExpensesQuery,
  useDeletePosExpenseMutation,
  useGetPosTodayProfitQuery,
} = posApi;
