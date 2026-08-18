// src/store/services/avtors.api.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

export const authorsApi = createApi({
  reducerPath: "authorsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Authors", "AuthorImages"],

  endpoints: (builder) => ({
    // =============================================
    // 1. GET ALL AUTHORS
    // GET /api/authors
    // =============================================
    getAuthors: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy,
        sortOrder,
      } = {}) => ({
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

    // =============================================
    // 2. GET AUTHOR BY ID
    // GET /api/authors/{id}
    // =============================================
    getAuthorById: builder.query({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Authors", id }],
    }),

    // =============================================
    // 3. CREATE AUTHOR
    // POST /api/authors
    // =============================================
    createAuthor: builder.mutation({
      query: (body) => ({
        url: "/authors",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Authors", id: "LIST" }],
    }),

    // =============================================
    // 4. UPDATE AUTHOR
    // PATCH /api/authors/{id}
    // =============================================
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

    // =============================================
    // 5. DELETE AUTHOR
    // DELETE /api/authors/{id}
    // =============================================
    deleteAuthor: builder.mutation({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Authors", id: "LIST" }],
    }),

    // =============================================
    // 6. GET AUTHOR IMAGES
    // GET /api/authors/{id}/images
    // =============================================
    getAuthorImages: builder.query({
      query: (authorId) => ({
        url: `/authors/${authorId}/images`,
        method: "GET",
      }),
      providesTags: (result, error, authorId) => [
        { type: "AuthorImages", id: authorId },
      ],
    }),

    // =============================================
    // 7. UPLOAD AUTHOR IMAGES (Multiple files)
    // POST /api/authors/{id}/images
    // Body: files (array of binary)
    // =============================================
    uploadAuthorImages: builder.mutation({
      query: ({ authorId, files }) => {
        const formData = new FormData();
        // Backend expects "files" as an array of files
        files.forEach((file) => {
          formData.append("files", file);
        });

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

    // =============================================
    // 8. DELETE AUTHOR IMAGE
    // DELETE /api/authors/{id}/images/{imageId}
    // =============================================
    deleteAuthorImage: builder.mutation({
      query: ({ authorId, imageId }) => ({
        url: `/authors/${authorId}/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { authorId }) => [
        { type: "AuthorImages", id: authorId },
      ],
    }),

    // =============================================
    // 9. SET MAIN AUTHOR IMAGE
    // PATCH /api/authors/{id}/images/{imageId}/set-main
    // =============================================
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
  useUploadAuthorImagesMutation, 
  useDeleteAuthorImageMutation,
  useSetMainAuthorImageMutation,
} = authorsApi;
