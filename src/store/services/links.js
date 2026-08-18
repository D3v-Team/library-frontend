import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";


export const usefulLinksApi = createApi({
  reducerPath: "usefulLinksApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["UsefulLinks"],


  endpoints: (builder) => ({


    // ================= PUBLIC =================


    getUsefulLinks: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy,
        sortOrder,
      } = {}) => ({
        url: "/useful-links",
        method: "GET",
        params: {
          page,
          limit,
          search,
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
        },
      }),


      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({
                type: "UsefulLinks",
                id: item.id,
              })),

              {
                type: "UsefulLinks",
                id: "LIST",
              },
            ]
          : [
              {
                type: "UsefulLinks",
                id: "LIST",
              },
            ],
    }),



    getUsefulLinkById: builder.query({
      query: (id) => ({
        url: `/useful-links/${id}`,
        method: "GET",
      }),


      providesTags: (result, error, id) => [
        {
          type: "UsefulLinks",
          id,
        },
      ],
    }),




    // ================= ADMIN =================


    getAllUsefulLinks: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy,
        sortOrder,
      } = {}) => ({
        url: "/useful-links/all",
        method: "GET",
        params: {
          page,
          limit,
          search,
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
        },
      }),


      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({
                type: "UsefulLinks",
                id: item.id,
              })),

              {
                type: "UsefulLinks",
                id: "LIST",
              },
            ]
          : [
              {
                type: "UsefulLinks",
                id: "LIST",
              },
            ],
    }),




    createUsefulLink: builder.mutation({
      query: (body) => ({
        url: "/useful-links",
        method: "POST",
        data: body,
      }),


      invalidatesTags: [
        {
          type: "UsefulLinks",
          id: "LIST",
        },
      ],
    }),




    updateUsefulLink: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/useful-links/${id}`,
        method: "PATCH",
        data: body,
      }),


      invalidatesTags: (result, error, { id }) => [
        {
          type: "UsefulLinks",
          id,
        },

        {
          type: "UsefulLinks",
          id: "LIST",
        },
      ],
    }),




    deleteUsefulLink: builder.mutation({
      query: (id) => ({
        url: `/useful-links/${id}`,
        method: "DELETE",
      }),


      invalidatesTags: [
        {
          type: "UsefulLinks",
          id: "LIST",
        },
      ],
    }),



  }),
});



export const {
  useGetUsefulLinksQuery,
  useGetUsefulLinkByIdQuery,
  useGetAllUsefulLinksQuery,
  
  useCreateUsefulLinkMutation,
  useUpdateUsefulLinkMutation,
  useDeleteUsefulLinkMutation,

} = usefulLinksApi;