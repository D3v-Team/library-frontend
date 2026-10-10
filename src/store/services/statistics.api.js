import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuary/axiosBaseQuery";

/**
 * Kutubxona statistikasi — bitta yozuv (ro'yxat emas).
 *
 * GET ommaviy, PATCH faqat admin uchun va JSON qabul qiladi.
 * Backend maydonlari (UpdateStatisticsDto):
 *   total_books_copies, total_books_titles,
 *   fiction_books_copies, fiction_books_titles,
 *   specialized_books_copies, specialized_books_titles,
 *   total_readers, electronic_resources, annual_events
 */
export const statisticsApi = createApi({
  reducerPath: "statisticsApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Statistics"],

  endpoints: (builder) => ({
    getStatistics: builder.query({
      query: () => ({
        url: "/statistics",
        method: "GET",
      }),
      providesTags: ["Statistics"],
    }),

    updateStatistics: builder.mutation({
      query: (data) => ({
        url: "/statistics",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Statistics"],
    }),
  }),
});

export const { useGetStatisticsQuery, useUpdateStatisticsMutation } = statisticsApi;
