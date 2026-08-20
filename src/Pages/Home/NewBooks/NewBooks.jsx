import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetBooksQuery } from "../../../store/services/books.api";
import {
  formatBookYear,
  getBookCoverUrl,
  getBookGenreNames,
} from "../../Books/bookHelpers";

const COLUMN_CONFIG = [
  {
    duration: 22,
    offset: 0,
  },
  {
    duration: 28,
    offset: 0.32,
  },
  {
    duration: 24,
    offset: 0.58,
  },
  {
    duration: 31,
    offset: 0.18,
  },
];

function mapBookCard(book, lang) {
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

function getInitialOffset(columnIndex) {
  const config = COLUMN_CONFIG[columnIndex];

  const key = `new-books-animation-${columnIndex}`;

  let startTime = localStorage.getItem(key);

  if (!startTime) {
    startTime = Date.now().toString();
    localStorage.setItem(key, startTime);
  }

  const elapsed = Date.now() - Number(startTime);

  return (elapsed / 1000 / config.duration + config.offset) % 1;
}

function BookCard({ book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      aria-label={`${book.title} — ${book.author}`}
      className="
        group
        block
        h-[230px]
        shrink-0
        overflow-hidden
        rounded-2xl
        bg-slate-100
        shadow-[0_10px_24px_-14px_rgba(15,23,42,0.45)]
        transition-shadow
        duration-300
        hover:shadow-[0_14px_30px_-14px_rgba(15,23,42,0.5)]

        sm:h-[270px]

        lg:h-[350px]
      "
    >
      <div className="relative h-full w-full overflow-hidden">
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            loading="lazy"
            draggable={false}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              group-hover:scale-[1.04]
            "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
            <BookOpen size={32} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium text-slate-700 shadow-sm sm:text-[11px]">
          {book.category}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] sm:text-base">
            {book.title}
          </h3>

          <p className="mt-1 line-clamp-1 text-xs text-white/80">
            {book.author}
          </p>

          <div className="mt-1.5 text-[11px] text-white/65">
            {book.year}
          </div>
        </div>
      </div>
    </Link>
  );
}

function BookColumn({ books, columnIndex }) {
  const config = COLUMN_CONFIG[columnIndex];

  const initialProgress = getInitialOffset(columnIndex);

  const stacks = [books, books];

  return (
    <div
      className="
        relative
        h-[520px]
        overflow-hidden

        sm:h-[600px]

        lg:h-[780px]
      "
    >
      {/* TOP FADE */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-20
          h-12
          bg-gradient-to-b
          from-white
          via-white/70
          to-transparent

          sm:h-16

          lg:h-20
        "
      />

      {/* BOTTOM FADE */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-20
          h-12
          bg-gradient-to-t
          from-white
          via-white/70
          to-transparent

          sm:h-16

          lg:h-20
        "
      />

      <motion.div
        initial={{
          y: `${-initialProgress * 50}%`,
        }}
        animate={{
          y: ["0%", "-50%"],
        }}
        transition={{
          duration: config.duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
        className="
          flex
          flex-col
          gap-5

          sm:gap-5

          lg:gap-6
        "
      >
        {stacks.map((stack, stackIndex) => (
          <div
            key={stackIndex}
            className="
              flex
              shrink-0
              flex-col
              gap-5

              sm:gap-5

              lg:gap-6
            "
          >
            {stack.map((book) => (
              <BookCard
                key={`${columnIndex}-${stackIndex}-${book.id}`}
                book={book}
              />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function NewBooks() {
  const { t, i18n } = useTranslation();

  const {
    data,
    isLoading,
    error,
  } = useGetBooksQuery({
    page: 1,
    limit: 12,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const books = useMemo(
    () =>
      (data?.data ?? []).map((book) =>
        mapBookCard(book, i18n.language),
      ),
    [data, i18n.language],
  );

  /*
   * Responsive columns:
   *
   * desktop -> 4
   * tablet  -> 3
   * mobile  -> 2
   */
  const desktopColumns = useMemo(
    () =>
      Array.from({ length: 4 }, (_, index) =>
        books.filter((_, bookIndex) => bookIndex % 4 === index),
      ),
    [books],
  );

  const tabletColumns = useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) =>
        books.filter((_, bookIndex) => bookIndex % 3 === index),
      ),
    [books],
  );

  const mobileColumns = useMemo(
    () =>
      Array.from({ length: 2 }, (_, index) =>
        books.filter((_, bookIndex) => bookIndex % 2 === index),
      ),
    [books],
  );

  if (isLoading) {
    return (
      <section className="bg-white py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 border-b border-slate-200 pb-7">
            <div className="mb-4 h-7 w-48 animate-pulse rounded bg-blue-700/40" />

            <div className="h-9 w-64 animate-pulse rounded bg-blue-700/50" />

            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-blue-700/40" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="
                  h-[230px]
                  animate-pulse
                  rounded-2xl
                  bg-blue-700/60

                  sm:h-[270px]

                  lg:h-[350px]
                "
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
            {t("newBooks.error")}
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return (
      <section className="bg-white py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <BookOpen
              className="mx-auto mb-3 text-slate-300"
              size={28}
            />

            <p className="text-sm text-slate-500">
              {t("newBooks.empty")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden bg-white py-10 sm:py-12 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between lg:pb-7">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700" />

              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
                <BookOpen size={17} />

                <span>{t("newBooks.badge")}</span>
              </div>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {t("newBooks.heading")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              {t("newBooks.description")}
            </p>
          </div>

          <Link
            to="/books"
            className="hidden items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:inline-flex"
          >
            {t("newBooks.all")}

            <ArrowRight size={16} />
          </Link>
        </div>

        {/* =========================
            DESKTOP
            4 COLUMNS
        ========================== */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
          {desktopColumns.map((columnBooks, columnIndex) => (
            <BookColumn
              key={columnIndex}
              books={columnBooks}
              columnIndex={columnIndex}
            />
          ))}
        </div>

        {/* =========================
            TABLET
            3 COLUMNS
        ========================== */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-5 lg:hidden">
          {tabletColumns.map((columnBooks, columnIndex) => (
            <BookColumn
              key={columnIndex}
              books={columnBooks}
              columnIndex={columnIndex}
            />
          ))}
        </div>

        {/* =========================
            MOBILE
            2 COLUMNS
        ========================== */}
        <div className="grid grid-cols-2 gap-4 sm:hidden">
          {mobileColumns.map((columnBooks, columnIndex) => (
            <BookColumn
              key={columnIndex}
              books={columnBooks}
              columnIndex={columnIndex}
            />
          ))}
        </div>

        {/* MOBILE / TABLET LINK */}
        <Link
          to="/books"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-700 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:mt-8 lg:hidden"
        >
          {t("newBooks.all")}

          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}