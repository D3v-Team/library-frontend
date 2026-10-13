import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

/**
 * Yangiliklar (/news). Backendda to'liq modul bor edi, frontendda esa
 * unga tegishli hech narsa yo'q edi (sayt /news sahifasi e'lonlarni
 * ko'rsatadi). Bu — admin boshqaruvi uchun.
 *
 * Admin ro'yxati GET /news/admin — chop etilmaganlar ham (ommaviy
 * GET /news faqat chop etilganlarni beradi). Yozish multipart.
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

    formData.append(key, value);
  });

  return formData;
}

export const newsApi = createApi({
  reducerPath: "newsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["News"],

  endpoints: (builder) => ({
    getAdminNews: builder.query({
      query: ({ page = 1, limit = 12, search, sortBy, sortOrder = "desc" } = {}) => ({
        url: "/news/admin",
        method: "GET",
        params: { page, limit, search: search || undefined, sortBy, sortOrder },
      }),
      providesTags: (result) => [
        ...(result?.data ?? []).map((n) => ({ type: "News", id: n.id })),
        { type: "News", id: "LIST" },
      ],
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
      invalidatesTags: (result, error, { id }) => [
        { type: "News", id },
        { type: "News", id: "LIST" },
      ],
    }),

    deleteNews: builder.mutation({
      query: (id) => ({
        url: `/news/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "News", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAdminNewsQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} = newsApi;
