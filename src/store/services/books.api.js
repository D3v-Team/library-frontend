import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";
import $api from "../api";
import { authorsApi } from "./avtors.api";

function toUploadFormData(fileOrFiles) {
  const formData = new FormData();
  const list = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

  // Backend OpenAPI: UploadBookfilesDto.files (multipart, array of binary)
  list.filter(Boolean).forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}

/** Backend `limit` ni shu songa qirqadi (o'lchab tekshirilgan) */
const BACKEND_MAX_LIMIT = 100;

const byNewest = (a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));

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
          // Bo'sh qidiruv URL ga `search=` bo'lib tushmasin
          search: search || undefined,
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

    // Katalog — qo'lda kiritilgan kitoblar (muqova, janr bilan).
    //
    // Backendda manba bo'yicha filtr yo'q, lekin farq bor: qo'lda
    // kiritishda nashr yili MAJBURIY, Excel importida esa u bo'sh
    // (`null`). `published_date asc` bo'yicha saralanganda yilli
    // kitoblar oldinda, bo'shlari oxirida keladi (o'lchab tekshirilgan).
    // Shuning uchun birinchi bo'sh yil uchragan joyda to'xtaymiz —
    // katalog kichik, odatda bitta so'rov yetadi.
    //
    // `meta.total` — katalog soni, `meta.grandTotal` — filtrga mos
    // BARCHA kitoblar. Kartoteka soni = grandTotal - total, ya'ni u
    // uchun alohida so'rov kerak emas.
    getCatalogBooks: builder.query({
      async queryFn(params = {}, _api, _extra, baseQuery) {
        const items = new Map();
        let grandTotal = 0;

        // Himoya: backend tartibi kutilmaganda o'zgarsa ham sikl cheksiz
        // aylanmasin (20 × 100 = 2 000 ta qo'lda kiritilgan kitob)
        for (let page = 1; page <= 20; page += 1) {
          const res = await baseQuery({
            url: "/books",
            method: "GET",
            params: {
              ...params,
              page,
              limit: BACKEND_MAX_LIMIT,
              sortBy: "published_date",
              sortOrder: "asc",
            },
          });
          if (res.error) return { error: res.error };

          const list = res.data?.data ?? [];
          grandTotal = res.data?.meta?.total ?? grandTotal;

          const dated = list.filter((book) => book.published_date);
          dated.forEach((book) => items.set(book.id, book));

          // Bo'sh yil uchradi yoki sahifalar tugadi — katalog shu yerda tugaydi
          if (dated.length < list.length || !res.data?.meta?.hasNextPage) break;
        }

        // Ko'rsatish tartibi — eng yangi qo'shilgan birinchi
        const data = [...items.values()].sort(byNewest);
        return { data: { data, meta: { total: data.length, grandTotal } } };
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
      // Import har `author_name` dan muallif ham yaratadi — mualliflar
      // boshqa API bo'lagida, uning keshi ham yangilanishi kerak
      async onQueryStarted(_file, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authorsApi.util.invalidateTags([{ type: "Authors", id: "LIST" }]));
        } catch {
          // xatoni chaqiruvchi ko'rsatadi
        }
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
  useGetCatalogBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useUploadBookFileMutation,
  useDeleteBookFileMutation,
  useUploadBookImageMutation,
  useDeleteBookImageMutation,
  useSetMainBookImageMutation,
  useImportBooksExcelMutation,
  useRecalculateBookScoresMutation,
} = booksApi;
