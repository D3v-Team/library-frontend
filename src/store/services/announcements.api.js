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

    formData.append(key, value);
  });

  return formData;
}

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
        is_public,
      } = {}) => ({
        url: "/announcements",
        method: "GET",
        params: { page, limit, search, sortBy, sortOrder, is_public },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((a) => ({ type: "Announcements", id: a.id })),
              { type: "Announcements", id: "LIST" },
            ]
          : [{ type: "Announcements", id: "LIST" }],
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
      // Optimistic update — the switch flips instantly instead of
      // waiting on the round trip, then rolls back on failure.
      async onQueryStarted({ id, is_public }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          announcementsApi.util.updateQueryData(
            "getAnnouncements",
            undefined,
            (draft) => {
              const item = draft?.data?.find((a) => a.id === id);
              if (item) item.is_public = is_public;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Announcements", id },
      ],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useToggleAnnouncementPublishMutation,
} = announcementsApi;
