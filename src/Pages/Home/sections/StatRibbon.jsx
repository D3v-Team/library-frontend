import { useGetAuthorsQuery } from "../../../store/services/avtors.api";
import { useGetBooksQuery } from "../../../store/services/books.api";
import { useGetEventsQuery } from "../../../store/services/events";
import { useGetGenresQuery } from "../../../store/services/genres";
import { useLocalized } from "../../../lib/useLocalized";
import { useTranslation } from "react-i18next";

/**
 * Hero pastidagi statistika lentasi.
 *
 * Audit topilmasi: eski Statistics bloki raqamlarni QO'LDA yozgan —
 * "25 000+ kitob", "8 500+ kitobxon", "3 200+ elektron resurs".
 * Fondda esa hozir 2 kitob bor. Bunday raqam saytga ishonchni
 * yo'qotadi, ayniqsa katalogni ochgan odam uchun.
 *
 * Endi faqat API dan keladigan haqiqiy sonlar ko'rsatiladi.
 * Muhim qoida: son kelmasa — ustun umuman chizilmaydi, "0" ham
 * yozilmaydi. Hech bir son kelmasa lenta yo'qoladi.
 *
 * Har so'rov `limit: 1` bilan ketadi — bizga faqat `meta.total` kerak.
 */
export default function StatRibbon() {
  const { t } = useTranslation();
  const { formatNumber } = useLocalized();

  const books = useGetBooksQuery({ page: 1, limit: 1 });
  const authors = useGetAuthorsQuery({ page: 1, limit: 1 });
  const events = useGetEventsQuery({ page: 1, limit: 1 });
  const genres = useGetGenresQuery({ page: 1, limit: 1 });

  const total = (res) => {
    const n = res.data?.meta?.total;
    return typeof n === "number" ? n : null;
  };

  const cells = [
    { key: "books", value: total(books) },
    { key: "authors", value: total(authors) },
    { key: "genres", value: total(genres) },
    { key: "events", value: total(events) },
  ].filter((c) => c.value != null);

  // Hech qanday haqiqiy son yo'q — lenta chizilmaydi
  if (cells.length === 0) return null;

  return (
    <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-on-ink/15 pt-5">
      {cells.map((cell) => (
        <div key={cell.key} className="flex flex-col gap-1">
          <dd className="font-display text-[1.35rem] font-semibold leading-none text-gold tabular">
            {formatNumber(cell.value)}
          </dd>
          <dt className="font-sans text-[0.72rem] uppercase tracking-[0.11em] text-on-ink/55">
            {t(`home.stat.${cell.key}`)}
          </dt>
        </div>
      ))}
    </dl>
  );
}
