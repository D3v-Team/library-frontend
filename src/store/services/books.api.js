import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";
import $api from "../api";

function toUploadFormData(fileOrFiles) {
  const formData = new FormData();
  const list = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

  // Backend OpenAPI: UploadBookfilesDto.files (multipart, array of binary)
  list.filter(Boolean).forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}

export const booksApi = createApi({
  reducerPath: "booksApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Books", "BookFiles", "BookImages"],

  endpoints: (builder) => ({
    // --- Core CRUD ---

    getBooks: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        author_id,
        genre_id,
        grade_level,
        sortBy,
        sortOrder,
      } = {}) => ({
        url: "/books",
        method: "GET",
        params: {
          page,
          limit,
          search,
          author_id,
          genre_id,
          grade_level,
          sortBy,
          sortOrder,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((b) => ({ type: "Books", id: b.id })),
              { type: "Books", id: "LIST" },
            ]
          : [{ type: "Books", id: "LIST" }],
    }),

    getBookById: builder.query({
      query: (id) => ({
        url: `/books/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "Books", id },
        { type: "BookImages", id },
        { type: "BookFiles", id },
      ],
    }),

    // Body is plain JSON metadata (no files here — see the dedicated
    // file/image endpoints below).
    createBook: builder.mutation({
      query: (data) => ({
        url: "/books",
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Books", id: "LIST" }],
    }),

    // Metadata-only update, per spec.
    updateBook: builder.mutation({
      query: ({ id, data }) => ({
        url: `/books/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Books", id },
        { type: "Books", id: "LIST" },
      ],
    }),

    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/books/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Books", id: "LIST" }],
    }),

    // --- Files (PDF/DOC/DOCX/XLS/XLSX/PPT/PPTX) ---
    // Backend has no GET /books/:id/files — files live on the book detail.

    getBookFiles: builder.query({
      query: (bookId) => ({
        url: `/books/${bookId}`,
        method: "GET",
      }),
      transformResponse: (book) => ({
        data: book?.files ?? [],
      }),
      providesTags: (result, error, bookId) => [
        { type: "BookFiles", id: bookId },
      ],
    }),

    uploadBookFile: builder.mutation({
      query: ({ bookId, file, files }) => ({
        url: `/books/${bookId}/files`,
        method: "POST",
        data: toUploadFormData(files ?? file),
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: "BookFiles", id: bookId },
        { type: "Books", id: bookId },
        { type: "Books", id: "LIST" },
      ],
    }),

    deleteBookFile: builder.mutation({
      query: ({ bookId, fileId }) => ({
        url: `/books/${bookId}/files/${fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: "BookFiles", id: bookId },
        { type: "Books", id: bookId },
        { type: "Books", id: "LIST" },
      ],
    }),

    // --- Images ---
    // Backend has no GET /books/:id/images — images live on the book detail.

    getBookImages: builder.query({
      query: (bookId) => ({
        url: `/books/${bookId}`,
        method: "GET",
      }),
      transformResponse: (book) => ({
        data: book?.images ?? [],
      }),
      providesTags: (result, error, bookId) => [
        { type: "BookImages", id: bookId },
      ],
    }),

    uploadBookImage: builder.mutation({
      query: ({ bookId, file, files }) => ({
        url: `/books/${bookId}/images`,
        method: "POST",
        data: toUploadFormData(files ?? file),
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: "BookImages", id: bookId },
        { type: "Books", id: bookId },
        { type: "Books", id: "LIST" },
      ],
    }),

    deleteBookImage: builder.mutation({
      query: ({ bookId, imageId }) => ({
        url: `/books/${bookId}/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: "BookImages", id: bookId },
        { type: "Books", id: bookId },
        { type: "Books", id: "LIST" },
      ],
    }),

    setMainBookImage: builder.mutation({
      query: ({ bookId, imageId }) => ({
        url: `/books/${bookId}/images/${imageId}/set-main`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: "BookImages", id: bookId },
        { type: "Books", id: bookId },
        { type: "Books", id: "LIST" },
      ],
    }),

    recalculateBookScores: builder.mutation({
      query: () => ({
        url: "/books/admin/recalculate-scores",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Books", id: "LIST" }],
    }),
  }),
});

// Download isn't modeled as an RTK Query endpoint on purpose — a file
// download needs a Blob response and to trigger the browser's native
// save dialog, which doesn't fit the JSON-shaped query/mutation model.
export async function downloadBookFile(bookId, fileId, fileName = "fayl") {
  const response = await $api.get(`/books/${bookId}/files/${fileId}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetBookFilesQuery,
  useUploadBookFileMutation,
  useDeleteBookFileMutation,
  useGetBookImagesQuery,
  useUploadBookImageMutation,
  useDeleteBookImageMutation,
  useSetMainBookImageMutation,
  useRecalculateBookScoresMutation,
} = booksApi;
