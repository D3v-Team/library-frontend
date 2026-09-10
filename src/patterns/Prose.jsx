import cx from "../lib/cx";
import { sanitizeHtml } from "../utils/sanitize";

/**
 * CMS dan kelgan HTML — tozalangan va tipografikaga solingan.
 *
 * Ikki narsani bir joyda bajaradi:
 *   1. `sanitizeHtml` — <script> va hodisa atributlarini olib tashlaydi
 *   2. `.prose` klassi — design/prose.css dagi tipografika
 *
 * Ilgari har sahifa buni o'zi qilardi va `prose prose-slate max-w-none`
 * yozardi — u klasslar esa hech narsa qilmasdi (plagin o'rnatilmagan).
 */
export default function Prose({ html, wide = false, className }) {
  if (!html) return null;

  return (
    <div
      className={cx("prose", wide && "prose-wide", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
