import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

export const genresApi = createApi({
  reducerPath: "genresApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Genres"],

  endpoints: (builder) => ({

    // GET ALL GENRES WITH PAGINATION
    getGenres: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
       
      } = {}) => ({
        url: "/genres",
        method: "GET",
        params: {
          page,
          limit,
          search,

  
        },
      }),

      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((genre) => ({
                type: "Genres",
                id: genre.id,
              })),

              {
                type: "Genres",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Genres",
                id: "LIST",
              },
            ],
    }),



    // GET GENRE BY ID
    getGenreById: builder.query({
      query: (id) => ({
        url: `/genres/${id}`,
        method: "GET",
      }),

      providesTags: (result, error, id) => [
        {
          type: "Genres",
          id,
        },
      ],
    }),



    // CREATE GENRE
    createGenre: builder.mutation({
      query: (data) => ({
        url: "/genres",
        method: "POST",
        data,
      }),

      invalidatesTags: [
        {
          type: "Genres",
          id: "LIST",
        },
      ],
    }),



    // UPDATE GENRE
    updateGenre: builder.mutation({
      query: ({
        id,
        data,
      }) => ({
        url: `/genres/${id}`,
        method: "PATCH",
        data,
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "Genres",
          id,
        },

        {
          type: "Genres",
          id: "LIST",
        },
      ],
    }),



    // DELETE GENRE
    deleteGenre: builder.mutation({
      query: (id) => ({
        url: `/genres/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Genres",
          id: "LIST",
        },
      ],
    }),


  }),
});



export const {
  useGetGenresQuery,
  useGetGenreByIdQuery,
  useCreateGenreMutation,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} = genresApi;