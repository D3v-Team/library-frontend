import { useMemo } from "react";
import { Archive, BookOpen, LayoutGrid, List, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../../lib/cx";
import { useLocalized } from "../../lib/useLocalized";
import useDebouncedSearchParam from "../../lib/useDebouncedSearchParam";
import { useGetAuthorByIdQuery } from "../../store/services/avtors.api";
import { useGetGenresQuery } from "../../store/services/genres";
import { Button, EmptyState, Input, Reveal, Select, Skeleton } from "../../ui";
import { AuthorPicker, BookCard, PageMeta, PageShell, Pagination, ShelfSwitch } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";
import FondRegister from "./FondRegister";
import useShelfBooks from "./useShelfBooks";

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
 *
 * Ikki bo'lim — tepada tortmalar (ShelfSwitch):
 *   Katalog          qo'lda kiritilgan kitoblar, muqova gridi
 *   Fond kartotekasi Excel importi, jadval (sahifasi yo'q)
 * Har birining o'z sahifa raqami bor (`page` / `rpage`), ochiq
 * tortma `shelf` da — hammasi URL da. Ma'lumot useShelfBooks dan.
 */
const LIMIT = 24;
const REGISTER_LIMIT = 20;

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
  const registerPage = Math.max(1, Number(params.get("rpage")) || 1);
  const shelfParam = params.get("shelf");

  const update = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(params);

    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) {
      next.delete("page");
      next.delete("rpage");
    }

    // replace: qidiruvda har harf uchun tarix yozuvi yaratilmaydi
    setParams(next, { replace: resetPage });
  };

  // Qidiruv URL ga yozish to'xtagach 400 ms o'tib tushadi (har harfga so'rov ketmaydi)
  const [term, setTerm] = useDebouncedSearchParam(search, (q) => update({ q }));

  const { shelf, catalog, register, isLoading, isFetching, error } = useShelfBooks({
    filters: {
      search: search || undefined,
      author_id: author || undefined,
      genre_id: genre || undefined,
      // `sort` so'rovga kirmaydi: katalog doim eng yangisi birinchi,
      // kartoteka esa alifbo bo'yicha — ortiqcha cache kaliti bo'lmasin
    },
    shelfParam,
    catalogPage: page,
    catalogSize: LIMIT,
    registerPage,
    registerSize: REGISTER_LIMIT,
  });

  const { data: genresData } = useGetGenresQuery({ page: 1, limit: 50 });

  const active = shelf === "catalog" ? catalog : register;
  const other = shelf === "catalog" ? register : catalog;
  const otherKey = shelf === "catalog" ? "register" : "catalog";
  const total = isLoading ? null : catalog.total + register.total;

  // Kartotekada janr yo'q — tortma almashganda janr filtri tushiriladi,
  // aks holda kartoteka doim bo'sh ko'rinardi
  const setShelf = (next) =>
    update(
      next === "register" ? { shelf: "kartoteka", genre: "" } : { shelf: "katalog" },
      { resetPage: false },
    );

  /* Mualliflar ro'yxati sahifa ochilganda OLINMAYDI — AuthorPicker uni
     faqat ochilganda 25 tadan so'raydi. Tanlangan muallif (SEO sarlavhasi
     uchun) esa bitta so'rov, AuthorPicker bilan umumiy keshda. */
  const { data: selectedAuthorData } = useGetAuthorByIdQuery(author, { skip: !author });
  const selectedAuthor = selectedAuthorData?.data ?? selectedAuthorData;

  /* `?? []` har renderda yangi massiv qaytaradi — uni useMemo
     bog'liqligiga bersak memo hech qachon ishlamaydi. */
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
      if (selectedAuthor) {
        const name = pick(selectedAuthor, "full_name");
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
  }, [search, author, genre, selectedAuthor, genres, pick, t]);

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
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={t("books.search")}
                className="pl-10"
              />
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3 sm:flex sm:items-center">
              <AuthorPicker
                value={author}
                onChange={(id) => update({ author: id })}
                className="sm:w-56"
              />

              {/* Kartotekada janr yo'q — filtr ham ko'rsatilmaydi */}
              {shelf === "catalog" && (
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
              )}
            </div>

            <div className="flex items-center gap-2 lg:ml-auto">
              {/* Natija soni shu yerda: ilgari u grid ustida alohida qator
                  bo'lib turardi va lentadagi "Jami kitoblar 7" bilan bir
                  xil sonni takrorlardi. Filtr yonida esa u kontekstda —
                  filtr o'zgarganda darhol ko'zga tashlanadi. */}
              <span className="mr-1 hidden font-mono text-[0.78rem] text-fg-muted tabular sm:inline">
                {t("books.results", { count: formatNumber(active.total) })}
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

              {/* Grid ↔ ro'yxat — ro'yxat skanerlash uchun. Kartoteka
                  o'zi jadval, unga ko'rinish tanlash kerak emas. */}
              {shelf === "catalog" && (
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
              )}
            </div>
          </div>
        }
      >
        <ShelfSwitch
          label={t("books.shelfLabel")}
          shelves={[
            { key: "catalog", icon: BookOpen, title: t("books.shelfCatalog"), hint: t("books.shelfCatalogHint") },
            { key: "register", icon: Archive, title: t("books.shelfRegister"), hint: t("books.shelfRegisterHint") },
          ]}
          value={shelf}
          onChange={setShelf}
          loading={isLoading}
          counts={{ catalog: catalog.total, register: register.total }}
          panelId="shelf-panel"
        />

        <div
          id="shelf-panel"
          role="tabpanel"
          aria-labelledby={`shelf-tab-${shelf}`}
          className="mt-8"
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
            shelf === "register" ? (
              <Skeleton className="h-[420px] w-full" rounded="card" />
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2.5">
                    <Skeleton className="aspect-[2/3] w-full" rounded="card" />
                    <Skeleton className="h-3.5 w-4/5" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            )
          ) : active.total === 0 && other.total > 0 ? (
            // Bu tortma bo'sh, qo'shnisida esa natija bor — o'sha yoqqa yo'l
            <EmptyState
              title={t("books.shelfEmpty")}
              description={t("books.shelfFoundThere", {
                shelf: t(otherKey === "register" ? "books.shelfRegister" : "books.shelfCatalog"),
                count: formatNumber(other.total),
              })}
              actions={
                <Button size="sm" variant="primary" onClick={() => setShelf(otherKey)}>
                  {t("books.shelfGo")}
                </Button>
              }
            />
          ) : active.total === 0 ? (
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
          ) : shelf === "register" ? (
            <FondRegister
              books={register.items}
              total={register.total}
              page={registerPage}
              pageSize={REGISTER_LIMIT}
              totalPages={register.totalPages}
              disabled={isFetching}
              onPageChange={(p) => update({ rpage: p > 1 ? String(p) : "" }, { resetPage: false })}
            />
          ) : (
            <>
              {view === "list" ? (
                <div className="border-t border-line">
                  {catalog.items.map((book) => (
                    <BookCard key={book.id} book={book} variant="row" />
                  ))}
                </div>
              ) : (
                <Reveal className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
                  {catalog.items.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </Reveal>
              )}

              <div className="mt-14">
                <Pagination
                  page={page}
                  totalPages={catalog.totalPages}
                  disabled={isFetching}
                  onChange={(p) => update({ page: p > 1 ? String(p) : "" }, { resetPage: false })}
                  labels={{ nav: t("books.pagination"), prev: t("media.prevPage"), next: t("media.nextPage") }}
                />
              </div>
            </>
          )}
        </div>
      </PageShell>
    </>
  );
}
