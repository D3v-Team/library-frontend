// src/seo/seoConfig.js

// Markazlashtirilgan SEO konfiguratsiyasi.
// Har bir public sahifa uchun title / description / keywords / OG rasm
// shu yerda saqlanadi.

export const SITE_NAME = "Chinoz axborot-kutubxona markazi";
export const SITE_NAME_SHORT = "Chinoz kutubxonasi";

export const DEFAULT_SITE_URL = "https://chinozkutubxona.uz";
export const DEFAULT_LOCALE = "uz_UZ";

export const DEFAULT_OG_IMAGE = "/og-image.jpg";
export const DEFAULT_TWITTER_SITE = "@chinozkutubxona";


export function getSiteUrl() {
  const envUrl = import.meta.env?.VITE_SITE_URL;

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
}


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

    openGraph: {
      title: "Kitoblar katalogi | Chinoz axborot-kutubxona markazi",
      description:
        "Kutubxona fondidagi barcha kitoblar, mualliflar va janrlar bo'yicha qidirish.",
      url: "/books",
      type: "website",
      image: "/og-image-books.jpg",
    },

    twitter: {
      card: "summary_large_image",
      title: "Kitoblar katalogi | Chinoz axborot-kutubxona markazi",
      description:
        "Kutubxona fondidagi barcha kitoblar, mualliflar va janrlar bo'yicha qidirish.",
      image: "/og-image-books.jpg",
    },
  },


  bookDetail: {
    title: "Kitob",
    description:
      "Kutubxona fondidagi kitob haqida batafsil ma'lumot.",
    keywords: [
      "kitob",
      "elektron kitob",
      "kutubxona fondi",
    ],
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

    openGraph: {
      title: "Bog'lanish | Chinoz axborot-kutubxona markazi",
      description:
        "Chinoz axborot-kutubxona markazi bilan bog'lanish ma'lumotlari.",
      url: "/contact",
      type: "website",
    },
  },


  usefulLinks: {
    title: "Foydali havolalar",
    description:
      "Davlat idoralari, ta'lim va madaniyat muassasalarining rasmiy saytlariga foydali havolalar to'plami.",
    keywords: [
      "foydali havolalar",
      "rasmiy saytlar",
      "davlat portallari",
    ],
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
    keywords: [
      "media",
      "fotogalereya",
      "videogalereya",
      "taqdimotlar",
    ],
    path: "/media",
  },


  faq: {
    title: "Ko'p so'raladigan savollar",
    description:
      "Kutubxona haqida tez-tez beriladigan savollar va ularga javoblar. Xizmatlar, kitob fondi va kutubxona faoliyati bo'yicha ma'lumot oling.",
    keywords: [
      "FAQ",
      "ko'p so'raladigan savollar",
      "kutubxona savollari",
      "Chinoz kutubxonasi",
      "xizmatlar",
      "kitob fondi",
    ],
    path: "/faq",

    openGraph: {
      title:
        "Ko'p so'raladigan savollar | Chinoz axborot-kutubxona markazi",
      description:
        "Kutubxona haqida tez-tez beriladigan savollar va ularga javoblar.",
      url: "/faq",
      type: "website",
      image: "/og-image-faq.jpg",
    },

    twitter: {
      card: "summary_large_image",
      title:
        "Ko'p so'raladigan savollar | Chinoz axborot-kutubxona markazi",
      description:
        "Kutubxona haqida tez-tez beriladigan savollar va ularga javoblar.",
      image: "/og-image-faq.jpg",
    },
  },


  privacy: {
    title: "Maxfiylik siyosati",
    description:
      "Chinoz axborot-kutubxona markazining shaxsiy ma'lumotlarni himoya qilish siyosati. Foydalanuvchi ma'lumotlari qanday to'planishi va ishlatilishi haqida.",
    keywords: [
      "maxfiylik siyosati",
      "shaxsiy ma'lumotlar",
      "ma'lumotlarni himoya qilish",
      "kutubxona maxfiyligi",
    ],
    path: "/privacy-policy",
  },


  authors: {
    title: "Mualliflar",
    description:
      "Kutubxona fondida mavjud bo'lgan barcha mualliflar ro'yxati. Mualliflar haqida biografiya va asarlari bilan tanishing.",
    keywords: [
      "mualliflar",
      "yozuvchilar",
      "kutubxona mualliflari",
      "adabiyot mualliflari",
      "Chinoz kutubxonasi",
    ],
    path: "/authors",
  },


  authorDetail: {
    title: "Muallif",
    description:
      "Kutubxona fondidagi muallif haqida batafsil ma'lumot.",
    keywords: [
      "muallif",
      "biografiya",
      "kutubxona fondi",
    ],
  },


  notFound: {
    title: "Sahifa topilmadi",
    description:
      "Siz izlagan sahifa topilmadi yoki ko'chirilgan. Chinoz axborot-kutubxona markazi bosh sahifasiga qayting.",
    path: "/404",
  },


  forbidden: {
    title: "Kirish taqiqlangan",
    description:
      "Ushbu sahifani ko'rish uchun yetarli huquq yo'q. Chinoz axborot-kutubxona markazi bosh sahifasiga qayting.",
    path: "/403",
  },


  management: {
    title: "Rahbariyat | Chinoz axborot-kutubxona markazi",
    description:
      "Kutubxona rahbariyati va mas'ul xodimlar haqida ma'lumot.",
    keywords: [
      "rahbariyat",
      "kutubxona",
      "xodimlar",
      "direktor",
    ],
    path: "/about/management",

    openGraph: {
      title:
        "Rahbariyat | Chinoz axborot-kutubxona markazi",
      description:
        "Kutubxona rahbariyati va mas'ul xodimlar haqida ma'lumot.",
      url: "/about/management",
      type: "website",
    },
  },


  login: {
    title: "Kirish",
    description:
      "Chinoz axborot-kutubxona markazi admin paneliga kirish sahifasi.",
    path: "/login",
  },

};