import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

/**
 * Yangiliklar (/news) — Swagger bo'yicha.
 *
 *   Ommaviy:  GET /news (faqat chop etilganlar), GET /news/{id}
 *   Admin:    GET /news/admin (`is_public` MAJBURIY), GET /news/{id}/admin
 *   Yozish:   POST /news, PATCH /news/{id} — multipart
 *   Rasmlar:  POST /news/{id}/images (jami 10 tagacha),
 *             PATCH /news/{id}/images/{imageId}/main, DELETE …/{imageId}
 *
 * Ro'yxat parametrlari: page, limit, search, sortBy, sortOrder.
 */
function toFormData(fields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "cover_image") {
      // Faqat yangi fayl — tahrirda mavjud rasm tegilmaydi
      if (value instanceof File) formData.append(key, value);
      return;
    }

    // CreateNewsDto.images — har rasm alohida "images" kaliti bilan
    if (key === "images") {
      (Array.isArray(value) ? value : [value])
        .filter((file) => file instanceof File)
        .forEach((file) => formData.append("images", file));
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

const listTags = (result) => [
  ...(result?.data ?? []).map((n) => ({ type: "News", id: n.id })),
  { type: "News", id: "LIST" },
];

// Rasm amallari yozuvning o'zini ham, ro'yxatdagi muqovani ham yangilaydi
const itemTags = (result, error, { id }) => [
  { type: "News", id },
  { type: "News", id: "LIST" },
];

/**
 * Bosh sahifadagi blok va yangilik sahifasidagi "Boshqa yangiliklar" —
 * bir xil argument, ya'ni bitta so'rov va umumiy kesh (5 tadan joriy
 * yangilik chiqarilsa ham 4 tasi qoladi).
 */
export const HOME_NEWS_ARGS = { page: 1, limit: 5 };

export const newsApi = createApi({
  reducerPath: "newsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["News"],

  endpoints: (builder) => ({
    // --- Ommaviy ---

    getNews: builder.query({
      query: ({ page = 1, limit = 12 } = {}) => ({
        url: "/news",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: listTags,
    }),

    getNewsById: builder.query({
      query: (id) => ({
        url: `/news/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "News", id }],
    }),

    // --- Admin ---

    // `is_public` Swagger da majburiy: ro'yxat chop etilgan / yashirin
    // bo'yicha alohida olinadi
    getAdminNews: builder.query({
      query: ({ page = 1, limit = 12, search, is_public = true } = {}) => ({
        url: "/news/admin",
        method: "GET",
        params: { page, limit, search: search || undefined, is_public },
      }),
      providesTags: listTags,
    }),

    getAdminNewsById: builder.query({
      query: (id) => ({
        url: `/news/${id}/admin`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "News", id }],
    }),

    createNews: builder.mutation({
      query: (fields) => ({
        url: "/news",
        method: "POST",
        data: toFormData(fields),
      }),
      invalidatesTags: [{ type: "News", id: "LIST" }],
    }),

    updateNews: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `/news/${id}`,
        method: "PATCH",
        data: toFormData(fields),
      }),
      invalidatesTags: itemTags,
    }),

    deleteNews: builder.mutation({
      query: (id) => ({
        url: `/news/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "News", id: "LIST" }],
    }),

    // --- Rasmlar ---

    uploadNewsImages: builder.mutation({
      query: ({ id, files }) => ({
        url: `/news/${id}/images`,
        method: "POST",
        // AddNewsImagesDto.images
        data: toFormData({ images: files }),
      }),
      invalidatesTags: itemTags,
    }),

    setMainNewsImage: builder.mutation({
      query: ({ id, imageId }) => ({
        url: `/news/${id}/images/${imageId}/main`,
        method: "PATCH",
      }),
      invalidatesTags: itemTags,
    }),

    deleteNewsImage: builder.mutation({
      query: ({ id, imageId }) => ({
        url: `/news/${id}/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: itemTags,
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetNewsByIdQuery,
  useGetAdminNewsQuery,
  useGetAdminNewsByIdQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useUploadNewsImagesMutation,
  useSetMainNewsImageMutation,
  useDeleteNewsImageMutation,
} = newsApi;
