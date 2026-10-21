import { BASE_URL } from "../../store/api";

const toUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

/** Muqova: `cover_image`, bo'lmasa galereyadagi asosiy (is_main) rasm */
export function newsCover(item) {
  const main = item?.images?.find((img) => img.is_main) ?? item?.images?.[0];
  return toUrl(item?.cover_image || main?.url);
}

/** Chop etilgan sana; bo'lmasa yaratilgan sana */
export const newsDate = (item) => item?.published_at ?? item?.created_at;

/** CMS dan HTML kelishi mumkin — kartochkadagi lid uchun teglar olib tashlanadi */
export const plainText = (html) =>
  String(html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/** Foto soni: galereya, u bo'lmasa muqovaning o'zi */
export const photoCount = (item) => item?.images?.length || (item?.cover_image ? 1 : 0);

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Ro'yxatni kunlar bo'yicha guruhlaydi (kelish tartibi saqlanadi).
 * Bu filtr emas — joriy sahifadagi yozuvlar shunchaki kun sarlavhalari
 * ostiga joylanadi: yangiliklar har kungi faoliyat hisoboti.
 */
export function groupByDay(items) {
  const groups = [];
  const byKey = new Map();

  for (const item of items) {
    const raw = newsDate(item);
    const d = raw ? new Date(raw) : null;
    const key = d && !Number.isNaN(d.getTime()) ? dayKey(d) : "none";

    if (!byKey.has(key)) {
      const group = { key, date: key === "none" ? null : d, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    byKey.get(key).items.push(item);
  }

  return groups;
}

/** "Bugun" / "Kecha" / to'liq sana */
export function dayLabel(date, { t, formatDate }) {
  if (!date) return "—";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dayKey(date) === dayKey(today)) return t("news.today");
  if (dayKey(date) === dayKey(yesterday)) return t("news.yesterday");
  return formatDate(date);
}
