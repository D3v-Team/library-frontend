import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

export const usersApi = createApi({
  reducerPath: "usersApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Users"],

  endpoints: (builder) => ({
    // ================= GET USERS =================

    getUsers: builder.query({
      query: ({ page = 1, limit = 10, search } = {}) => ({
        url: "/users",

        method: "GET",

        params: {
          page,

          limit,

          ...(search
            ? {
                search,
              }
            : {}),
        },
      }),

      providesTags: (result) => [
        {
          type: "Users",
          id: "LIST",
        },

        ...(result?.data ?? []).map((item) => ({
          type: "Users",

          id: item.id,
        })),
      ],
    }),

    // ================= GET USER BY ID =================

    getUserById: builder.query({
      query: (id) => ({
        url: `/users/${id}`,

        method: "GET",
      }),

      providesTags: (result, error, id) => [
        {
          type: "Users",
          id,
        },
      ],
    }),

    // ================= CREATE USER =================

    createUser: builder.mutation({
      query: (body) => ({
        url: "/users",

        method: "POST",

        data: {
          ...body,

          role: "ADMIN",
        },
      }),

      invalidatesTags: [
        {
          type: "Users",
          id: "LIST",
        },
      ],
    }),

    // ================= UPDATE USER =================

    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/${id}`,

        method: "PATCH",

        data,
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "Users",
          id,
        },

        {
          type: "Users",
          id: "LIST",
        },
      ],
    }),

    // ================= DELETE USER =================

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,

        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Users",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,

  useGetUserByIdQuery,

  useCreateUserMutation,

  useUpdateUserMutation,

  useDeleteUserMutation,
} = usersApi;
