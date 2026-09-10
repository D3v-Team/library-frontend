/**
 * Klaviatura bilan kirgan foydalanuvchi uchun birinchi to'xtash joyi:
 * header dagi butun menyuni Tab bilan kesib o'tmasdan kontentga o'tish.
 *
 * Ko'rinishi src/design/base.css dagi `.skip-link` da — fokus olmaguncha
 * ekrandan tashqarida turadi.
 */
export default function SkipLink({ targetId = "main-content", children }) {
  return (
    <a href={`#${targetId}`} className="skip-link">
      {children ?? "Asosiy kontentga o'tish"}
    </a>
  );
}
