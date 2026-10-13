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

/* Aloqa ma'lumotlari (manzil, telefon, ijtimoiy tarmoqlar) har sahifada —
   header, footer va aloqa bloklarida — kerak, lekin juda kam o'zgaradi.
   Sayt ichida o'tishda RTK Query keshi allaqachon qayta so'ramaydi;
   bu esa sahifa YANGILANGANDA (F5, yangi tab) ham so'rov ketmasligi
   uchun: javob localStorage da 1 soat saqlanadi. Admin o'zgartirsa,
   kesh darhol tozalanadi; admin sahifasi doim serverdan o'qiydi. */
const CACHE_KEY = "kutubxona:contact-info";
const CACHE_TTL_MS = 60 * 60 * 1000;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    return Date.now() - ts < CACHE_TTL_MS ? data : null;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // xususiy rejim / to'lgan xotira — kesh shunchaki ishlamaydi
  }
}

export function clearContactInfoCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // e'tiborsiz
  }
}

/* Mutatsiyalar uchun: kesh so'rov boshida ham, muvaffaqiyatdan keyin ham
   tozalanadi — teglar invalidatsiyasi qayta so'raganda eski nusxa o'qilmasin */
async function dropCacheAround(_arg, { queryFulfilled }) {
  clearContactInfoCache();
  try {
    await queryFulfilled;
    clearContactInfoCache();
  } catch {
    // xato bo'lsa — kesh baribir bo'sh, keyingi o'qish serverdan
  }
}

export const contactInfoApi = createApi({
  reducerPath: "contactInfoApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["ContactInfo"],

  endpoints: (builder) => ({
    // ================= CONTACT INFO =================

    // Argumentsiz — sayt (localStorage kesh bilan); { fresh: true } — admin
    getContactInfo: builder.query({
      async queryFn(arg, _api, _extra, baseQuery) {
        if (!arg?.fresh) {
          const cached = readCache();
          if (cached) return { data: cached };
        }

        const res = await baseQuery({ url: "/contact/info", method: "GET" });
        if (res.error) return { error: res.error };

        writeCache(res.data);
        return { data: res.data };
      },

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

      onQueryStarted: dropCacheAround,

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

      onQueryStarted: dropCacheAround,

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

      onQueryStarted: dropCacheAround,

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

      onQueryStarted: dropCacheAround,

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
