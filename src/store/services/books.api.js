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

/**
 * Backend kitob manbasi bo'yicha filtr qo'llab-quvvatlaydimi.
 *
 * `true` bo'lsa kitoblar sahifasi har bo'limni alohida, 20 tadan
 * so'raydi: `GET /books?source=manual|excel&page=N&limit=20`.
 * Hozir backendda bu filtr YO'Q — shuning uchun `false`.
 */
export const BOOK_SOURCE_FILTER = false;

/** Backend `limit` ni shu songa qirqadi (o'lchab tekshirilgan) */
const BACKEND_MAX_LIMIT = 100;

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
        source,
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
          source,
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

    // Filtrga mos BARCHA kitoblar — VAQTINCHALIK yechim.
    //
    // Katalog (qo'lda kiritilgan) va kartoteka (Excel importi) ni
    // backend ajratib bera olmaydi: `source` kabi filtr yo'q (tekshirildi
    // — noma'lum parametrlar jim e'tiborsiz qoldiriladi). Shuning uchun
    // hammasi olinib klientda ajratiladi. Backend `limit` ni 100 ga
    // cheklaydi, ya'ni bitta so'rovga ishonib bo'lmaydi: birinchi
    // sahifadan `meta.total` olinadi va qolganlari 100 tadan so'raladi.
    //
    // Backend `source=excel|manual` filtrini qo'shgach `BOOK_SOURCE_FILTER`
    // ni yoqing — kitoblar sahifasi 20 tadan server paginatsiyasiga o'tadi
    // va bu endpoint kerak bo'lmay qoladi.
    getAllBooks: builder.query({
      async queryFn(params = {}, _api, _extra, baseQuery) {
        const fetchPage = (page) =>
          baseQuery({
            url: "/books",
            method: "GET",
            params: { ...params, page, limit: BACKEND_MAX_LIMIT },
          });

        const first = await fetchPage(1);
        if (first.error) return { error: first.error };

        const total = first.data?.meta?.total ?? first.data?.data?.length ?? 0;
        const pages = Math.ceil(total / BACKEND_MAX_LIMIT);

        const rest = await Promise.all(
          Array.from({ length: Math.max(0, pages - 1) }, (_, i) => fetchPage(i + 2)),
        );
        const failed = rest.find((r) => r.error);
        if (failed) return { error: failed.error };

        const data = [first, ...rest].flatMap((r) => r.data?.data ?? []);
        return { data: { data, meta: { total } } };
      },
      providesTags: [{ type: "Books", id: "LIST" }],
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

    // Excel (.xlsx) dan ommaviy import. Backend faqat matnli maydonlarni
    // oladi: name_latin, name_cyril, name_ru, author_name, quantity —
    // rasm va janrsiz. Javob shakli OpenAPI da hujjatlashtirilmagan.
    importBooksExcel: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/books/import-excel",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [{ type: "Books", id: "LIST" }],
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
  useGetAllBooksQuery,
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
  useImportBooksExcelMutation,
  useRecalculateBookScoresMutation,
} = booksApi;
