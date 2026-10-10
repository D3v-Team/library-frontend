import { BASE_URL } from "../../store/api";
import { getFormatters } from "../../lib/useLocalized";

/** Absolute or relative media path → usable browser URL */
export function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Cover image from book payload.
 * Prefer main_image_url; otherwise images[] where is_main === true; else first image.
 */
export function getBookCoverUrl(book) {
  if (!book) return null;

  if (book.main_image_url) {
    return resolveMediaUrl(book.main_image_url);
  }

  const images = Array.isArray(book.images) ? book.images : [];
  const main = images.find((img) => img.is_main === true) || images[0];
  if (!main) return null;

  return resolveMediaUrl(
    main.url || main.image_url || main.path || main.file_url || main.filename,
  );
}

/**
 * Kitob Excel importidan kelganmi?
 *
 * Kitob ikki yo'l bilan qo'shiladi:
 *   1. qo'lda — rasm, muallif, janr va tavsif bilan to'liq
 *   2. Excel (.xlsx) dan — faqat name_latin/cyril/ru, author_name, quantity
 *
 * Backend manbani alohida maydonda qaytarmaydi, shuning uchun belgi:
 * rasm ham, janr ham yo'q. Qo'lda kiritishda janr majburiy
 * (CreateBookDto.genreIds required), ya'ni janrsiz kitob faqat
 * importdan keladi. Agar backend keyinchalik `source`/`is_imported`
 * qaytarsa — o'sha ustun turadi.
 */
export function isExcelBook(book) {
  if (!book) return false;
  if (typeof book.is_imported === "boolean") return book.is_imported;
  if (book.source) return String(book.source).toLowerCase() === "excel";

  const noImages = !Array.isArray(book.images) || book.images.length === 0;
  const noGenres = !Array.isArray(book.genres) || book.genres.length === 0;

  return noImages && noGenres;
}

/** Excel kitobida muallif obyekti bo'lmasligi mumkin — matnli nomga tushamiz */
export function getBookAuthorName(book, pick) {
  return (book?.author && pick(book.author, "full_name")) || book?.author_name || "";
}

export function getBookGenreLabel(genreEntry) {
  if (!genreEntry) return "";
  if (genreEntry.genre) {
    return (
      genreEntry.genre.name_latin ||
      genreEntry.genre.name ||
      genreEntry.genre.name_cyril ||
      ""
    );
  }
  return genreEntry.name_latin || genreEntry.name || genreEntry.name_cyril || "";
}

export function getBookGenreNames(book) {
  return (book?.genres ?? []).map(getBookGenreLabel).filter(Boolean);
}

export function getBookGenreIds(book) {
  return (book?.genres ?? [])
    .map((g) => g.genreId || g.genre?.id || g.id)
    .filter(Boolean);
}

export function formatBookYear(publishedDate) {
  if (!publishedDate) return null;
  const date = new Date(publishedDate);
  if (Number.isNaN(date.getTime())) {
    const match = String(publishedDate).match(/\d{4}/);
    return match ? match[0] : null;
  }
  return String(date.getFullYear());
}

/**
 * Sanani o'zbekcha formatda beradi.
 *
 * Ilgari bu funksiya `toLocaleDateString("uz-UZ", { month: "long" })`
 * ishlatardi — brauzerning o'zbek locale ma'lumoti yaroqsiz bo'lgani
 * uchun natija "2026 M09 09" chiqardi (oy nomi o'rniga "M09").
 * Endi markazlashgan formatterga topshiriladi.
 *
 * `lang` berilmasa lotin o'zbekcha ishlatiladi — bu funksiya React
 * kontekstidan tashqarida ham chaqirilishi mumkin.
 */
export function formatBookDate(publishedDate, lang = "uz") {
  return getFormatters(lang).formatDate(publishedDate);
}

/** Normalize date for <input type="date"> */
export function toDateInputValue(publishedDate) {
  if (!publishedDate) return "";
  const date = new Date(publishedDate);
  if (Number.isNaN(date.getTime())) {
    return String(publishedDate).slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

export function unwrapCreatedId(response) {
  if (!response) return null;
  return response.id || response.data?.id || null;
}

export function getBookFiles(book) {
  return Array.isArray(book?.files) ? book.files : [];
}

export function getBookImages(book) {
  return Array.isArray(book?.images) ? book.images : [];
}

export function isPdfFile(file) {
  if (!file) return false;
  const name = (file.name || file.original_name || file.filename || "").toLowerCase();
  const mime = (file.mime_type || file.mimetype || file.type || "").toLowerCase();
  return name.endsWith(".pdf") || mime.includes("pdf");
}

export function getFileViewUrl(file) {
  if (!file) return null;
  return resolveMediaUrl(
    file.view_url || file.url || file.path || file.file_url,
  );
}
