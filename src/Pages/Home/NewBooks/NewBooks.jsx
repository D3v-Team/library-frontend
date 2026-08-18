// src/components/NewBooks.jsx
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetBooksQuery } from "../../../store/services/books.api";
import {
  formatBookYear,
  getBookCoverUrl,
  getBookGenreNames,
} from "../../Books/bookHelpers";

const BREAKPOINTS = [
  { minWidth: 1024, itemsPerPage: 4 },
  { minWidth: 640, itemsPerPage: 2 },
  { minWidth: 0, itemsPerPage: 1 },
];

function getItemsPerPage(width) {
  const match = BREAKPOINTS.find((bp) => width >= bp.minWidth);
  return match ? match.itemsPerPage : 1;
}

function mapBookCard(book, lang) {
  // Tilga qarab title va author ni tanlash
  const getTitle = () => {
    if (lang === "uz") return book.name_latin;
    if (lang === "ru") return book.name_ru;
    if (lang === "cyrl") return book.name_cyril;
    return book.name_latin || "Nomsiz";
  };

  const getAuthor = () => {
    if (lang === "uz") return book.author?.full_name_latin;
    if (lang === "ru") return book.author?.full_name_ru;
    if (lang === "cyrl") return book.author?.full_name_cyril;
    return book.author?.full_name_latin || "Muallif ko‘rsatilmagan";
  };

  const genres = getBookGenreNames(book);

  return {
    id: book.id,
    title: getTitle(),
    author: getAuthor(),
    year: formatBookYear(book.published_date) || "—",
    category: genres[0] || "Janr ko‘rsatilmagan",
    image: getBookCoverUrl(book),
  };
}

export default function NewBooks() {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error } = useGetBooksQuery({
    page: 1,
    limit: 12,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const books = useMemo(
    () => (data?.data ?? []).map((book) => mapBookCard(book, i18n.language)),
    [data, i18n.language],
  );

  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [index, setIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const count = books.length || 1;
      setItemsPerPage(Math.min(getItemsPerPage(window.innerWidth), count));
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, [books.length]);

  useEffect(() => {
    setIndex(0);
  }, [books.length]);

  const trackItems = useMemo(() => {
    if (books.length === 0) return [];

    const front = books
      .slice(-itemsPerPage)
      .map((book, i) => ({ ...book, _slot: `front-${i}` }));

    const real = books.map((book) => ({
      ...book,
      _slot: `real-${book.id}`,
    }));

    const back = books
      .slice(0, itemsPerPage)
      .map((book, i) => ({ ...book, _slot: `back-${i}` }));

    return [...front, ...real, ...back];
  }, [books, itemsPerPage]);

  useEffect(() => {
    if (transitionEnabled) return;

    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTransitionEnabled(true));
    });

    return () => cancelAnimationFrame(raf1);
  }, [transitionEnabled]);

  const goPrev = () => {
    if (isAnimating || books.length === 0) return;
    setIsAnimating(true);
    setIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (isAnimating || books.length === 0) return;
    setIsAnimating(true);
    setIndex((prev) => prev + 1);
  };

  const goToBook = (targetIndex) => {
    if (isAnimating || targetIndex === index || books.length === 0) return;
    setIsAnimating(true);
    setIndex(targetIndex);
  };

  const handleTransitionEnd = () => {
    if (books.length === 0) {
      setIsAnimating(false);
      return;
    }

    if (index === books.length) {
      setTransitionEnabled(false);
      setIndex(0);
    } else if (index === -1) {
      setTransitionEnabled(false);
      setIndex(books.length - 1);
    }

    setIsAnimating(false);
  };

  const trackPosition = index + itemsPerPage;
  const trackWidthPercent =
    trackItems.length > 0 ? (trackItems.length / itemsPerPage) * 100 : 100;
  const itemWidthPercent =
    trackItems.length > 0 ? 100 / trackItems.length : 100;
  const translatePercent = trackPosition * itemWidthPercent;

  const activeDot =
    books.length > 0
      ? ((index % books.length) + books.length) % books.length
      : 0;

  return (
    <section className="bg-white py-16 sm:py-10 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700" />
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
                <BookOpen size={17} />
                <span>{t("newBooks.badge")}</span>
              </div>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t("newBooks.heading")}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              {t("newBooks.description")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={books.length === 0}
              aria-label={t("newBooks.prev")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-all duration-200 hover:border-blue-700 hover:bg-blue-700 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <ArrowLeft size={17} />
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={books.length === 0}
              aria-label={t("newBooks.next")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-all duration-200 hover:border-blue-700 hover:bg-blue-700 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <ArrowRight size={17} />
            </button>

            <Link
              to="/books"
              className="ml-2 hidden rounded text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:block"
            >
              {t("newBooks.all")}
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
            {t("newBooks.error")}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <BookOpen className="mx-auto mb-3 text-slate-300" size={28} />
            <p className="text-sm text-slate-500">{t("newBooks.empty")}</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden">
              <div
                onTransitionEnd={handleTransitionEnd}
                className="flex"
                style={{
                  width: `${trackWidthPercent}%`,
                  transform: `translateX(-${translatePercent}%)`,
                  transition: transitionEnabled
                    ? "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                }}
              >
                {trackItems.map((book) => (
                  <div
                    key={book._slot}
                    className="shrink-0 px-2.5"
                    style={{
                      flex: `0 0 ${itemWidthPercent}%`,
                    }}
                  >
                    <article className="group">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
                        {book.image ? (
                          <img
                            src={book.image}
                            alt={book.title}
                            loading="lazy"
                            draggable={false}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <BookOpen size={36} />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                          {book.category}
                        </span>

                        <Link
                          to={`/books/${book.id}`}
                          aria-label={`${t("newBooks.view")}: ${book.title}`}
                          className="absolute bottom-4 left-4 right-4 flex translate-y-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 opacity-100 shadow-lg transition-all duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
                        >
                          {t("newBooks.view")}
                          <ArrowRight size={16} />
                        </Link>
                      </div>

                      <div className="pt-5">
                        <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">
                          {book.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {book.author}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                          <span>{book.year}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="line-clamp-1">{book.category}</span>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="mt-7 flex items-center justify-center gap-2.5"
              style={{ perspective: "400px" }}
            >
              {books.map((book, i) => {
                const isActive = activeDot === i;

                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => goToBook(i)}
                    aria-label={`${i + 1}-${t("newBooks.book")}: ${book.title}`}
                    aria-current={isActive}
                    className="group relative h-2 w-9 overflow-hidden rounded-full bg-slate-200 transition-colors duration-300 hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-blue-700 transition-transform ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        transform: isActive
                          ? "rotateY(0deg)"
                          : "rotateY(85deg)",
                        transitionDuration: "550ms",
                        transformStyle: "preserve-3d",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}

        <Link
          to="/books"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-700 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:hidden"
        >
          {t("newBooks.all")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
