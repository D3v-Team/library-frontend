import { useRef } from "react";
import { useTranslation } from "react-i18next";

import scrollToSection from "../../lib/scrollToSection";
import { useLocalized } from "../../lib/useLocalized";
import { Pagination } from "../../patterns";
import { getBookAuthorName } from "./bookHelpers";

/**
 * Fond kartotekasi — Excel importidan kelgan kitoblar jadvali.
 *
 * Ularda muqova, janr va tavsif yo'q: faqat nom, muallif va nusxa
 * soni. Shuning uchun alohida sahifasi ham yo'q — qatorlar havola
 * emas, oddiy yozuv (BookDetail ham ularni shu yerga qaytaradi).
 *
 * Komponent faqat JORIY sahifa qatorlarini oladi (`books`) va
 * umumiy sonni alohida (`total`) — server paginatsiyasiga tayyor.
 *
 * Kichik ekranda ustunlar yig'iladi: muallif nom ostiga tushadi,
 * tartib raqami yashirinadi — gorizontal scroll yo'q.
 */
export default function FondRegister({ books, total, page, pageSize, totalPages, onPageChange, disabled }) {
  const { t } = useTranslation();
  const { pick, formatNumber } = useLocalized();
  const rootRef = useRef(null);

  const offset = (page - 1) * pageSize;

  const changePage = (p) => {
    onPageChange(p);
    // Jadval boshiga qaytamiz (butun sahifa tepasiga emas)
    scrollToSection(rootRef.current);
  };

  const th = "px-4 py-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-fg-faint sm:px-5";

  return (
    <div ref={rootRef}>
      <div className="overflow-hidden rounded-card border border-line bg-paper-2">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{t("books.shelfRegister")}</caption>
          <thead>
            <tr className="border-b border-line bg-paper-3/70">
              <th scope="col" className={`${th} hidden w-16 sm:table-cell`}>
                {t("books.colNo")}
              </th>
              <th scope="col" className={th}>
                {t("books.colTitle")}
              </th>
              <th scope="col" className={`${th} hidden md:table-cell`}>
                {t("books.colAuthor")}
              </th>
              <th scope="col" className={`${th} w-24 text-right sm:w-28`}>
                {t("books.colQuantity")}
              </th>
            </tr>
          </thead>

          <tbody className={disabled ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {books.map((book, i) => {
              const title = pick(book, "name") || t("books.unknown");
              const author = getBookAuthorName(book, pick);
              const quantity = Number(book.quantity);

              return (
                <tr
                  key={book.id}
                  className="border-b border-line-soft transition-colors duration-1 ease-out-soft last:border-b-0 hover:bg-paper-3/60"
                >
                  <td className="hidden px-5 py-3.5 align-middle font-mono text-[0.78rem] text-fg-faint tabular sm:table-cell">
                    {formatNumber(offset + i + 1)}
                  </td>

                  <td className="px-4 py-3.5 align-middle sm:px-5">
                    <span className="block font-display text-[0.95rem] font-medium leading-snug text-fg [overflow-wrap:anywhere]">
                      {title}
                    </span>

                    {/* Mobil: muallif nom ostida */}
                    <span className="mt-0.5 block font-sans text-[0.8rem] text-fg-muted md:hidden">
                      {author || t("books.unknownAuthor")}
                    </span>
                  </td>

                  <td className="hidden px-5 py-3.5 align-middle font-sans text-[0.86rem] text-fg-muted md:table-cell">
                    {author || <span className="text-fg-faint">—</span>}
                  </td>

                  <td className="px-4 py-3.5 text-right align-middle sm:px-5">
                    {Number.isFinite(quantity) ? (
                      <span
                        className="inline-flex min-w-9 items-center justify-center rounded-field border border-line bg-page px-2 py-0.5 font-mono text-[0.8rem] text-fg tabular"
                        title={t("books.quantityUnit", { count: quantity })}
                      >
                        {formatNumber(quantity)}
                      </span>
                    ) : (
                      <span className="font-mono text-[0.8rem] text-fg-faint">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <span className="font-mono text-[0.75rem] text-fg-faint tabular">
            {t("books.registerRange", {
              from: formatNumber(offset + 1),
              to: formatNumber(offset + books.length),
              total: formatNumber(total),
            })}
          </span>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={changePage}
            disabled={disabled}
            scrollToTop={false}
            size="sm"
            labels={{
              nav: t("books.registerPagination"),
              prev: t("media.prevPage"),
              next: t("media.nextPage"),
            }}
          />
        </div>
      )}
    </div>
  );
}
