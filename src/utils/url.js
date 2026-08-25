// Tashqi havolalarni render qilishdan oldin tekshiradi.
//
// Admin panelda kiritilgan havolalar (bannerlar, foydali havolalar, ijtimoiy
// tarmoqlar, hujjatlar) to'g'ridan-to'g'ri href ga tushadi. Formada
// validators.js → isValidUrl tekshiradi, lekin backendda eski yozuvlar
// qolgan bo'lishi mumkin — shuning uchun render vaqtida ham himoya kerak.

const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/**
 * Xavfsiz href qaytaradi. javascript:, data:, vbscript: kabi sxemalar
 * uchun null qaytadi — chaqiruvchi bunday havolani ko'rsatmasligi kerak.
 */
export function safeHref(url) {
  if (!url) return null;

  const trimmed = String(url).trim();

  // Nisbiy manzillar (/books, #section) — o'z saytimiz ichida, xavfsiz.
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    // Sxemasiz yozilgan manzil ("example.uz") — https deb qaraymiz.
    // Faqat haqiqiy domenga o'xshasa: bo'sh joy yo'q va nuqta bor.
    // Aks holda ("salom dunyo") havola yasamaymiz.
    if (/\s/.test(trimmed) || !/^[^\s/:]+\.[^\s/:]+/.test(trimmed)) {
      return null;
    }

    try {
      parsed = new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }

  return SAFE_PROTOCOLS.includes(parsed.protocol) ? parsed.href : null;
}

/** Havola xavfsizmi — shartli render uchun. */
export function isSafeHref(url) {
  return safeHref(url) !== null;
}
