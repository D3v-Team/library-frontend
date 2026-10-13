import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import scrollToSection from "../../lib/scrollToSection";
import { useLocalized } from "../../lib/useLocalized";
import { Pagination } from "../../patterns";
import { authorRegisterPath } from "./authorHelpers";

/**
 * Mualliflar ko'rsatkichi — Excel importidan kelgan (faqat ism) mualliflar.
 *
 * Ularda surat ham, tarjimai hol ham yo'q: portret kartochkada ular bir
 * xil bo'sh naqshli to'rtburchaklar qatoriga aylanardi. Bu yerda kitob
 * oxiridagi ism ko'rsatkichi kabi ixcham ko'p ustunli ro'yxat.
 *
 * Monogramma — FAMILIYA bosh harfi: import nomlari ismning bosh
 * harfidan boshlanadi ("A. Qodiriy"), ya'ni birinchi harf ma'no bermaydi.
 *
 * Ism bosilsa alohida (bo'sh) sahifa emas, Fond kartotekasidagi shu
 * muallifning kitoblari ochiladi.
 */
const monogram = (name) => {
  const words = name.replace(/[.,]/g, " ").trim().split(/\s+/);
  return (words[words.length - 1] || "?").charAt(0).toUpperCase();
};

export default function AuthorIndex({ authors, total, page, pageSize, totalPages, onPageChange, disabled }) {
  const { t } = useTranslation();
  const { pick, formatNumber } = useLocalized();
  const rootRef = useRef(null);

  const offset = (page - 1) * pageSize;

  const changePage = (p) => {
    onPageChange(p);
    scrollToSection(rootRef.current);
  };

  return (
    <div ref={rootRef}>
      <ul
        className={`grid gap-x-8 border-t border-line transition-opacity duration-1 ease-out-soft sm:grid-cols-2 lg:grid-cols-3 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        {authors.map((author) => {
          const name = pick(author, "full_name") || t("author.unknownName");

          return (
            <li key={author.id} className="border-b border-line-soft">
              <Link
                to={authorRegisterPath(author.id)}
                aria-label={t("author.indexOpen", { name })}
                className="group -mx-3 flex items-center gap-3 rounded-field px-3 py-2.5 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-paper-2 font-display text-[0.9rem] font-semibold text-gold-dim transition-colors duration-1 ease-out-soft group-hover:border-gold/40"
                >
                  {monogram(name)}
                </span>

                <span className="min-w-0 flex-1 truncate font-display text-[0.95rem] text-fg">
                  {name}
                </span>

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.9}
                  aria-hidden="true"
                  className="shrink-0 text-fg-faint opacity-0 transition-opacity duration-1 ease-out-soft group-hover:opacity-100 group-focus-visible:opacity-100"
                />
              </Link>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <span className="font-mono text-[0.75rem] text-fg-faint tabular">
            {t("author.indexRange", {
              from: formatNumber(offset + 1),
              to: formatNumber(Math.min(offset + pageSize, total)),
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
              nav: t("author.indexPagination"),
              prev: t("media.prevPage"),
              next: t("media.nextPage"),
            }}
          />
        </div>
      )}
    </div>
  );
}
