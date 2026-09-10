/**
 * PESHTOQ — navigatsiyaning YAGONA manbai.
 *
 * Audit topilmasi: hozir navigatsiya uch joyda alohida yozilgan —
 * Header dagi `navigation` massivi, Header dagi `simpleLinks` va
 * Footer dagi qo'lda terilgan <li> lar. Natijada:
 *
 *   · /contact       — header va footer da izohga olingan, yetim qolgan
 *   · /media         — footer da izohda, route ning O'ZI yo'q edi
 *   · /services/faq  — footer /services/faq ga, header /faq ga boradi
 *   · /about/history — hech qayerdan havola qilinmagan
 *   · /books/new     — hech qayerdan havola qilinmagan
 *
 * Endi header ham, footer ham shu fayldan o'qiydi. Yangi sahifa
 * qo'shilganda bitta joyga yoziladi va ikkalasida ham paydo bo'ladi —
 * ya'ni havolasiz sahifa qolishi mumkin emas.
 */

/**
 * Mega-menyu guruhlari. Har guruh footer da ham shu tartibda chiqadi.
 *
 * `action` — havola emas, modal ochadi (Header o'zi ulaydi).
 */
export const NAV_GROUPS = [
  {
    id: "about",
    label: "header.about",
    items: [
      { label: "header.history", path: "/about" },
      { label: "header.management", path: "/about/management" },
      { label: "header.documents", path: "/about/documents" },
    ],
  },
  {
    id: "fond",
    label: "header.books",
    items: [
      { label: "header.books", path: "/books" },
      { label: "nav.newBooks", path: "/books?sort=new" },
      { label: "header.authors", path: "/authors" },
    ],
  },
  {
    id: "media",
    label: "nav.newsAndEvents",
    items: [
      { label: "header.news", path: "/news" },
      { label: "header.events", path: "/events" },
      { label: "nav.media", path: "/media" },
    ],
  },
  {
    id: "services",
    label: "header.services",
    items: [
      { label: "header.bookOrder", action: "bookOrder" },
      { label: "header.onlineMessage", action: "message" },
      { label: "header.faq", path: "/faq" },
      { label: "header.contact", path: "/contact" },
      { label: "header.privacy", path: "/privacy-policy" },
    ],
  },
];

/** Guruhga kirmaydigan, to'g'ridan-to'g'ri havolalar */
export const NAV_DIRECT = [{ label: "header.home", path: "/" }];

/**
 * Footer pastidagi huquqiy havolalar.
 * `/403` va `/404` ataylab kirmaydi — ular xato sahifalari.
 */
export const NAV_LEGAL = [
  { label: "footer.privacy", path: "/privacy-policy" },
  { label: "footer.documents", path: "/about/documents" },
];
