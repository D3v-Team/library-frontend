// src/store/services/pages.api.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

export const pagesApi = createApi({
  reducerPath: "pagesApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Pages"],

  endpoints: (builder) => ({
    // =============================================
    // 1. GET ALL PAGES
    // GET /api/pages
    // =============================================
    getPages: builder.query({
      query: () => ({
        url: "/pages",
        method: "GET",
      }),
      // Backend oddiy massiv qaytaradi (`{ data }` emas) — ilgari har
      // sahifaning tegi umuman yaratilmasdi
      providesTags: (result) => {
        const list = Array.isArray(result) ? result : result?.data ?? [];
        return [
          ...list.map((p) => ({ type: "Pages", id: p.id })),
          { type: "Pages", id: "LIST" },
        ];
      },
    }),

    // =============================================
    // 2. GET PAGE BY SLUG
    // GET /api/pages/{slug}
    // =============================================
    getPageBySlug: builder.query({
      query: (slug) => ({
        url: `/pages/${slug}`,
        method: "GET",
      }),
      // Saytdagi CMS sahifa slug bilan o'qiladi, admin esa id bilan
      // tahrirlaydi. Ilgari faqat slug tegi bor edi, updatePage esa id ni
      // invalidatsiya qilardi — tahrirdan keyin saytdagi sahifa eskicha
      // qolardi. Endi ikkalasi ham, yangi sahifa yaratilsa LIST ham.
      providesTags: (result, error, slug) => [
        { type: "Pages", id: slug },
        ...(result?.id ? [{ type: "Pages", id: result.id }] : []),
        { type: "Pages", id: "LIST" },
      ],
    }),

    // =============================================
    // 3. CREATE PAGE
    // POST /api/pages
    // =============================================
    createPage: builder.mutation({
      query: (body) => ({
        url: "/pages",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Pages", id: "LIST" }],
    }),

    // =============================================
    // 4. UPDATE PAGE
    // PATCH /api/pages/{id}
    // =============================================
    updatePage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/pages/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Pages", id },
        { type: "Pages", id: "LIST" },
      ],
    }),

    // =============================================
    // 5. DELETE PAGE
    // DELETE /api/pages/{id}
    // =============================================
    deletePage: builder.mutation({
      query: (id) => ({
        url: `/pages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Pages", id },
        { type: "Pages", id: "LIST" },
      ],
    }),
  }),
});

// =============================================
// EXPORT HOOKS
// =============================================
export const {
  useGetPagesQuery,
  useGetPageBySlugQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pagesApi;