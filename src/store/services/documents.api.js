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
        params: { page, limit, search, sortBy, sortOrder, category },
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
}),

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
      // Optimistic update — the switch flips instantly instead of
      // waiting on the round trip, then rolls back on failure. Patches
      // both the public and admin list caches since either may be
      // mounted at the time.
      async onQueryStarted({ id, is_public }, { dispatch, queryFulfilled }) {
        const patches = [
          dispatch(
            documentsApi.util.updateQueryData("getDocuments", undefined, (draft) => {
              const item = draft?.data?.find((d) => d.id === id);
              if (item) item.is_public = is_public;
            }),
          ),
          dispatch(
            documentsApi.util.updateQueryData(
              "getAdminDocuments",
              undefined,
              (draft) => {
                const item = draft?.data?.find((d) => d.id === id);
                if (item) item.is_public = is_public;
              },
            ),
          ),
        ];
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: "Documents", id }],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetAdminDocumentsQuery,
  useGetAdminDocumentByIdQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useToggleDocumentPublicMutation,
} = documentsApi;
