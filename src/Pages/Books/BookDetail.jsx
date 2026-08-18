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

  // Tilga qarab kitob nomini olish
  const getBookName = () => {
    if (!book) return "";
    const lang = i18n.language;
    if (lang === "uz") return book.name_latin;
    if (lang === "ru") return book.name_ru;
    if (lang === "cyrl") return book.name_cyril;
    return book.name_latin || "Nomsiz";
  };

  // Tilga qarab author nomini olish
  const getAuthorName = () => {
    if (!book?.author) return t("bookDetail.unknownAuthor");
    const lang = i18n.language;
    if (lang === "uz") return book.author.full_name_latin;
    if (lang === "ru") return book.author.full_name_ru;
    if (lang === "cyrl") return book.author.full_name_cyril;
    return book.author.full_name_latin || t("bookDetail.unknownAuthor");
  };

  // Tilga qarab description olish
  const getDescription = () => {
    if (!book) return "";
    const lang = i18n.language;
    if (lang === "uz") return book.description_latin;
    if (lang === "ru") return book.description_ru;
    if (lang === "cyrl") return book.description_cyril;
    return book.description_latin || "";
  };

  // Tilga qarab author nationality olish
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

  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SEO title={t("bookDetail.loading")} description={t("bookDetail.loadingDesc")} />
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100" />
          <div className="space-y-3 sm:col-span-2">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !book) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <SEO
          title={t("bookDetail.notFound")}
          description={t("bookDetail.notFoundDesc")}
          noIndex
        />
        <p className="text-sm text-slate-500">
          {t("bookDetail.notFoundError")}
        </p>
        <Link
          to="/books"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft size={15} /> {t("bookDetail.back")}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <SEO
        title={bookName}
        description={truncateForMeta(
          description || `${bookName} — ${authorName}`,
        )}
        image={cover}
        type="book"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: bookName,
          author: authorName
            ? { "@type": "Person", name: authorName }
            : undefined,
          image: cover || undefined,
          description: truncateForMeta(description),
        }}
      />

      <Link
        to="/books"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={15} /> {t("bookDetail.back")}
      </Link>

      <div className="grid gap-10 sm:grid-cols-3">
        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
          {cover ? (
            <img
              src={cover}
              alt={bookName}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <BookOpen size={36} />
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {bookName}
          </h1>
          <p className="mt-2 text-base text-slate-500">
            {authorName}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {genres.map((name) => (
              <span
                key={name}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {name}
              </span>
            ))}
          </div>

          {description && (
            <p className="mt-6 text-sm leading-6 text-slate-600">
              {description}
            </p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-400">{t("bookDetail.publishDate")}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {formatBookDate(book.published_date) || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t("bookDetail.publishYear")}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {formatBookYear(book.published_date) || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t("bookDetail.gradeLevel")}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {book.grade_level != null ? `${book.grade_level}-${t("bookDetail.grade")}` : "—"}
              </dd>
            </div>
            {book.name_cyril && (
              <div>
                <dt className="text-xs text-slate-400">{t("bookDetail.nameCyril")}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {book.name_cyril}
                </dd>
              </div>
            )}
            {book.name_ru && (
              <div>
                <dt className="text-xs text-slate-400">{t("bookDetail.nameRu")}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {book.name_ru}
                </dd>
              </div>
            )}
            {getNationality() && (
              <div>
                <dt className="text-xs text-slate-400">{t("bookDetail.nationality")}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {getNationality()}
                </dd>
              </div>
            )}
          </dl>

          {files.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                {t("bookDetail.electronicCopy")}
              </h2>
              <div className="space-y-2">
                {files.map((file) => {
                  const viewUrl = getFileViewUrl(file);
                  const canViewOnline = Boolean(viewUrl) || isPdfFile(file);

                  return (
                    <div
                      key={file.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <FileText size={18} />
                      </div>
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                        {file.name || file.original_name || t("bookDetail.file")}
                      </p>

                      {canViewOnline && viewUrl && (
                        <a
                          href={viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {t("bookDetail.readOnline")}
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDownload(file)}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
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
    </section>
  );
}