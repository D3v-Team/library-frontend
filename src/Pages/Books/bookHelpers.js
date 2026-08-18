import { BASE_URL } from "../../store/api";

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

export function formatBookDate(publishedDate) {
  if (!publishedDate) return null;
  const date = new Date(publishedDate);
  if (Number.isNaN(date.getTime())) return String(publishedDate);
  return date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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
