/**
 * PESHTOQ — bitta tilga oid manba.
 *
 * Backend har matnli maydonni uch nusxada qaytaradi:
 *   title_latin / title_ru / title_cyril
 *   name_latin  / name_ru  / name_cyril
 *   full_name_latin, description_latin, address_latin, location_latin, ...
 *
 * Audit topilmasi: shu tanlash mantig'i 25 faylda qo'lda qayta
 * yozilgan (`getTitleByLanguage`, `getContentByLanguage`, ...).
 * Har biri o'z fallback qoidasini o'zi ixtiro qilgan, ya'ni bir
 * sahifada bo'sh maydon "" chiqadi, boshqasida `undefined`.
 *
 * Bu yerda bitta qoida:
 *   so'ralgan til → lotin → rus → kirill → ""
 * Ya'ni tarjima kiritilmagan yozuv hech qachon bo'sh ko'rinmaydi.
 */

import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Til kodi → backend maydon qo'shimchasi */
const SUFFIX = {
  uz: "_latin",
  ru: "_ru",
  cyrl: "_cyril",
};

/** Tarjima yo'q bo'lsa shu tartibda qidiriladi */
const FALLBACK = ["_latin", "_ru", "_cyril"];

/** Til kodi → Intl locale (sana va raqam formati uchun) */
const LOCALE = {
  uz: "uz-UZ",
  ru: "ru-RU",
  cyrl: "uz-Cyrl-UZ",
};

/**
 * O'zbek oy nomlari — QO'LDA yozilgan.
 *
 * Sababi o'lchab tekshirildi: brauzerning `uz-UZ` locale ma'lumoti
 * yaroqsiz. Chrome da
 *
 *   new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "long",
 *     year: "numeric" }).format(new Date("2026-09-09"))
 *
 * "2026 M09 09" qaytaradi — ya'ni oy nomi o'rniga "M09". Xuddi shu
 * narsa `uz-Latn-UZ` da ham. Raqamlarda esa `uz-UZ` vergul qo'yadi
 * ("4,312"), o'zbek yozuvida esa bo'sh joy ishlatiladi.
 *
 * Kirill o'zbek (`uz-Cyrl-UZ`) va rus (`ru-RU`) locale lari to'g'ri
 * ishlaydi, shuning uchun ular Intl da qoladi.
 *
 * Eslatma: eski `Pages/Books/bookHelpers.js` dagi `formatBookDate`
 * hali ham buzilgan `uz-UZ` ni ishlatadi — u 5-bosqichda shu
 * hook ga o'tkaziladi.
 */
const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

/** Qisqa shakl — taqvim varag'i va oy lentasi uchun */
const UZ_MONTHS_SHORT = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avg", "sen", "okt", "noy", "dek",
];

/** Uzoq matnda o'qilishi uchun uzilmaydigan bo'sh joy */
const NBSP = "\u00A0";

/** 4312 → "4 312" (o'zbek yozuvidagi guruhlash) */
function groupDigits(n) {
  const [int, frac] = String(Math.abs(n)).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return (n < 0 ? "-" : "") + grouped + (frac ? "," + frac : "");
}

const pad2 = (n) => String(n).padStart(2, "0");

/** Yaroqsiz sana null qaytaradi — komponent qulab tushmaydi */
function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Til uchun sana va raqam formatterlari.
 *
 * Hook dan TASHQARIDA ham eksport qilinadi: util fayllar, selector lar
 * va testlar React kontekstiga kira olmaydi, lekin ular ham xuddi shu
 * qoidalar bo'yicha format qilishi kerak.
 *
 *   getFormatters("uz").formatDate("2026-09-09")  →  "9 sentabr 2026"
 */
export function getFormatters(lang) {
  return formattersFor(lang, LOCALE[lang] || LOCALE.uz);
}

function formattersFor(lang, locale) {
  const useIntl = lang === "ru";

  // Intl obyektlari qimmat — tilga bir marta yaratiladi
  const intlLong = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const intlShort = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const intlNumber = new Intl.NumberFormat(locale);

  return {
    formatDate: (value) => {
      const d = toDate(value);
      if (!d) return null;
      if (useIntl) return intlLong.format(d);
      if (lang === "cyrl") return intlLong.format(d);
      // uz — oy nomi qo'lda
      return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    },

    formatDateShort: (value) => {
      const d = toDate(value);
      if (!d) return null;
      // Kirill o'zbek locale i qisqa sanada slash beradi ("09/09/2026"),
      // uz va ru esa nuqta ishlatadi — sayt bo'ylab bir xil bo'lishi uchun
      // ru dan boshqasi qo'lda formatlanadi.
      if (useIntl) return intlShort.format(d);
      return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
    },

    formatNumber: (n) => {
      if (typeof n !== "number" || !Number.isFinite(n)) return null;
      return useIntl ? intlNumber.format(n) : groupDigits(n);
    },

    /**
     * Faqat oy nomi — taqvim varag'i va oy lentasi uchun.
     *
     * Bu ham qo'lda: `uz-UZ` da Intl oy nomini "M09" deb beradi, va
     * uning o'rniga `uz-Cyrl-UZ` ni ishlatish lotin yozuvidagi
     * sahifada kirill "СЕН" chiqarardi — aynan shu xato tadbirlar
     * bloki­da qo'lga tushdi.
     */
    formatMonth: (value, { short = false } = {}) => {
      const d = toDate(value);
      if (!d) return null;

      if (lang === "uz") {
        return (short ? UZ_MONTHS_SHORT : UZ_MONTHS)[d.getMonth()];
      }

      return new Intl.DateTimeFormat(locale, {
        month: short ? "short" : "long",
      }).format(d);
    },
  };
}

/**
 * Obyektdan tilga mos maydonni oladi.
 * Hook dan tashqarida (selector, util, test) ham ishlatish uchun eksport.
 *
 *   localizedField(book, "title", "ru")  →  book.title_ru
 */
export function localizedField(obj, base, lang) {
  if (!obj || !base) return "";

  const wanted = SUFFIX[lang] || SUFFIX.uz;
  const order = [wanted, ...FALLBACK.filter((s) => s !== wanted)];

  for (const suffix of order) {
    const value = obj[`${base}${suffix}`];
    if (value != null && String(value).trim() !== "") return value;
  }

  // Ba'zi endpointlar qo'shimchasiz "name" ham qaytaradi (masalan janrlar)
  const plain = obj[base];
  return plain != null && String(plain).trim() !== "" ? plain : "";
}

export function useLocalized() {
  const { i18n } = useTranslation();
  const lang = SUFFIX[i18n.language] ? i18n.language : "uz";
  const locale = LOCALE[lang];

  /** pick(obj, "title") → tilga mos sarlavha */
  const pick = useCallback(
    (obj, base) => localizedField(obj, base, lang),
    [lang],
  );

  /**
   * Obyektni bir yo'la tarjima qiladi — ro'yxatlarda qulay:
   *   items.map((it) => localize(it, ["title", "content"]))
   */
  const localize = useCallback(
    (obj, bases) => {
      if (!obj) return obj;
      const out = { ...obj };
      for (const base of bases) out[base] = localizedField(obj, base, lang);
      return out;
    },
    [lang],
  );

  const formatters = useMemo(() => formattersFor(lang, locale), [lang, locale]);

  return { lang, locale, pick, localize, ...formatters };
}
