/**
 * Backend xatosini o'zbekcha xabarga aylantiradi.
 *
 * MUAMMO. Admin panelda hamma joyda shu naqsh ishlatilgan:
 *
 *   toast.error(err?.data?.message || "Saqlashda xatolik yuz berdi");
 *
 * Ya'ni backend xabar qaytarsa — U USTUN keladi va o'zbekcha fallback
 * hech qachon ko'rinmaydi.
 *
 * Haqiqiy javoblarni o'lchab tekshirdim:
 *
 *   {"message":"Kitob topilmadi","error":"Not Found","statusCode":404}
 *   {"message":"Authorization header topilmadi!","statusCode":401}
 *   {"message":"Cannot GET /api/nosuchthing","statusCode":404}
 *
 * Ko'rinib turgani: backend xabarlarining KO'P QISMI o'zbekcha va ular
 * foydali ("Kitob topilmadi" — aniq va tushunarli). Inglizcha faqat
 * uch joydan keladi:
 *
 *   1. NestJS ning o'z standartlari — "Cannot GET /...",
 *      "Internal server error", "Unauthorized", "Forbidden resource"
 *   2. class-validator massivi — message массив bo'lib keladi va
 *      ichida "title_latin should not be empty" kabi qatorlar bo'ladi
 *   3. axios ning tarmoq xatolari — "Network Error",
 *      "timeout of 15000ms exceeded"
 *
 * Shuning uchun hammasini bloklamaymiz: SANAB O'TILGAN inglizcha
 * naqshlarni bloklaymiz, qolganini o'tkazamiz. Bu o'zbekcha
 * xabarlarni saqlaydi va inglizchani chiqarmaydi.
 */

/** Inglizcha ekani aniq bo'lgan naqshlar */
const ENGLISH_PATTERNS = [
  /^cannot (get|post|patch|put|delete)/i,
  /^internal server error/i,
  /^(unauthorized|forbidden|bad request|not found|conflict)$/i,
  /^forbidden resource/i,
  /^validation failed/i,
  /^network error/i,
  /^timeout of \d+ms/i,
  /^request failed with status code/i,
  /should not be empty/i,
  /must be a? ?(string|number|valid|boolean|array)/i,
  /^property .* should not exist/i,
];

/** HTTP holat kodi → o'zbekcha xabar */
const BY_STATUS = {
  400: "Yuborilgan ma'lumotlar to'g'ri emas. Maydonlarni tekshirib chiqing.",
  401: "Sessiya tugagan. Qaytadan tizimga kiring.",
  403: "Bu amal uchun ruxsatingiz yo'q.",
  404: "So'ralgan yozuv topilmadi.",
  409: "Bunday yozuv allaqachon mavjud.",
  413: "Fayl hajmi juda katta.",
  415: "Fayl turi qo'llab-quvvatlanmaydi.",
  422: "Ma'lumotlar to'liq emas yoki noto'g'ri.",
  429: "Juda ko'p so'rov yuborildi. Bir oz kutib qayta urinib ko'ring.",
  500: "Serverda xatolik yuz berdi. Keyinroq qayta urinib ko'ring.",
  502: "Server javob bermayapti. Keyinroq qayta urinib ko'ring.",
  503: "Xizmat vaqtincha ishlamayapti. Keyinroq qayta urinib ko'ring.",
};

const isEnglish = (text) => ENGLISH_PATTERNS.some((re) => re.test(text.trim()));

/**
 * @param {object} err       RTK Query xatosi — { status, data: { message } }
 * @param {string} fallback  Amalga xos o'zbekcha xabar
 * @returns {string}         Har doim o'zbekcha
 */
export function apiErrorMessage(err, fallback = "Xatolik yuz berdi") {
  const status = err?.status ?? err?.originalStatus;
  const raw = err?.data?.message;

  if (status === "TIMEOUT_ERROR") {
    return "Server juda uzoq javob bermadi. Birozdan so'ng qayta urinib ko'ring.";
  }

  // Tarmoq xatosi: so'rov serverga yetmagan. Axios xabari inglizcha
  // ("Network Error", "timeout of ...") — backend xabaridan OLDIN tekshiriladi
  if (status == null || status === "FETCH_ERROR") {
    return "Serverga ulanmadi. Internet aloqasini tekshirib ko'ring.";
  }

  // class-validator massivi — ichi inglizcha, holat kodiga qaytamiz
  if (Array.isArray(raw)) {
    return BY_STATUS[status] ?? fallback;
  }

  /* 401 va 403 da backend xabari HECH QACHON ko'rsatilmaydi.
     Sababi o'lchab ko'rindi: "Authorization header topilmadi!" —
     yarim o'zbekcha, yarim texnik jargon va foydalanuvchiga hech
     narsa aytmaydi. Bunday holatda kerakli yagona ma'lumot —
     "qaytadan kiring". */
  if (status === 401 || status === 403) {
    return BY_STATUS[status];
  }

  if (typeof raw === "string" && raw.trim() && !isEnglish(raw)) {
    return raw.trim();
  }

  return BY_STATUS[status] ?? fallback;
}

/** `toast.error(apiError(err, "..."))` uchun qisqartma */
export default apiErrorMessage;
