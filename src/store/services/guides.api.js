import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

/**
 * Qo'llanmalar (/guides) — Swagger bo'yicha.
 *
 *   Ommaviy:  GET /guides, GET /guides/{id}
 *   Admin:    GET /guides/admin/all, GET /guides/admin/{id}
 *   Yozish:   POST /guides, PATCH /guides/{id} — multipart, `file` faqat PDF
 *             (CreateGuideDto: name_* uchala tilda va file majburiy)
 *   O'chirish: DELETE /guides/{id}
 *
 * Ro'yxat parametrlari: page, limit, search, sortBy, sortOrder.
 */
function toFormData(fields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "file") {
      // Faqat yangi fayl — tahrirda mavjud PDF tegilmaydi
      if (value instanceof File) formData.append(key, value);
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

const listTags = (result) => [
  ...(result?.data ?? []).map((g) => ({ type: "Guides", id: g.id })),
  { type: "Guides", id: "LIST" },
];

export const guidesApi = createApi({
  reducerPath: "guidesApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Guides"],

  endpoints: (builder) => ({
    getGuides: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: "/guides",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: listTags,
    }),

    getAdminGuides: builder.query({
      query: ({ page = 1, limit = 20, search } = {}) => ({
        url: "/guides/admin/all",
        method: "GET",
        params: { page, limit, search: search || undefined },
      }),
      providesTags: listTags,
    }),

    createGuide: builder.mutation({
      query: (fields) => ({
        url: "/guides",
        method: "POST",
        data: toFormData(fields),
      }),
      invalidatesTags: [{ type: "Guides", id: "LIST" }],
    }),

    updateGuide: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `/guides/${id}`,
        method: "PATCH",
        data: toFormData(fields),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Guides", id },
        { type: "Guides", id: "LIST" },
      ],
    }),

    deleteGuide: builder.mutation({
      query: (id) => ({
        url: `/guides/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Guides", id: "LIST" }],
    }),
  }),
});

export const {
  useGetGuidesQuery,
  useGetAdminGuidesQuery,
  useCreateGuideMutation,
  useUpdateGuideMutation,
  useDeleteGuideMutation,
} = guidesApi;
