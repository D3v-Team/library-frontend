import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

function toFormData(fields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "file") {
      // Only append a real File — leave the existing file untouched on
      // update when the admin didn't pick a new one.
      if (value instanceof File) formData.append(key, value);
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

export const documentsApi = createApi({
  reducerPath: "documentsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Documents"],

  endpoints: (builder) => ({
    // --- Public ---

    getDocuments: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy,
        sortOrder,
        category,
      } = {}) => ({
        url: "/documents",
        method: "GET",
        params: { page, limit, search: search || undefined, sortBy, sortOrder, category },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((d) => ({ type: "Documents", id: d.id })),
              { type: "Documents", id: "LIST" },
            ]
          : [{ type: "Documents", id: "LIST" }],
    }),

    // --- Admin ---

   getAdminDocuments: builder.query({
  query: ({
    page = 1,
    limit = 10,
    search = "",
    sortBy,
    sortOrder,
    category,
  } = {}) => ({
    url: "/documents/admin",
    method: "GET",
    params: {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      category,
    },
  }),

  providesTags: (result) =>
  result?.data
    ? [
        ...result.data.map((item) => ({
          type: "Documents",
          id: item.id,
        })),

        {
          type: "Documents",
          id: "LIST",
        },
      ]
    : [
        {
          type: "Documents",
          id: "LIST",
        },
      ],
}),

    createDocument: builder.mutation({
      query: (fields) => ({
        url: "/documents",
        method: "POST",
        data: toFormData(fields),
      }),
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),

    updateDocument: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `/documents/${id}`,
        method: "PATCH",
        data: toFormData(fields),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Documents", id },
        { type: "Documents", id: "LIST" },
      ],
    }),

    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),

    toggleDocumentPublic: builder.mutation({
      query: ({ id, is_public }) => ({
        url: `/documents/${id}/public`,
        method: "PATCH",
        data: { is_public },
      }),
      // Optimistik: kalit darhol almashadi. Ommaviy va admin ro'yxatlari
      // haqiqiy argumentlar bilan keshlangan ({page, limit, category...}) —
      // `undefined` bilan patch hech narsaga tushmasdi, shuning uchun har
      // keshlangan nusxa yangilanadi.
      async onQueryStarted({ id, is_public }, { dispatch, getState, queryFulfilled }) {
        const patches = [];
        for (const name of ["getDocuments", "getAdminDocuments"]) {
          for (const args of documentsApi.util.selectCachedArgsForQuery(getState(), name)) {
            patches.push(
              dispatch(
                documentsApi.util.updateQueryData(name, args, (draft) => {
                  const item = draft?.data?.find((d) => d.id === id);
                  if (item) item.is_public = is_public;
                }),
              ),
            );
          }
        }
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      // LIST ham: ommaviy ro'yxat faqat ochiq hujjatlarni ko'rsatadi
      invalidatesTags: (result, error, { id }) => [
        { type: "Documents", id },
        { type: "Documents", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetAdminDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useToggleDocumentPublicMutation,
} = documentsApi;
