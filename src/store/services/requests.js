// src/store/services/onlineRequests.api.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

export const onlineRequestsApi = createApi({
  reducerPath: "onlineRequestsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["OnlineRequests"],

  endpoints: (builder) => ({
    // =====================================================
    // 1. CREATE ONLINE REQUEST (Public)
    // POST /api/online-requests
    // =====================================================
    createOnlineRequest: builder.mutation({
      query: (body) => ({
        url: "/online-requests",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "OnlineRequests", id: "LIST" }],
    }),

    // =====================================================
    // 2. GET ALL ONLINE REQUESTS (Admin only)
    // GET /api/online-requests
    // =====================================================
    getOnlineRequests: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy = "created_at",
        sortOrder = "desc",
        type,
        status,
      } = {}) => ({
        url: "/online-requests",
        method: "GET",
        params: {
          page,
          limit,
          ...(search && { search }),
          sortBy,
          sortOrder,
          ...(type && { type }),
          ...(status && { status }),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({
                type: "OnlineRequests",
                id: item.id,
              })),
              { type: "OnlineRequests", id: "LIST" },
            ]
          : [{ type: "OnlineRequests", id: "LIST" }],
    }),

    // =====================================================
    // 3. GET ONLINE REQUEST BY ID (Admin only)
    // GET /api/online-requests/{id}
    // =====================================================
    getOnlineRequestById: builder.query({
      query: (id) => ({
        url: `/online-requests/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "OnlineRequests", id },
      ],
    }),

    // =====================================================
    // 4. UPDATE ONLINE REQUEST (Admin only)
    // PATCH /api/online-requests/{id}
    // =====================================================
    updateOnlineRequest: builder.mutation({
      query: ({ id, data }) => ({
        url: `/online-requests/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "OnlineRequests", id },
        { type: "OnlineRequests", id: "LIST" },
      ],
    }),

    // =====================================================
    // 5. DELETE ONLINE REQUEST (Admin only)
    // DELETE /api/online-requests/{id}
    // =====================================================
    deleteOnlineRequest: builder.mutation({
      query: (id) => ({
        url: `/online-requests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "OnlineRequests", id: "LIST" }],
    }),
  }),
});

// ================= EXPORT HOOKS =================
export const {
  useCreateOnlineRequestMutation,
  useGetOnlineRequestsQuery,
  useGetOnlineRequestByIdQuery,
  useUpdateOnlineRequestMutation,
  useDeleteOnlineRequestMutation,
} = onlineRequestsApi;