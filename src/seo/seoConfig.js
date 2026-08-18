// src/seo/seoConfig.js
//
// Markazlashtirilgan SEO konfiguratsiyasi.
// Har bir public sahifa uchun title / description / keywords / OG rasm
// shu yerda saqlanadi — komponentlar ichida SEO matnlarini qidirib
// yurishning hojati yo'q.

export const SITE_NAME = "Chinoz axborot-kutubxona markazi";

export const SITE_NAME_SHORT = "Chinoz kutubxonasi";

// Sayt domeni. Production'ga chiqishda VITE_SITE_URL environment
// o'zgaruvchisi orqali almashtirilishi mumkin (.env faylida
// VITE_SITE_URL=https://sizning-domeningiz.uz deb yozing).
export const DEFAULT_SITE_URL = "https://chinozkutubxona.uz";

export const DEFAULT_LOCALE = "uz_UZ";

// Standart Open Graph / Twitter rasmi (public papkaga qo'yilishi kerak).
export const DEFAULT_OG_IMAGE = "/og-image.jpg";

export const DEFAULT_TWITTER_SITE = "@chinozkutubxona";

/**
 * Joriy sayt manzilini qaytaradi.
 * Build vaqtida VITE_SITE_URL berilgan bo'lsa o'shani, aks holda
 * runtime'dagi window.location.origin'ni, u ham bo'lmasa DEFAULT_SITE_URL'ni.
 */
export function getSiteUrl() {
  const envUrl = import.meta.env?.VITE_SITE_URL;

  if (envUrl) return envUrl.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
}

// Har bir public sahifa uchun statik SEO ma'lumotlari.
// Dinamik (detail) sahifalar uchun ma'lumotlar API javobidan
// qurib chiqiladi (qarang: src/seo/seoUtils.js).
export const SEO_CONFIG = {
  home: {
    title: "Bosh sahifa",
    description:
      "Chinoz axborot-kutubxona markazining rasmiy veb-sayti. Yangiliklar, tadbirlar, elektron kitoblar fondi, foydali havolalar va kutubxona xizmatlari haqida to'liq ma'lumot.",
    keywords: [
      "Chinoz kutubxonasi",
      "axborot-kutubxona markazi",
      "elektron kutubxona",
      "kitoblar",
      "kutubxona yangiliklari",
      "onlayn kitob",
      "Chinoz tuman kutubxonasi",
    ],
    path: "/",
  },

  news: {
    title: "Yangiliklar va e'lonlar",
    description:
      "Kutubxona faoliyati, so'nggi yangiliklar va muhim e'lonlar bilan tanishing. Chinoz axborot-kutubxona markazining rasmiy yangiliklar sahifasi.",
    keywords: [
      "kutubxona yangiliklari",
      "e'lonlar",
      "Chinoz kutubxonasi yangiliklari",
      "axborot markazi yangiliklari",
    ],
    path: "/news",
  },

  events: {
    title: "Tadbirlar",
    description:
      "Kutubxonada o'tkaziladigan tadbirlar, uchrashuvlar, taqdimotlar va madaniy-ma'rifiy chora-tadbirlar taqvimi.",
    keywords: [
      "kutubxona tadbirlari",
      "madaniy tadbirlar",
      "Chinoz kutubxonasi tadbirlari",
      "kitob taqdimoti",
    ],
    path: "/events",
  },

  books: {
    title: "Kitoblar katalogi",
    description:
      "Kutubxona fondidagi kitoblar katalogi. Muallif, janr va nashr yili bo'yicha qidiring, elektron kitoblarni yuklab oling yoki onlayn o'qing.",
    keywords: [
      "kitoblar katalogi",
      "elektron kitoblar",
      "kutubxona fondi",
      "kitob qidirish",
      "onlayn kitobxona",
    ],
    path: "/books",
  },

  bookDetail: {
    title: "Kitob",
    description: "Kutubxona fondidagi kitob haqida batafsil ma'lumot.",
    keywords: ["kitob", "elektron kitob", "kutubxona fondi"],
  },

  contact: {
    title: "Bog'lanish",
    description:
      "Chinoz axborot-kutubxona markazi bilan bog'lanish uchun manzil, telefon raqami, elektron pochta va ijtimoiy tarmoqlardagi sahifalar.",
    keywords: [
      "bog'lanish",
      "aloqa",
      "Chinoz kutubxonasi manzili",
      "kutubxona telefon raqami",
    ],
    path: "/contact",
  },

  usefulLinks: {
    title: "Foydali havolalar",
    description:
      "Davlat idoralari, ta'lim va madaniyat muassasalarining rasmiy saytlariga foydali havolalar to'plami.",
    keywords: ["foydali havolalar", "rasmiy saytlar", "davlat portallari"],
    path: "/useful-links",
  },

  documents: {
    title: "Hujjatlar",
    description:
      "Kutubxona faoliyatiga oid qonunlar, qarorlar, buyruqlar va hisobotlar bilan tanishing hamda yuklab oling.",
    keywords: [
      "hujjatlar",
      "qonunlar",
      "qarorlar",
      "buyruqlar",
      "hisobotlar",
      "me'yoriy hujjatlar",
    ],
    path: "/about/documents",
  },

  about: {
    title: "Kutubxona haqida",
    description:
      "Chinoz axborot-kutubxona markazi tarixi, tuzilmasi, rahbariyati va faoliyati haqida umumiy ma'lumot.",
    keywords: [
      "kutubxona haqida",
      "kutubxona tarixi",
      "kutubxona tuzilmasi",
      "kutubxona rahbariyati",
    ],
    path: "/about",
  },

  media: {
    title: "Media",
    description:
      "Kutubxona hayotidan fotolavhalar, videolavhalar va taqdimotlar to'plamini shu yerdan tomosha qiling.",
    keywords: ["media", "fotogalereya", "videogalereya", "taqdimotlar"],
    path: "/media",
  },
};
