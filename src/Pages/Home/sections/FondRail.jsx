import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../../lib/useLocalized";
import { useGetBooksQuery } from "../../../store/services/books.api";
import { formatBookYear, getBookCoverUrl, getBookGenreNames } from "../../Books/bookHelpers";
import { Button, EmptyState, Rail, Skeleton } from "../../../ui";
import { SectionHeader } from "../../../patterns";

/**
 * 03 — Fond: yangi kelgan kitoblar. Marquee → rels.
 *
 * Audit topilmasi: eski NewBooks bloki TO'RT USTUNLI cheksiz vertikal
 * marquee edi — har ustun har xil tezlikda o'z-o'zidan siljirdi.
 * Natijada kursorni muqovaga olib borguncha kitob joyidan ketardi va
 * sarlavhani o'qib tugatishga ulgurmasdingiz. Bosish kerak bo'lgan
 * kontent qimirlamasligi kerak.
 *
 * Endi naqsh 8: gorizontal scroll-snap rels — strelka, drag,
 * g'ildirak, ← →. Muqova hover da yengil buriladi (naqsh 3).
 */
export default function FondRail() {
  const { t } = useTranslation();
  const { pick } = useLocalized();

  const { data, isLoading, error } = useGetBooksQuery({
    page: 1,
    limit: 12,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const books = data?.data ?? [];

  return (
    <section className="border-t border-line-soft bg-paper-2">
      <div className="mx-auto w-full max-w-container px-gut py-16 sm:py-20">
        <SectionHeader
          eyebrow={t("newBooks.badge")}
          title={t("home.fond.title")}
          lede={t("home.fond.lede")}
          action={
            <Button variant="secondary" to="/books" iconEnd={<ArrowRight size={16} />}>
              {t("newBooks.all")}
            </Button>
          }
        />

        <div className="mt-10">
          {error ? (
            <EmptyState title={t("newBooks.error")} />
          ) : isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-44 shrink-0 flex flex-col gap-3">
                  <Skeleton className="aspect-[2/3] w-full" rounded="card" />
                  <Skeleton className="h-3.5 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title={t("newBooks.empty")}
              actions={
                <Button size="sm" variant="primary" to="/books">
                  {t("newBooks.all")}
                </Button>
              }
            />
          ) : (
            <Rail label={t("home.fond.title")}>
              {books.map((book) => {
                const cover = getBookCoverUrl(book);
                const year = formatBookYear(book.published_date);
                const genre = getBookGenreNames(book)[0];

                return (
                  <article key={book.id} className="u-tilt-wrap w-44 sm:w-48">
                    <Link to={`/books/${book.id}`} className="group block">
                      <span className="u-tilt relative block aspect-[2/3] overflow-hidden rounded-card bg-ink-deep shadow-s1">
                        {cover ? (
                          <img
                            src={cover}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          // Muqova yo'q — kulrang ikonka emas, tipografik plagin
                          <span className="flex h-full w-full items-center justify-center p-4">
                            <span className="font-display text-[0.85rem] leading-snug text-on-ink/80">
                              {pick(book, "name")}
                            </span>
                          </span>
                        )}

                        {/* Kitob tanasi — tilla yon chizig'i */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-transparent via-gold to-transparent"
                        />
                        <span className="u-tilt-glint" />
                      </span>

                      <h3 className="mt-3 line-clamp-2 font-display text-[0.92rem] font-semibold leading-snug text-fg">
                        {pick(book, "name") || t("books.unknown")}
                      </h3>

                      <p className="mt-1 line-clamp-1 font-sans text-[0.8rem] text-fg-muted">
                        {pick(book?.author, "full_name") || t("books.unknownAuthor")}
                      </p>

                      <p className="mt-1.5 flex items-center gap-2 font-mono text-[0.72rem] text-fg-faint tabular">
                        {year && <span>{year}</span>}
                        {genre && <span className="truncate">{genre}</span>}
                      </p>
                    </Link>
                  </article>
                );
              })}
            </Rail>
          )}
        </div>
      </div>
    </section>
  );
}
