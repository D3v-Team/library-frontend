import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

export const authorsApi = createApi({
  reducerPath: "authorsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Authors", "AuthorImages"],

  endpoints: (builder) => ({
    getAuthors: builder.query({
      query: ({ page = 1, limit = 10, search = "", sortBy, sortOrder } = {}) => ({
        url: "/authors",
        method: "GET",
        params: { page, limit, search, sortBy, sortOrder },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((a) => ({ type: "Authors", id: a.id })),
              { type: "Authors", id: "LIST" },
            ]
          : [{ type: "Authors", id: "LIST" }],
    }),

    getAuthorById: builder.query({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Authors", id }],
    }),

    createAuthor: builder.mutation({
      query: (body) => ({
        url: "/authors",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Authors", id: "LIST" }],
    }),

    updateAuthor: builder.mutation({
      query: ({ id, data }) => ({
        url: `/authors/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Authors", id },
        { type: "Authors", id: "LIST" },
      ],
    }),

    deleteAuthor: builder.mutation({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Authors", id: "LIST" }],
    }),

    // --- Images ---

    getAuthorImages: builder.query({
      query: (authorId) => ({
        url: `/authors/${authorId}/images`,
        method: "GET",
      }),
      providesTags: (result, error, authorId) => [
        { type: "AuthorImages", id: authorId },
      ],
    }),

    uploadAuthorImage: builder.mutation({
      query: ({ authorId, file }) => {
        const formData = new FormData();
        formData.append("image", file);

        return {
          url: `/authors/${authorId}/images`,
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: (result, error, { authorId }) => [
        { type: "AuthorImages", id: authorId },
      ],
    }),

    deleteAuthorImage: builder.mutation({
      query: ({ authorId, imageId }) => ({
        url: `/authors/${authorId}/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { authorId }) => [
        { type: "AuthorImages", id: authorId },
      ],
    }),

    setMainAuthorImage: builder.mutation({
      query: ({ authorId, imageId }) => ({
        url: `/authors/${authorId}/images/${imageId}/set-main`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { authorId }) => [
        { type: "AuthorImages", id: authorId },
      ],
    }),
  }),
});

export const {
  useGetAuthorsQuery,
  useGetAuthorByIdQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
  useGetAuthorImagesQuery,
  useUploadAuthorImageMutation,
  useDeleteAuthorImageMutation,
  useSetMainAuthorImageMutation,
} = authorsApi;
