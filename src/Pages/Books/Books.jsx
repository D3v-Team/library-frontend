import { useMemo } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../../lib/cx";
import { useLocalized } from "../../lib/useLocalized";
import { useGetBooksQuery } from "../../store/services/books.api";
import { useGetAuthorsQuery } from "../../store/services/avtors.api";
import { useGetGenresQuery } from "../../store/services/genres";
import { Button, EmptyState, Input, Reveal, Select, Skeleton } from "../../ui";
import { BookCard, PageMeta, PageShell, Pagination } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

/**
 * Kitoblar katalogi.
 *
 * Buyurtmachi: «kitoblar katalogida muammo ko'proq, kitoblar juda
 * katta bo'lib ketgan». O'lchov bilan hal qilindi:
 *
 *   eski:  lg:grid-cols-4 + aspect-[3/4]  → ~290×387px, ekranda 4 kitob
 *   yangi: 2xl:grid-cols-6 + aspect-[2/3] → ~186×279px, ekranda 18 kitob
 *
 * Ustiga: ro'yxat ko'rinishi (skanerlash uchun), butun filtr holati
 * URL da (havola ulashiladi, orqaga tugmasi ishlaydi) va oyna
 * paginatsiyasi (ilgari 100 sahifa = 100 tugma edi).
 */
const LIMIT = 24;

