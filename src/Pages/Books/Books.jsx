// src/pages/Books.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetBooksQuery } from "../../store/services/books.api";
import { useGetAuthorsQuery } from "../../store/services/avtors.api";
import { useGetGenresQuery } from "../../store/services/genres";

import {
  formatBookYear,
  getBookCoverUrl,
  getBookGenreNames,
} from "./bookHelpers";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

export default function Books() {
  const { t, i18n } = useTranslation();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");

  const { data, isLoading, isFetching, error } = useGetBooksQuery({
    page,
    limit: 12,
    search,
    author_id: authorFilter || undefined,
    genre_id: genreFilter || undefined,
  });

  const { data: authorsData } = useGetAuthorsQuery({
    page: 1,
    limit: 100,
  });

  const { data: genresData } = useGetGenresQuery({
    page: 1,
    limit: 100,
  });

  const books = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  // Tilga qarab genre nomini olish
  const getGenreName = (genre) => {
    const lang = i18n.language;
    if (lang === "uz") return genre.name_latin || genre.name;
    if (lang === "ru") return genre.name_ru || genre.name;
    if (lang === "cyrl") return genre.name_cyril || genre.name;
    return genre.name_latin || genre.name;
  };

  // Tilga qarab author nomini olish
  const getAuthorName = (author) => {
    if (!author) return t("books.unknownAuthor");
    const lang = i18n.language;
    if (lang === "uz") return author.full_name_latin;
    if (lang === "ru") return author.full_name_ru;
    if (lang === "cyrl") return author.full_name_cyril;
    return author.full_name_latin || t("books.unknownAuthor");
  };

  // Tilga qarab book nomini olish
  const getBookName = (book) => {
    const lang = i18n.language;
    if (lang === "uz") return book.name_latin;
    if (lang === "ru") return book.name_ru;
    if (lang === "cyrl") return book.name_cyril;
    return book.name_latin || t("books.unknown");
  };

  return (
    <section className="bg-white">
      <SEO {...SEO_CONFIG.books} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-blue-700" />
              <span className="text-xs font-semibold tracking-[0.15em] text-blue-700">
                {t("books.badge")}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t("books.heading")}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {t("books.description")}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
            <p className="text-xs text-slate-400">{t("books.total")}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {data?.meta?.total || 0}
            </p>
          </div>
        </div>

        {/* FILTER */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-3">
            {/* SEARCH */}
            <div className="relative md:col-span-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t("books.search")}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-700 focus:bg-white"
              />
            </div>

            {/* AUTHOR */}
            <select
              value={authorFilter}
              onChange={(e) => {
                setAuthorFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-700"
            >
              <option value="">{t("books.allAuthors")}</option>
              {(authorsData?.data || []).map((author) => (
                <option key={author.id} value={author.id}>
                  {getAuthorName(author)}
                </option>
              ))}
            </select>

            {/* GENRE */}
            <select
              value={genreFilter}
              onChange={(e) => {
                setGenreFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-700"
            >
              <option value="">{t("books.allGenres")}</option>
              {(genresData?.data || []).map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {getGenreName(genre)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl bg-red-50 px-6 py-12 text-center text-sm text-red-600">
            {t("books.error")}
          </div>
        ) : books.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">{t("books.empty")}</p>
          </div>
        ) : (
          <div
            className={`mt-8 grid grid-cols-2 gap-x-4 gap-y-8 transition-opacity sm:grid-cols-3 lg:grid-cols-4 ${
              isFetching ? "opacity-60" : "opacity-100"
            }`}
          >
            {books.map((book) => {
              const cover = getBookCoverUrl(book);
              const genres = getBookGenreNames(book, i18n.language);
              const year = formatBookYear(book.published_date);
              const bookName = getBookName(book);
              const authorName = getAuthorName(book.author);

              return (
                <Link key={book.id} to={`/books/${book.id}`} className="group">
                  <article>
                    {/* COVER */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                      {cover ? (
                        <img
                          src={cover}
                          alt={bookName}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <BookOpen size={32} />
                        </div>
                      )}

                      {genres[0] && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
                          {genres[0]}
                        </span>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="mt-4">
                      <h3 className="line-clamp-1 text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                        {bookName}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {authorName}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        {year && <span>{year}</span>}
                        {year && genres[0] && (
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                        )}
                        {genres[0] && (
                          <span className="line-clamp-1">{genres[0]}</span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPage(i + 1);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                  page === i + 1
                    ? "bg-blue-700 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}