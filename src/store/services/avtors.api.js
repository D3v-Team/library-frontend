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
    // 1a. MUALLIF TANLASH RO'YXATI (cheksiz scroll)
    // Filtr ro'yxati ochilganda 25 tadan, oxiriga yetilganda keyingisi.
    // Mualliflar 2 000 dan ko'p, backend esa limit ni 100 ga qirqadi —
    // bitta so'rovda hammasini olib bo'lmaydi.
    // =============================================
    getAuthorOptions: builder.infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
          lastPage?.meta?.hasNextPage ? lastPage.meta.page + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: "/authors",
        method: "GET",
        params: {
          page: pageParam,
          limit: 25,
          search: queryArg?.search || undefined,
          sortBy: "full_name_latin",
          sortOrder: "asc",
        },
      }),
      providesTags: [{ type: "Authors", id: "LIST" }],
    }),

    // =============================================
    // 1b. PROFILLI MUALLIFLAR (qo'lda kiritilganlar)
    //
    // Excel importi har `author_name` dan faqat ismli muallif yaratadi.
    // Qo'lda kiritishda tug'ilgan sana MAJBURIY, importda esa u bo'sh —
    // `birth_date asc` da sanalilar oldinda, bo'shlari oxirida keladi
    // (o'lchab tekshirilgan). Birinchi bo'sh sanada to'xtaymiz: profilli
    // mualliflar oz, odatda bitta so'rov.
    //   meta.total      — profilli mualliflar soni
    //   meta.grandTotal — filtrga mos BARCHA mualliflar
    // =============================================
    getProfiledAuthors: builder.query({
      async queryFn({ search } = {}, _api, _extra, baseQuery) {
        const items = new Map();
        let grandTotal = 0;

        // Himoya: sikl cheksiz aylanmasin (20 × 100 = 2 000 ta profilli muallif)
        for (let page = 1; page <= 20; page += 1) {
          const res = await baseQuery({
            url: "/authors",
            method: "GET",
            params: { page, limit: 50, search, sortBy: "birth_date", sortOrder: "asc" },
          });
          if (res.error) return { error: res.error };

          const list = res.data?.data ?? [];
          grandTotal = res.data?.meta?.total ?? grandTotal;

          const dated = list.filter((a) => a.birth_date);
          dated.forEach((a) => items.set(a.id, a));

          if (dated.length < list.length || !res.data?.meta?.hasNextPage) break;
        }

        const data = [...items.values()];
        return { data: { data, meta: { total: data.length, grandTotal } } };
      },
      providesTags: [{ type: "Authors", id: "LIST" }],
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
      // Backend oddiy massiv qaytaradi ([{id, url, is_main}]), admin esa
      // `data.data` ni o'qiydi — ilgari rasmlar tahrirlash oynasida umuman
      // chiqmasdi. Ikkala shaklni ham qabul qilamiz.
      transformResponse: (res) => ({ data: Array.isArray(res) ? res : res?.data ?? [] }),
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
      // /authors va /authors/{id} ham images[] ni ichida qaytaradi —
      // kartochkalar eskicha qolmasin
      invalidatesTags: (result, error, { authorId }) => [
        { type: "AuthorImages", id: authorId },
        { type: "Authors", id: authorId },
        { type: "Authors", id: "LIST" },
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
      // /authors va /authors/{id} ham images[] ni ichida qaytaradi —
      // kartochkalar eskicha qolmasin
      invalidatesTags: (result, error, { authorId }) => [
        { type: "AuthorImages", id: authorId },
        { type: "Authors", id: authorId },
        { type: "Authors", id: "LIST" },
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
      // /authors va /authors/{id} ham images[] ni ichida qaytaradi —
      // kartochkalar eskicha qolmasin
      invalidatesTags: (result, error, { authorId }) => [
        { type: "AuthorImages", id: authorId },
        { type: "Authors", id: authorId },
        { type: "Authors", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAuthorsQuery,
  useGetProfiledAuthorsQuery,
  useGetAuthorOptionsInfiniteQuery,
  useGetAuthorByIdQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
  useGetAuthorImagesQuery,
  useUploadAuthorImagesMutation, 
  useDeleteAuthorImageMutation,
  useSetMainAuthorImageMutation,
} = authorsApi;
