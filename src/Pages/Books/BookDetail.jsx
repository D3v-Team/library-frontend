// src/pages/BookDetail.jsx
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Download, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  useGetBookByIdQuery,
  downloadBookFile,
} from "../../store/services/books.api";
import {
  formatBookDate,
  formatBookYear,
  getBookCoverUrl,
  getBookFiles,
  getBookGenreNames,
  getFileViewUrl,
  isPdfFile,
} from "./bookHelpers";
import SEO from "../../seo/SEO";
import { truncateForMeta } from "../../seo/seoUtils";

export default function BookDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();

  const { data: book, isLoading, error } = useGetBookByIdQuery(id);

  const getBookName = () => {
    if (!book) return "";
    const lang = i18n.language;
    if (lang === "uz") return book.name_latin;
    if (lang === "ru") return book.name_ru;
    if (lang === "cyrl") return book.name_cyril;
    return book.name_latin || "Nomsiz";
  };

  const getAuthorName = () => {
    if (!book?.author) return t("bookDetail.unknownAuthor");
    const lang = i18n.language;
    if (lang === "uz") return book.author.full_name_latin;
    if (lang === "ru") return book.author.full_name_ru;
    if (lang === "cyrl") return book.author.full_name_cyril;
    return book.author.full_name_latin || t("bookDetail.unknownAuthor");
  };

  const getDescription = () => {
    if (!book) return "";
    const lang = i18n.language;
    if (lang === "uz") return book.description_latin;
    if (lang === "ru") return book.description_ru;
    if (lang === "cyrl") return book.description_cyril;
    return book.description_latin || "";
  };

  const getNationality = () => {
    if (!book?.author) return "";
    const lang = i18n.language;
    if (lang === "uz") return book.author.nationality_latin;
    if (lang === "ru") return book.author.nationality_ru;
    if (lang === "cyrl") return book.author.nationality_cyril;
    return book.author.nationality_latin || "";
  };

  const files = getBookFiles(book);
  const genres = getBookGenreNames(book, i18n.language);
  const cover = getBookCoverUrl(book);
  const bookName = getBookName();
  const authorName = getAuthorName();
  const description = getDescription();

  const handleDownload = async (file) => {
    try {
      await downloadBookFile(id, file.id, file.name || file.original_name || "fayl");
    } catch {
      toast.error(t("bookDetail.downloadError"));
    }
  };

  // ===== SKELETON =====
  if (isLoading) {
    return (
      <section className="bg-white">
        <SEO title={t("bookDetail.loading")} description={t("bookDetail.loadingDesc")} />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-8 h-4 w-24 rounded bg-slate-300" />
            <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
              {/* Rasm */}
              <div className="aspect-[3/4] w-full rounded-2xl bg-slate-300 lg:max-h-[540px] lg:aspect-auto" />
              {/* Kontent */}
              <div className="space-y-5">
                <div className="flex gap-2">
                  <div className="h-6 w-20 rounded-full bg-slate-300" />
                  <div className="h-6 w-16 rounded-full bg-slate-300" />
                </div>
                <div className="h-9 w-3/4 rounded-lg bg-slate-300" />
                <div className="h-5 w-1/3 rounded bg-slate-300" />
                <div className="space-y-2 pt-1">
                  <div className="h-4 w-full rounded bg-slate-300" />
                  <div className="h-4 w-full rounded bg-slate-300" />
                  <div className="h-4 w-4/5 rounded bg-slate-300" />
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-20 rounded bg-slate-300" />
                      <div className="h-5 w-24 rounded bg-slate-300" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-6 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-300" />
                  <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-300" />
                    <div className="flex-1 h-4 rounded bg-slate-300" />
                    <div className="h-8 w-24 rounded-lg bg-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ===== ERROR =====
  if (error || !book) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <SEO
            title={t("bookDetail.notFound")}
            description={t("bookDetail.notFoundDesc")}
            noIndex
          />
          <Link
            to="/books"
            className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            {t("bookDetail.back")}
          </Link>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-20 text-center">
            <BookOpen size={36} className="mx-auto mb-4 text-slate-300" />
            <p className="text-sm text-slate-500">{t("bookDetail.notFoundError")}</p>
          </div>
        </div>
      </section>
    );
  }

  // ===== CONTENT =====
  return (
    <section className="bg-white">
      <SEO
        title={bookName}
        description={truncateForMeta(description || `${bookName} — ${authorName}`)}
        image={cover}
        type="book"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: bookName,
          author: authorName ? { "@type": "Person", name: authorName } : undefined,
          image: cover || undefined,
          description: truncateForMeta(description),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Back */}
        <Link
          to="/books"
          className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {t("bookDetail.back")}
        </Link>

        <div className={`grid gap-10 lg:gap-14 ${cover ? "lg:grid-cols-[400px_1fr]" : ""}`}>
          {/* ── Chap: muqova ── */}
          {cover && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-md">
                <img
                  src={cover}
                  alt={bookName}
                  loading="lazy"
                  className="w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            </div>
          )}

          {/* ── O'ng: kontent ── */}
          <div>
            {/* Genre teglar */}
            {genres.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {genres.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Sarlavha */}
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {bookName}
            </h1>

            {/* Muallif */}
            <p className="mt-3 text-base font-medium text-slate-500">
              {authorName}
            </p>

            {/* Tavsif */}
            {description && (
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {description}
              </p>
            )}

            {/* Meta */}
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-100 pt-7 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {t("bookDetail.publishDate")}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-slate-800">
                  {formatBookDate(book.published_date) || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {t("bookDetail.publishYear")}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-slate-800">
                  {formatBookYear(book.published_date) || "—"}
                </dd>
              </div>
              {book.grade_level != null && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("bookDetail.gradeLevel")}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-800">
                    {book.grade_level}-{t("bookDetail.grade")}
                  </dd>
                </div>
              )}
              {getNationality() && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("bookDetail.nationality")}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-800">
                    {getNationality()}
                  </dd>
                </div>
              )}
              {book.name_cyril && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("bookDetail.nameCyril")}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-800">
                    {book.name_cyril}
                  </dd>
                </div>
              )}
              {book.name_ru && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("bookDetail.nameRu")}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-800">
                    {book.name_ru}
                  </dd>
                </div>
              )}
            </dl>

            {/* Elektron nusxa */}
            {files.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-7">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-900">
                  {t("bookDetail.electronicCopy")}
                </h2>
                <div className="space-y-2">
                  {files.map((file) => {
                    const viewUrl = getFileViewUrl(file);
                    const canView = Boolean(viewUrl) || isPdfFile(file);

                    return (
                      <div
                        key={file.id}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500">
                          <FileText size={18} />
                        </div>
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                          {file.name || file.original_name || t("bookDetail.file")}
                        </p>
                        {canView && viewUrl && (
                          <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            {t("bookDetail.readOnline")}
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownload(file)}
                          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          <Download size={13} />
                          {t("bookDetail.download")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
