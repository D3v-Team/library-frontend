import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";


export const contactMessageApi = createApi({
  reducerPath: "contactMessageApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["ContactMessages"],


  endpoints: (builder) => ({


    // ================= PUBLIC CREATE =================

    createContactMessage: builder.mutation({
      query: (body) => ({
        url: "/contact/messages",
        method: "POST",
        data: body,
      }),

      invalidatesTags: [
        {
          type: "ContactMessages",
          id: "LIST",
        },
      ],
    }),



    // ================= ADMIN LIST =================


    getContactMessages: builder.query({

      query: ({
        page = 1,
        limit = 10,
        search,
        sortBy,
        sortOrder = "desc",
        is_read,
      } = {}) => ({

        url: "/contact/messages",

        method: "GET",

        params: {
          page,
          limit,

          ...(search
            ? {
                search,
              }
            : {}),

          ...(sortBy
            ? {
                sortBy,
              }
            : {}),

          ...(sortOrder
            ? {
                sortOrder,
              }
            : {}),

          ...(typeof is_read === "boolean"
            ? {
                is_read,
              }
            : {}),
        },
      }),


      providesTags: (result) => [
        {
          type: "ContactMessages",
          id: "LIST",
        },

        ...(result?.items ?? []).map((item) => ({
          type: "ContactMessages",
          id: item.id,
        })),
      ],
    }),



    // ================= SINGLE MESSAGE =================


    getContactMessageById: builder.query({

      query: (id) => ({
        url: `/contact/messages/${id}`,
        method: "GET",
      }),

      providesTags: (result, error, id) => [
        {
          type: "ContactMessages",
          id,
        },
      ],
    }),



    // ================= DELETE =================


    deleteContactMessage: builder.mutation({

      query: (id) => ({
        url: `/contact/messages/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "ContactMessages",
          id: "LIST",
        },
      ],
    }),


  }),
});



export const {

  useCreateContactMessageMutation,

  useGetContactMessagesQuery,

  useGetContactMessageByIdQuery,

  useDeleteContactMessageMutation,

} = contactMessageApi;