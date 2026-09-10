import { Link } from "react-router-dom";

import cx from "../lib/cx";
import { useLocalized } from "../lib/useLocalized";
import { formatBookYear, getBookCoverUrl, getBookGenreNames } from "../Pages/Books/bookHelpers";

/**
 * Kitob kartochkasi — katalog, rels va tavsiyalarda bitta shakl.
 *
 * Buyurtmachi mulohazasi: «kitoblar juda katta bo'lib ketgan».
 * O'lchov: eski katalog `lg:grid-cols-4` + `aspect-[3/4]` = 1280px
 * konteynerda ~290×387px muqova, bir ekranda 4 kitob.
 *
 * Yechim shu kartochkada: muqova nisbati **2:3** — kitobning haqiqiy
 * proporsiyasi (3:4 muqovani cho'zib ko'rsatadi). Katalog gridi esa
 * 6 ustunga o'tadi → ~186×279px, bir ekranda 18 kitob.
 *
 * `variant="row"` — ro'yxat ko'rinishi: skanerlash uchun.
 */
export default function BookCard({ book, variant = "grid" }) {
  const { pick } = useLocalized();

  const cover = getBookCoverUrl(book);
  const title = pick(book, "name");
  const author = pick(book?.author, "full_name");
  const year = formatBookYear(book.published_date);
  const genre = getBookGenreNames(book)[0];

  if (variant === "row") {
    return (
      // Ajratgich chizig'i tashqi o'ramda: hover foni ichkariga surilgan
      // va burchagi yumaloq bo'lgani uchun chegara u bilan to'qnashadi.
      <div className="border-b border-line-soft">
        <Link
          to={`/books/${book.id}`}
          className="-mx-3 flex items-center gap-4 rounded-field px-3 py-3 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
        >
          <span className="relative h-16 w-11 shrink-0 overflow-hidden rounded-field bg-ink-deep">
            {cover ? (
              <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden="true" className="girih-tile absolute inset-0" />
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-[0.95rem] font-medium text-fg">
              {title}
            </span>
            <span className="block truncate font-sans text-[0.8rem] text-fg-muted">{author}</span>
          </span>

          <span className="hidden shrink-0 items-center gap-5 font-mono text-[0.75rem] text-fg-faint tabular sm:flex">
            {genre && <span className="max-w-32 truncate">{genre}</span>}
            {year && <span>{year}</span>}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <article className="u-tilt-wrap">
      <Link to={`/books/${book.id}`} className="group block">
        {/* 2:3 — kitobning haqiqiy proporsiyasi */}
        <span className="u-tilt relative block aspect-[2/3] overflow-hidden rounded-card bg-ink-deep shadow-s1">
          {cover ? (
            <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            // Muqovasiz yozuv — kulrang ikonka emas, tipografik plagin
            <span className="flex h-full w-full items-center justify-center p-3">
              <span className="line-clamp-4 text-center font-display text-[0.8rem] leading-snug text-on-ink/80">
                {title}
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

        <h3 className={cx("mt-2.5 line-clamp-2 font-display font-semibold leading-snug text-fg", "text-[0.86rem]")}>
          {title}
        </h3>

        {author && (
          <p className="mt-0.5 line-clamp-1 font-sans text-[0.76rem] text-fg-muted">{author}</p>
        )}

        <p className="mt-1 flex items-center gap-2 font-mono text-[0.7rem] text-fg-faint tabular">
          {year && <span>{year}</span>}
          {genre && <span className="truncate">{genre}</span>}
        </p>
      </Link>
    </article>
  );
}
