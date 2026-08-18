// src/seo/seoUtils.js
//
// Dinamik (detail) sahifalar uchun SEO matnlarini API javobidan
// tayyorlaydigan yordamchi funksiyalar.

import { BASE_URL } from "../store/api";

/**
 * Uzun matnni meta description uchun qisqartiradi (~155 belgi,
 * qidiruv tizimlari snippet uzunligiga mos).
 */
export function truncateForMeta(text, limit = 155) {
  if (!text) return "";

  const clean = String(text).replace(/\s+/g, " ").trim();

  if (clean.length <= limit) return clean;

  return `${clean.slice(0, limit - 1).trimEnd()}…`;
}

/**
 * Nisbiy rasm manzilini (masalan /uploads/x.jpg) to'liq URL'ga aylantiradi.
 * Agar rasm allaqachon to'liq (http/https) bo'lsa o'zgarishsiz qaytaradi.
 */
export function resolveSeoImage(path) {
  if (!path) return null;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
