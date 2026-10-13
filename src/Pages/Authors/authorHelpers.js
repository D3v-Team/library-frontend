/**
 * Muallif Excel importidan kelganmi (faqat ism)?
 *
 * Import har `author_name` dan muallif yaratadi: tarjimai hol, surat va
 * tug'ilgan sana bo'sh. Qo'lda kiritishda esa tug'ilgan sana majburiy.
 * Bunday muallifning alohida sahifasi yo'q — u "Mualliflar ko'rsatkichi"
 * da turadi va kitoblari Fond kartotekasida ochiladi.
 */
export function isIndexAuthor(author) {
  if (!author) return false;
  const hasBio = author.biography_latin || author.biography_cyril || author.biography_ru;
  const hasImages = Array.isArray(author.images) && author.images.length > 0;
  return !author.birth_date && !hasBio && !hasImages;
}

/** Ko'rsatkichdagi muallifning kitoblari — kartotekada, muallif filtri bilan */
export const authorRegisterPath = (id) => `/books?shelf=kartoteka&author=${id}`;
