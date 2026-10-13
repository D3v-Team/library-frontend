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
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((b) => ({ type: "Banners", id: b.id })),
              { type: "Banners", id: "LIST" },
            ]
          : [{ type: "Banners", id: "LIST" }],
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
      // Optimistik: kalit darhol almashadi. Ro'yxat haqiqiy argumentlar bilan
      // keshlangan ({page, limit, search}) — `undefined` bilan patch hech
      // narsaga tushmasdi, shuning uchun har keshlangan nusxa yangilanadi.
      async onQueryStarted({ id, is_active }, { dispatch, getState, queryFulfilled }) {
        const patches = [];
        for (const name of ["getAllBanners", "getBanners"]) {
          for (const args of bannersApi.util.selectCachedArgsForQuery(getState(), name)) {
            patches.push(
              dispatch(
                bannersApi.util.updateQueryData(name, args, (draft) => {
                  const item = draft?.data?.find((b) => b.id === id);
                  if (item) item.is_active = is_active;
                }),
              ),
            );
          }
        }
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      // LIST ham: ommaviy /banners faqat faollarni beradi — tarkibi o'zgaradi
      invalidatesTags: (result, error, { id }) => [
        { type: "Banners", id },
        { type: "Banners", id: "LIST" },
      ],
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
