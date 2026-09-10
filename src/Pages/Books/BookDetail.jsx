import { BookOpen, Download, FileText, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetBookByIdQuery, useGetBooksQuery } from "../../store/services/books.api";
import {
  formatBookYear,
  getBookCoverUrl,
  getBookFiles,
  getBookGenreIds,
  getBookGenreNames,
  getFileViewUrl,
  isPdfFile,
} from "./bookHelpers";
import { Badge, Button, EmptyState, Rail, Skeleton } from "../../ui";
import { BookCard, PageMeta, PageShell, SectionHeader } from "../../patterns";
import SEO from "../../seo/SEO";

/**
 * Kitob sahifasi.
 *
 * "Boylik retsepti" ning ikkinchi qoidasi bu yerda ko'rinadi: sahifa
 * boshi berk ko'cha bo'lmaydi. Pastda ikki tavsiya relsi —
 * shu muallifning boshqa kitoblari va shu janrdagi nashrlar.
 * Ilgari kitob sahifasi tugagach hech qayerga yo'l qolmasdi.
 */
export default function BookDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const { data: book, isLoading, error } = useGetBookByIdQuery(id);

  const authorId = book?.author?.id || book?.author_id;
  const genreIds = getBookGenreIds(book ?? {});

  /* Tavsiyalar — faqat kitob kelgandan keyin so'raladi */
  const byAuthor = useGetBooksQuery(
    { page: 1, limit: 12, author_id: authorId },
    { skip: !authorId },
  );
  const byGenre = useGetBooksQuery(
    { page: 1, limit: 12, genre_id: genreIds[0] },
    { skip: !genreIds[0] },
  );

  const sameAuthor = (byAuthor.data?.data ?? []).filter((b) => b.id !== id);
  const sameGenre = (byGenre.data?.data ?? []).filter(
    (b) => b.id !== id && !sameAuthor.some((a) => a.id === b.id),
  );

  if (isLoading) {
    return (
      <PageShell breadcrumbs={[{ label: t("books.heading"), to: "/books" }]} title={t("bookDetail.loading")}>
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <Skeleton className="aspect-[2/3] w-full" rounded="card" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !book) {
    return (
      <PageShell breadcrumbs={[{ label: t("books.heading"), to: "/books" }]} title={t("bookDetail.notFound")}>
        <EmptyState
          title={t("bookDetail.notFound")}
          description={t("bookDetail.notFoundHint")}
          actions={
            <Button size="sm" variant="primary" to="/books">
              {t("books.heading")}
            </Button>
          }
        />
      </PageShell>
    );
  }

  const title = pick(book, "name") || t("books.unknown");
  const author = pick(book?.author, "full_name");
  const description = pick(book, "description");
  const cover = getBookCoverUrl(book);
  const genres = getBookGenreNames(book);
  const files = getBookFiles(book);
  const pdf = files.find(isPdfFile);
  const year = formatBookYear(book.published_date);

  return (
    <>
      <SEO title={title} description={description || t("books.description")} image={cover} />

      <PageShell
        breadcrumbs={[{ label: t("books.heading"), to: "/books" }, { label: title }]}
        eyebrow={author || t("books.badge")}
        title={title}
        meta={
          <>
            <PageMeta label={t("bookDetail.year")} value={year ?? "—"} />
            {book.grade_level != null && (
              <PageMeta label={t("bookDetail.grade")} value={book.grade_level} />
            )}
            <PageMeta label={t("bookDetail.files")} value={files.length || "—"} />
          </>
        }
        actions={
          pdf ? (
            <Button
              variant="primary"
              href={getFileViewUrl(pdf)}
              target="_blank"
              rel="noopener noreferrer"
              iconStart={<BookOpen size={16} />}
            >
              {t("bookDetail.read")}
            </Button>
          ) : null
        }
      >
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
          {/* ---------- Muqova ---------- */}
          <div className="u-tilt-wrap mx-auto w-full max-w-[280px] lg:mx-0">
            <span className="u-tilt relative block aspect-[2/3] overflow-hidden rounded-card bg-ink-deep shadow-s2">
              {cover ? (
                <img src={cover} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center p-6">
                  <span className="text-center font-display text-[1rem] leading-snug text-on-ink/80">
                    {title}
                  </span>
                </span>
              )}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-transparent via-gold to-transparent"
              />
              <span className="u-tilt-glint" />
            </span>
          </div>

          {/* ---------- Ma'lumot ---------- */}
          <div className="flex flex-col gap-8">
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <Badge key={g}>{g}</Badge>
                ))}
                {pdf && <Badge tone="olive">{t("bookDetail.hasDigital")}</Badge>}
              </div>
            )}

            {description && (
              <div className="prose">
                <p>{description}</p>
              </div>
            )}

            {/* Kontekst metadata — mono, ustunda tekislangan */}
            <dl className="grid gap-x-10 gap-y-4 border-t border-line pt-6 sm:grid-cols-2">
              {[
                { label: t("bookDetail.author"), value: author },
                { label: t("bookDetail.nationality"), value: pick(book?.author, "nationality") },
                { label: t("bookDetail.published"), value: formatDate(book.published_date) },
                { label: t("bookDetail.titleCyril"), value: book.name_cyril },
                { label: t("bookDetail.titleRu"), value: book.name_ru },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div key={row.label} className="flex flex-col gap-1">
                    <dt className="font-sans text-[0.72rem] uppercase tracking-[0.1em] text-fg-faint">
                      {row.label}
                    </dt>
                    <dd className="font-display text-[0.95rem] text-fg">{row.value}</dd>
                  </div>
                ))}
            </dl>

            {/* Fayllar */}
            {files.length > 0 && (
              <div>
                <h2 className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-gold-dim">
                  {t("bookDetail.files")}
                </h2>

                <ul className="mt-4 border-t border-line">
                  {files.map((file, i) => (
                    <li key={file.id ?? i} className="border-b border-line-soft">
                      <a
                        href={getFileViewUrl(file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-3.5 transition-colors duration-1 ease-out-soft hover:text-accent"
                      >
                        <FileText size={16} strokeWidth={1.8} className="shrink-0 text-gold-dim" />
                        <span className="min-w-0 flex-1 truncate font-sans text-[0.88rem] text-fg">
                          {file.name || file.original_name || file.filename || t("bookDetail.file")}
                        </span>
                        <Download size={15} strokeWidth={1.8} className="shrink-0 text-fg-faint" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {authorId && (
              <div>
                <Button variant="secondary" to={`/authors/${authorId}`} iconStart={<User size={15} />}>
                  {t("bookDetail.authorPage")}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ---------- Yonma-yon havolalar: sahifa berk ko'cha bo'lmaydi ---------- */}
        {sameAuthor.length > 0 && (
          <div className="mt-20 border-t border-line pt-14">
            <SectionHeader
              eyebrow={t("bookDetail.related")}
              title={t("bookDetail.sameAuthor", { name: author })}
              action={
                <Button variant="secondary" to={`/books?author=${authorId}`}>
                  {t("bookDetail.allByAuthor")}
                </Button>
              }
            />
            <div className="mt-8">
              <Rail label={t("bookDetail.sameAuthor", { name: author })}>
                {sameAuthor.map((b) => (
                  <div key={b.id} className="w-40">
                    <BookCard book={b} />
                  </div>
                ))}
              </Rail>
            </div>
          </div>
        )}

        {sameGenre.length > 0 && (
          <div className="mt-16 border-t border-line pt-14">
            <SectionHeader
              eyebrow={t("bookDetail.related")}
              title={t("bookDetail.sameGenre", { name: genres[0] })}
              action={
                <Button variant="secondary" to={`/books?genre=${genreIds[0]}`}>
                  {t("bookDetail.allByGenre")}
                </Button>
              }
            />
            <div className="mt-8">
              <Rail label={t("bookDetail.sameGenre", { name: genres[0] })}>
                {sameGenre.map((b) => (
                  <div key={b.id} className="w-40">
                    <BookCard book={b} />
                  </div>
                ))}
              </Rail>
            </div>
          </div>
        )}
      </PageShell>
    </>
  );
}