export default function Books() {
  const { t } = useTranslation();
  const { pick, formatNumber } = useLocalized();

  /* ---------- Butun holat URL da ----------
     Ilgari faqat `q` URL da, muallif/janr/sahifa esa useState da edi.
     Natijada filtrlangan natijani ulashish ham, orqaga qaytish ham
     ishlamasdi. */
  const [params, setParams] = useSearchParams();

  const search = params.get("q") ?? "";
  const author = params.get("author") ?? "";
  const genre = params.get("genre") ?? "";
  const view = params.get("view") === "list" ? "list" : "grid";
  const sort = params.get("sort");
  const page = Math.max(1, Number(params.get("page")) || 1);

  const update = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(params);

    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("page");

    // replace: qidiruvda har harf uchun tarix yozuvi yaratilmaydi
    setParams(next, { replace: resetPage });
  };

  const { data, isLoading, isFetching, error } = useGetBooksQuery({
    page,
    limit: LIMIT,
    search,
    author_id: author || undefined,
    genre_id: genre || undefined,
    ...(sort === "new" ? { sortBy: "created_at", sortOrder: "desc" } : {}),
  });

  const { data: authorsData } = useGetAuthorsQuery({ page: 1, limit: 100 });
  const { data: genresData } = useGetGenresQuery({ page: 1, limit: 100 });

  const books = data?.data ?? [];
  const total = data?.meta?.total;
  const totalPages = data?.meta?.totalPages ?? 1;

  /* `?? []` har renderda yangi massiv qaytaradi — uni useMemo
     bog'liqligiga bersak memo hech qachon ishlamaydi. */
  const authors = useMemo(() => authorsData?.data ?? [], [authorsData]);
  const genres = useMemo(() => genresData?.data ?? [], [genresData]);

  const hasFilter = Boolean(search || author || genre || sort);

  /* ---------- SEO ---------- */
  const seo = useMemo(() => {
    if (search) {
      return {
        title: t("books.seo.search", { term: search }),
        description: t("books.seo.searchDesc", { term: search }),
      };
    }
    if (author) {
      const found = authors.find((a) => a.id === author);
      if (found) {
        const name = pick(found, "full_name");
        return { title: t("books.seo.author", { name }), description: t("books.seo.authorDesc", { name }) };
      }
    }
    if (genre) {
      const found = genres.find((g) => g.id === genre);
      if (found) {
        const name = pick(found, "name");
        return { title: t("books.seo.genre", { name }), description: t("books.seo.genreDesc", { name }) };
      }
    }
    return {};
  }, [search, author, genre, authors, genres, pick, t]);

  return (
    <>
      <SEO {...SEO_CONFIG.books} {...seo} />

      <PageShell
        breadcrumbs={[{ label: t("books.heading") }]}
        eyebrow={t("books.badge")}
        title={t("books.heading")}
        lede={t("books.description")}
        meta={
          <>
            <PageMeta label={t("books.total")} value={total != null ? formatNumber(total) : "—"} />
            <PageMeta label={t("books.metaAuthors")} value={authors.length || "—"} />
            <PageMeta label={t("books.metaGenres")} value={genres.length || "—"} />
          </>
        }
        filters={
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-sm">
              <Search
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-faint"
              />
              <label htmlFor="catalog-search" className="sr-only">
                {t("books.search")}
              </label>
              <Input
                id="catalog-search"
                type="search"
                value={search}
                onChange={(e) => update({ q: e.target.value })}
                placeholder={t("books.search")}
                className="pl-10"
              />
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3 sm:flex sm:items-center">
              <Select
                aria-label={t("books.allAuthors")}
                value={author}
                onChange={(e) => update({ author: e.target.value })}
                className="sm:w-48"
              >
                <option value="">{t("books.allAuthors")}</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {pick(a, "full_name")}
                  </option>
                ))}
              </Select>

              <Select
                aria-label={t("books.allGenres")}
                value={genre}
                onChange={(e) => update({ genre: e.target.value })}
                className="sm:w-44"
              >
                <option value="">{t("books.allGenres")}</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {pick(g, "name")}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2 lg:ml-auto">
              {/* Natija soni shu yerda: ilgari u grid ustida alohida qator
                  bo'lib turardi va lentadagi "Jami kitoblar 7" bilan bir
                  xil sonni takrorlardi. Filtr yonida esa u kontekstda —
                  filtr o'zgarganda darhol ko'zga tashlanadi. */}
              <span className="mr-1 hidden font-mono text-[0.78rem] text-fg-muted tabular sm:inline">
                {t("books.results", { count: formatNumber(total ?? books.length) })}
              </span>

              {hasFilter && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setParams(new URLSearchParams(), { replace: true })}
                  iconStart={<X size={14} />}
                >
                  {t("books.clear")}
                </Button>
              )}

              {/* Grid ↔ ro'yxat — ro'yxat skanerlash uchun */}
              <div
                role="group"
                aria-label={t("books.view")}
                className="flex overflow-hidden rounded-field border border-line"
              >
                {[
                  { key: "grid", icon: LayoutGrid, label: t("books.viewGrid") },
                  { key: "list", icon: List, label: t("books.viewList") },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update({ view: key === "grid" ? "" : key }, { resetPage: false })}
                    aria-pressed={view === key}
                    aria-label={label}
                    className={cx(
                      "inline-flex h-11 w-11 items-center justify-center transition-colors duration-1 ease-out-soft",
                      view === key
                        ? "bg-ink text-on-ink"
                        : "text-fg-muted hover:bg-paper-3 hover:text-fg",
                    )}
                  >
                    <Icon size={16} strokeWidth={1.9} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      >
        {error ? (
          <EmptyState
            title={t("books.error")}
            actions={
              <Button size="sm" variant="primary" onClick={() => window.location.reload()}>
                {t("media.retry")}
              </Button>
            }
          />
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                <Skeleton className="aspect-[2/3] w-full" rounded="card" />
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            title={t("books.empty")}
            description={hasFilter ? t("books.emptyFiltered") : t("books.emptyHint")}
            actions={
              hasFilter ? (
                <>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setParams(new URLSearchParams(), { replace: true })}
                  >
                    {t("books.clear")}
                  </Button>
                  <Button size="sm" variant="secondary" to="/authors">
                    {t("header.authors")}
                  </Button>
                </>
              ) : null
            }
          />
        ) : (
          <>
            {view === "list" ? (
              <div className="border-t border-line">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} variant="row" />
                ))}
              </div>
            ) : (
              <Reveal className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </Reveal>
            )}

            <div className="mt-14">
              <Pagination
                page={page}
                totalPages={totalPages}
                disabled={isFetching}
                onChange={(p) => update({ page: p > 1 ? String(p) : "" }, { resetPage: false })}
                labels={{ nav: t("books.pagination"), prev: t("media.prevPage"), next: t("media.nextPage") }}
              />
            </div>
          </>
        )}
      </PageShell>
    </>
  );
}
