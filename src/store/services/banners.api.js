import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

function toFormData(fields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "image_file") {
      if (value instanceof File) formData.append(key, value);
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

export const bannersApi = createApi({
  reducerPath: "bannersApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Banners"],

  endpoints: (builder) => ({
    getBanners: builder.query({
      query: ({ page = 1, limit = 10, search = "", sortBy, sortOrder } = {}) => ({
        url: "/banners",
        method: "GET",
        params: { page, limit, search, sortBy, sortOrder },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((b) => ({ type: "Banners", id: b.id })),
              { type: "Banners", id: "LIST" },
            ]
          : [{ type: "Banners", id: "LIST" }],
    }),

    getAllBanners: builder.query({
      query: ({ page = 1, limit = 10, search = "", sortBy, sortOrder, is_active } = {}) => ({
        url: "/banners/all",
        method: "GET",
        params: { page, limit, search, sortBy, sortOrder, is_active },
      }),
      providesTags: [{ type: "Banners", id: "LIST" }],
    }),

    createBanner: builder.mutation({
      query: (fields) => ({
        url: "/banners",
        method: "POST",
        data: toFormData(fields),
      }),
      invalidatesTags: [{ type: "Banners", id: "LIST" }],
    }),

    updateBanner: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `/banners/${id}`,
        method: "PATCH",
        data: toFormData(fields),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Banners", id },
        { type: "Banners", id: "LIST" },
      ],
    }),

    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Banners", id: "LIST" }],
    }),

    toggleBannerActive: builder.mutation({
      query: ({ id, is_active }) => ({
        url: `/banners/${id}/active`,
        method: "PATCH",
        data: { is_active },
      }),
      async onQueryStarted({ id, is_active }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          bannersApi.util.updateQueryData("getBanners", undefined, (draft) => {
            const item = draft?.data?.find((b) => b.id === id);
            if (item) item.is_active = is_active;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: "Banners", id }],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerActiveMutation,
} = bannersApi;
