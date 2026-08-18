import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

function toFormData(fields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "icon_image") {
      if (value instanceof File) {
        formData.append(key, value);
      }

      return;
    }

    formData.append(key, value);
  });

  return formData;
}

export const contactInfoApi = createApi({
  reducerPath: "contactInfoApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["ContactInfo"],

  endpoints: (builder) => ({
    // ================= CONTACT INFO =================

    getContactInfo: builder.query({
      query: () => ({
        url: "/contact/info",
        method: "GET",
      }),

      providesTags: [
        {
          type: "ContactInfo",
          id: "INFO",
        },
      ],
    }),

    updateContactInfo: builder.mutation({
      query: (body) => ({
        url: "/contact/info",

        method: "PATCH",

        data: body,
      }),

      invalidatesTags: [
        {
          type: "ContactInfo",
          id: "INFO",
        },
      ],
    }),

    // ================= SOCIAL LINKS =================

    createSocialLink: builder.mutation({
      query: (fields) => ({
        url: "/contact/info/social-links",

        method: "POST",

        data: toFormData(fields),
      }),

      invalidatesTags: [
        {
          type: "ContactInfo",
          id: "INFO",
        },
      ],
    }),

    getSocialLinkByPlatform: builder.query({
      query: (platform) => ({
        url: `/contact/info/social-links/${platform}`,

        method: "GET",
      }),

      providesTags: (result, error, platform) => [
        {
          type: "ContactInfo",
          id: platform,
        },
      ],
    }),

    updateSocialLink: builder.mutation({
      query: ({ platform, ...fields }) => ({
        url: `/contact/info/social-links/${platform}`,

        method: "PATCH",

        data: toFormData(fields),
      }),

      invalidatesTags: (result, error, { platform }) => [
        {
          type: "ContactInfo",
          id: platform,
        },

        {
          type: "ContactInfo",
          id: "INFO",
        },
      ],
    }),

    deleteSocialLink: builder.mutation({
      query: (platform) => ({
        url: `/contact/info/social-links/${platform}`,

        method: "DELETE",
      }),

      invalidatesTags: (result, error, platform) => [
        {
          type: "ContactInfo",
          id: platform,
        },

        {
          type: "ContactInfo",
          id: "INFO",
        },
      ],
    }),
  }),
});

export const {
  useGetContactInfoQuery,

  useUpdateContactInfoMutation,

  useCreateSocialLinkMutation,

  useGetSocialLinkByPlatformQuery,

  useUpdateSocialLinkMutation,

  useDeleteSocialLinkMutation,
} = contactInfoApi;
