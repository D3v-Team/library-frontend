import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetAuthorByIdQuery } from "../../store/services/avtors.api";
import { useGetBooksQuery } from "../../store/services/books.api";
import { BASE_URL } from "../../store/api";
import { Button, EmptyState, Reveal, Skeleton } from "../../ui";
import { BookCard, PageMeta, PageShell, SectionHeader } from "../../patterns";
import SEO from "../../seo/SEO";

const imageUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

/** Muallif sahifasi — ostida uning kitoblari (yonma-yon havolalar) */
export default function AuthorDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const { data, isLoading, error } = useGetAuthorByIdQuery(id);
  const author = data?.data ?? data;

  const booksQuery = useGetBooksQuery({ page: 1, limit: 24, author_id: id }, { skip: !id });
  const books = booksQuery.data?.data ?? [];

  if (isLoading) {
    return (
      <PageShell breadcrumbs={[{ label: t("author.heading"), to: "/authors" }]} title={t("authorDetail.loading")}>
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <Skeleton className="aspect-[3/4] w-full" rounded="card" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !author) {
    return (
      <PageShell breadcrumbs={[{ label: t("author.heading"), to: "/authors" }]} title={t("authorDetail.notFound")}>
        <EmptyState
          title={t("authorDetail.notFound")}
          description={t("authorDetail.notFoundHint")}
          actions={
            <Button size="sm" variant="primary" to="/authors">
              {t("author.heading")}
            </Button>
          }
        />
      </PageShell>
    );
  }

  const name = pick(author, "full_name");
  const first = Array.isArray(author.images) ? author.images[0] : null;
  const photo = imageUrl(first?.url || first?.image_url || first?.path);
  const biography = pick(author, "biography");
  const nationality = pick(author, "nationality");

  return (
    <>
      <SEO title={name} description={biography?.slice(0, 160) || t("author.description")} image={photo} />

      <PageShell
        breadcrumbs={[{ label: t("author.heading"), to: "/authors" }, { label: name }]}
        eyebrow={nationality || t("author.badge")}
        title={name}
        meta={
          <>
            <PageMeta label={t("authorDetail.books")} value={books.length || "—"} />
            {author.birth_date && (
              <PageMeta label={t("authorDetail.birth")} value={formatDate(author.birth_date)} />
            )}
            {author.death_date && (
              <PageMeta label={t("authorDetail.death")} value={formatDate(author.death_date)} />
            )}
          </>
        }
      >
        <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
          <div className="mx-auto w-full max-w-[260px] lg:mx-0">
            <span className="relative block aspect-[3/4] overflow-hidden rounded-card bg-ink-deep shadow-s1">
              {photo ? (
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <>
                  <span aria-hidden="true" className="girih-tile absolute inset-0" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-[3rem] font-semibold text-gold/70">
                      {name?.charAt(0)}
                    </span>
                  </span>
                </>
              )}
            </span>
          </div>

          <div className="flex flex-col gap-8">
            {biography ? (
              <div className="prose">
                <p>{biography}</p>
              </div>
            ) : (
              <p className="font-sans text-[0.9rem] text-fg-muted">{t("authorDetail.noBio")}</p>
            )}

            <div>
              <Button variant="secondary" to="/authors" iconStart={<ArrowLeft size={16} />}>
                {t("authorDetail.back")}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-line pt-14">
          <SectionHeader
            eyebrow={t("books.badge")}
            title={t("authorDetail.booksTitle", { name })}
            action={
              books.length > 0 ? (
                <Button variant="secondary" to={`/books?author=${id}`}>
                  {t("bookDetail.allByAuthor")}
                </Button>
              ) : null
            }
          />

          <div className="mt-8">
            {booksQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] w-full" rounded="card" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <EmptyState
                title={t("authorDetail.noBooks")}
                description={t("authorDetail.noBooksHint")}
                actions={
                  <Button size="sm" variant="primary" to="/books">
                    {t("books.heading")}
                  </Button>
                }
              />
            ) : (
              <Reveal className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
                {books.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </Reveal>
            )}
          </div>
        </div>
      </PageShell>
    </>
  );
}
