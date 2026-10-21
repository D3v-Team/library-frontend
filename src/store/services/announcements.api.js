import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

function toFormData(fields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "cover_image") {
      // Only append a real File — leave the existing image untouched on
      // update when the admin didn't pick a new one.
      if (value instanceof File) formData.append(key, value);
      return;
    }

    // CreateAnnouncementDto.images — har rasm alohida "images" kaliti bilan
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

// Rasm amallari yozuvni ham, ro'yxatdagi muqovani ham yangilaydi
const imageTags = (result, error, { id }) => [
  { type: "Announcements", id },
  { type: "Announcements", id: "LIST" },
];

export const announcementsApi = createApi({
  reducerPath: "announcementsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Announcements"],

  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy,
        sortOrder,
      } = {}) => ({
        // Ommaviy: faqat CHOP ETILGAN e'lonlar
        url: "/announcements",
        method: "GET",
        params: { page, limit, search, sortBy, sortOrder },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((a) => ({ type: "Announcements", id: a.id })),
              { type: "Announcements", id: "LIST" },
            ]
          : [{ type: "Announcements", id: "LIST" }],
    }),

    // Admin: chop etilgan va yashirin — hammasi (`is_public` ixtiyoriy,
    // yuborilmaydi)
    getAdminAnnouncements: builder.query({
      query: ({ page = 1, limit = 12, search } = {}) => ({
        url: "/announcements/admin",
        method: "GET",
        params: { page, limit, search: search || undefined },
      }),
      providesTags: (result) => [
        ...(result?.data ?? []).map((a) => ({ type: "Announcements", id: a.id })),
        { type: "Announcements", id: "LIST" },
      ],
    }),

    getAnnouncementById: builder.query({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Announcements", id }],
    }),

    createAnnouncement: builder.mutation({
      query: (fields) => ({
        url: "/announcements",
        method: "POST",
        data: toFormData(fields),
      }),
      invalidatesTags: [{ type: "Announcements", id: "LIST" }],
    }),

    updateAnnouncement: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `/announcements/${id}`,
        method: "PATCH",
        data: toFormData(fields),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Announcements", id },
        { type: "Announcements", id: "LIST" },
      ],
    }),

    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Announcements", id: "LIST" }],
    }),

    toggleAnnouncementPublish: builder.mutation({
      query: ({ id, is_public }) => ({
        url: `/announcements/${id}/toggle-publish`,
        method: "PATCH",
        data: { is_public },
      }),
      // Optimistik: kalit darhol almashadi. Ro'yxat haqiqiy argumentlar
      // bilan keshlangan — `undefined` bilan patch hech narsaga tushmasdi.
      // Saytdagi ommaviy ro'yxat ham yangilansin — teg invalidatsiyasi.
      invalidatesTags: (result, error, { id }) => [
        { type: "Announcements", id },
        { type: "Announcements", id: "LIST" },
      ],
      async onQueryStarted({ id, is_public }, { dispatch, getState, queryFulfilled }) {
        const patches = announcementsApi.util
          .selectCachedArgsForQuery(getState(), "getAdminAnnouncements")
          .map((args) =>
            dispatch(
              announcementsApi.util.updateQueryData("getAdminAnnouncements", args, (draft) => {
                const item = draft?.data?.find((a) => a.id === id);
                if (item) item.is_public = is_public;
              }),
            ),
          );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    // --- Rasmlar (jami 10 tagacha) ---

    uploadAnnouncementImages: builder.mutation({
      query: ({ id, files }) => ({
        url: `/announcements/${id}/images`,
        method: "POST",
        data: toFormData({ images: files }),
      }),
      invalidatesTags: imageTags,
    }),

    setMainAnnouncementImage: builder.mutation({
      query: ({ id, imageId }) => ({
        url: `/announcements/${id}/images/${imageId}/main`,
        method: "PATCH",
      }),
      invalidatesTags: imageTags,
    }),

    deleteAnnouncementImage: builder.mutation({
      query: ({ id, imageId }) => ({
        url: `/announcements/${id}/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: imageTags,
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetAdminAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useToggleAnnouncementPublishMutation,
  useUploadAnnouncementImagesMutation,
  useSetMainAnnouncementImageMutation,
  useDeleteAnnouncementImageMutation,
} = announcementsApi;
