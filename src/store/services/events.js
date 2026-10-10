import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

function toFormData(fields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "cover_image") {
      if (value instanceof File) {
        formData.append(key, value);
      }

      return;
    }

    // CreateEventsDto.images — bir nechta rasm, har biri alohida
    // "images" kaliti bilan (10 tagacha)
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

export const eventsApi = createApi({
  reducerPath: "eventsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Events"],

  endpoints: (builder) => ({
    // PUBLIC

    getEvents: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy = "",
        sortOrder = "desc",
      } = {}) => ({
        url: "/events",

        method: "GET",

        params: {
          page,
          limit,
          search,
          sortBy,
          sortOrder,
        },
      }),

      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({
                type: "Events",
                id: item.id,
              })),

              {
                type: "Events",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Events",
                id: "LIST",
              },
            ],
    }),

    getEventById: builder.query({
      query: (id) => ({
        url: `/events/${id}`,

        method: "GET",
      }),

      providesTags: (result, error, id) => [
        {
          type: "Events",
          id,
        },
      ],
    }),



    // ADMIN

    getAdminEvents: builder.query({
  query: ({
    page = 1,
    limit = 10,
    search = "",
    sortBy,
    sortOrder = "desc",
    upcoming,
  
  } = {}) => ({
    url: "/events/admin",
    method: "GET",
    params: {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      upcoming,

    },
  }),

  providesTags: (result) =>
    result?.data
      ? [
          ...result.data.map((item) => ({
            type: "Events",
            id: item.id,
          })),
          {
            type: "Events",
            id: "LIST",
          },
        ]
      : [
          {
            type: "Events",
            id: "LIST",
          },
        ],
}),

    createEvent: builder.mutation({
      query: (fields) => ({
        url: "/events",

        method: "POST",

        data: toFormData(fields),
      }),

      invalidatesTags: [
        {
          type: "Events",
          id: "LIST",
        },
      ],
    }),

    updateEvent: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `/events/${id}`,

        method: "PATCH",

        data: toFormData(fields),
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "Events",
          id,
        },

        {
          type: "Events",
          id: "LIST",
        },
      ],
    }),
   toggleEventPublic: builder.mutation({

  query: ({ id, is_public }) => ({
    url: `/events/${id}`,
    method: "PATCH",
    data: (() => {
      const formData = new FormData();

      formData.append(
        "is_public",
        is_public
      );

      return formData;
    })(),
  }),


  invalidatesTags: (result, error, { id }) => [
    {
      type: "Events",
      id,
    },
    {
      type: "Events",
      id: "LIST",
    },
  ],

}),

    // Admin uchun bitta tadbir (yashirin tadbirlar ham) — rasmlar
    // boshqaruvi shu yerdan o'qiydi
    getAdminEventById: builder.query({
      query: (id) => ({
        url: `/events/admin/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),

    // --- Rasmlar (10 tagacha) ---

    uploadEventImages: builder.mutation({
      query: ({ id, files }) => {
        const formData = new FormData();

        // UploadEventImagesDto.files
        files.filter(Boolean).forEach((file) => formData.append("files", file));

        return {
          url: `/events/${id}/images`,
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Events", id },
        { type: "Events", id: "LIST" },
      ],
    }),

    setMainEventImage: builder.mutation({
      query: ({ id, imageId }) => ({
        url: `/events/${id}/images/${imageId}/set-main`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Events", id },
        { type: "Events", id: "LIST" },
      ],
    }),

    deleteEventImage: builder.mutation({
      query: ({ id, imageId }) => ({
        url: `/events/${id}/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Events", id },
        { type: "Events", id: "LIST" },
      ],
    }),

    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/events/${id}`,

        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Events",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetAdminEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useToggleEventPublicMutation,
  useGetAdminEventByIdQuery,
  useUploadEventImagesMutation,
  useSetMainEventImageMutation,
  useDeleteEventImageMutation,
} = eventsApi;
