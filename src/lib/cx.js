/**
 * Shartli klass birlashtirgich.
 *
 * Loyihada clsx yo'q va shu bitta funksiya uchun paket qo'shish
 * ortiqcha — u yigirma qatorga sig'adi.
 *
 *   cx("btn", isBig && "btn-lg", { "btn-on": active })
 */
export default function cx(...parts) {
  const out = [];

  for (const part of parts) {
    if (!part) continue;

    if (typeof part === "string" || typeof part === "number") {
      out.push(part);
    } else if (Array.isArray(part)) {
      const nested = cx(...part);
      if (nested) out.push(nested);
    } else if (typeof part === "object") {
      for (const [key, on] of Object.entries(part)) {
        if (on) out.push(key);
      }
    }
  }

  return out.join(" ");
}
