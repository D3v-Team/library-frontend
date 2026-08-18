// src/store/services/media.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

// ================= FORM DATA HELPER =================
const createFormData = (fields) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // cover image
    if (key === "cover_image") {
      if (value instanceof File) {
        formData.append(key, value);
      }
      return;
    }

    // item file (single)
    if (key === "file") {
      if (value instanceof File) {
        formData.append(key, value);
      }
      return;
    }

    // multiple files
    if (key === "files" && Array.isArray(value)) {
      value.forEach((file) => {
        formData.append("files", file);
      });
      return;
    }

    // array values
    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
      return;
    }

    // boolean values
    if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

export const mediaApi = createApi({
  reducerPath: "mediaApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Media", "MediaItem"],

  endpoints: (builder) => ({
    // =====================================================
    // 1. CREATE ALBUM
    // POST /api/media-albums
    // =====================================================
    createMediaAlbum: builder.mutation({
      query: (body) => ({
        url: "/media-albums",
        method: "POST",
        data: createFormData(body),
      }),
      invalidatesTags: [{ type: "Media", id: "LIST" }],
    }),

    // =====================================================
    // 2. GET ALL ALBUMS
    // GET /api/media-albums
    // =====================================================
    getMediaAlbums: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        type,
      } = {}) => ({
        url: "/media-albums",
        method: "GET",
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
          ...(type && { type }),
        },
      }),
      providesTags: (result) => [
        { type: "Media", id: "LIST" },
        ...(result?.data ?? []).map((item) => ({
          type: "Media",
          id: item.id,
        })),
      ],
    }),

    // =====================================================
    // 3. GET ONE ALBUM WITH ITEMS
    // GET /api/media-albums/{albumId}
    // =====================================================
    getMediaAlbumById: builder.query({
      query: (albumId) => ({
        url: `/media-albums/${albumId}`,
        method: "GET",
      }),
      providesTags: (result, error, albumId) => [
        { type: "Media", id: albumId },
      ],
    }),

    // =====================================================
    // 4. UPDATE ALBUM
    // PATCH /api/media-albums/{albumId}
    // =====================================================
    updateMediaAlbum: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/media-albums/${id}`,
        method: "PATCH",
        data: createFormData(body),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Media", id },
        { type: "Media", id: "LIST" },
      ],
    }),

    // =====================================================
    // 5. DELETE ALBUM
    // DELETE /api/media-albums/{albumId}
    // =====================================================
    deleteMediaAlbum: builder.mutation({
      query: (id) => ({
        url: `/media-albums/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Media", id },
        { type: "Media", id: "LIST" },
      ],
    }),

    // =====================================================
    // 6. TOGGLE PUBLIC STATUS
    // PATCH /api/media-albums/{albumId}
    // =====================================================
    toggleMediaPublic: builder.mutation({
      query: ({ id, is_public }) => ({
        url: `/media-albums/${id}`,
        method: "PATCH",
        data: { is_public },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Media", id },
        { type: "Media", id: "LIST" },
      ],
    }),

    // =====================================================
    // 7. ADD ITEM TO ALBUM
    // POST /api/media-albums/{albumId}/items
    // =====================================================
    addMediaItem: builder.mutation({
      query: ({ albumId, ...body }) => ({
        url: `/media-albums/${albumId}/items`,
        method: "POST",
        data: createFormData(body),
      }),
      invalidatesTags: (result, error, { albumId }) => [
        { type: "Media", id: albumId },
        { type: "Media", id: "LIST" },
      ],
    }),

    // =====================================================
    // 8. GET ALL ITEMS IN ALBUM
    // GET /api/media-albums/{albumId}/items
    // =====================================================
    getMediaItems: builder.query({
      query: ({ albumId, page = 1, limit = 10 }) => ({
        url: `/media-albums/${albumId}/items`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (result) => [
        { type: "MediaItem", id: "LIST" },
        ...(result?.data ?? []).map((item) => ({
          type: "MediaItem",
          id: item.id,
        })),
      ],
    }),

    // =====================================================
    // 9. DELETE ITEM
    // DELETE /api/media-albums/{albumId}/items/{itemId}
    // =====================================================
    deleteMediaItem: builder.mutation({
      query: ({ albumId, itemId }) => ({
        url: `/media-albums/${albumId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { albumId, itemId }) => [
        { type: "MediaItem", id: itemId },
        { type: "Media", id: albumId },
      ],
    }),

    // =====================================================
    // 10. UPDATE ITEM ORDER
    // PATCH /api/media-albums/{albumId}/items/{itemId}/order
    // =====================================================
    updateMediaItemOrder: builder.mutation({
      query: ({ albumId, itemId, order }) => ({
        url: `/media-albums/${albumId}/items/${itemId}/order`,
        method: "PATCH",
        data: { order },
      }),
      invalidatesTags: (result, error, { albumId, itemId }) => [
        { type: "MediaItem", id: itemId },
        { type: "Media", id: albumId },
      ],
    }),
  }),
});

// ================= EXPORT HOOKS =================
export const {
  useCreateMediaAlbumMutation,
  useGetMediaAlbumsQuery,
  useGetMediaAlbumByIdQuery,
  useUpdateMediaAlbumMutation,
  useDeleteMediaAlbumMutation,
  useToggleMediaPublicMutation,
  useAddMediaItemMutation,
  useGetMediaItemsQuery,
  useDeleteMediaItemMutation,
  useUpdateMediaItemOrderMutation,
} = mediaApi;
