import { Search, UserRound, UsersRound, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import useDebouncedSearchParam from "../../lib/useDebouncedSearchParam";
import { BASE_URL } from "../../store/api";
import { Button, EmptyState, Input, Reveal, Select, Skeleton } from "../../ui";
import { PageMeta, PageShell, Pagination, ShelfSwitch } from "../../patterns";
import SEO from "../../seo/SEO";
import AuthorIndex from "./AuthorIndex";
import useAuthorShelves, { AUTHOR_SORTS } from "./useAuthorShelves";

/**
 * Mualliflar ko'rsatkichi.
 *
 * Ilgari hammasi BITTA so'rovda (`limit: 200`) olinib, alifbo indeksi
 * klientda tuzilardi. Excel importidan keyin mualliflar 2 000 dan
 * oshdi, backend esa `limit` ni 100 ga qirqadi — ya'ni sahifa
 * mualliflarning ~5% ini ko'rsatardi va indeks ham shu 5% dan
 * tuzilardi. Ustiga import nomlari bosh harfdan boshlanadi
 * ("A. Qodiriy"), ya'ni "A" harfi familiyani emas, ismni bildirardi.
 *
 * Endi: ism bo'yicha qidiruv (400 ms debounce), saralash va ikki
 * tortma (useAuthorShelves):
 *   Mualliflar              qo'lda kiritilganlar — portret kartochkalar
 *   Mualliflar ko'rsatkichi Excel importi — ixcham ism ro'yxati
 * Har tortmaning o'z sahifasi (`page` / `ipage`), butun holat URL da.
 */
const LIMIT = 24;
const INDEX_LIMIT = 60;

const imageUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

const authorImage = (author) => {
  const first = Array.isArray(author?.images) ? author.images[0] : null;
  return imageUrl(first?.url || first?.image_url || first?.path);
};

export default function Authors() {
  const { t } = useTranslation();
  const { pick, formatNumber } = useLocalized();

  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const sortKey = AUTHOR_SORTS[params.get("sort")] ? params.get("sort") : "az";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const indexPage = Math.max(1, Number(params.get("ipage")) || 1);
  const shelfParam = params.get("shelf");

  const update = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) {
      next.delete("page");
      next.delete("ipage");
    }
    setParams(next, { replace: resetPage });
  };

  const [term, setTerm] = useDebouncedSearchParam(search, (q) => update({ q }));

  const { shelf, profiles, index, isLoading, isFetching, error } = useAuthorShelves({
    search,
    sortKey,
    shelfParam,
    profilesPage: page,
    profilesSize: LIMIT,
    indexPage,
    indexSize: INDEX_LIMIT,
  });

  const active = shelf === "profiles" ? profiles : index;
  const other = shelf === "profiles" ? index : profiles;
  const otherKey = shelf === "profiles" ? "index" : "profiles";
  const total = isLoading ? null : profiles.total + index.total;
  const authors = profiles.items;

  const setShelf = (next) =>
    update({ shelf: next === "index" ? "korsatkich" : "profil" }, { resetPage: false });

  return (
    <>
      <SEO title={t("author.heading")} description={t("author.description")} />

      <PageShell
        breadcrumbs={[{ label: t("author.heading") }]}
        eyebrow={t("author.badge")}
        title={t("author.heading")}
        lede={t("author.description")}
        meta={
          <PageMeta
            label={t("author.metaTotal")}
            value={!search && total != null ? formatNumber(total) : null}
          />
        }
        filters={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-sm">
              <Search
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-faint"
              />
              <label htmlFor="authors-search" className="sr-only">
                {t("author.searchLabel")}
              </label>
              <Input
                id="authors-search"
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={t("author.search")}
                autoComplete="off"
                className="pl-10"
              />
            </div>

            <Select
              aria-label={t("author.sort")}
              value={sortKey}
              onChange={(e) => update({ sort: e.target.value === "az" ? "" : e.target.value })}
              className="sm:w-48"
            >
              <option value="az">{t("author.sortAz")}</option>
              <option value="za">{t("author.sortZa")}</option>
              <option value="new">{t("author.sortNew")}</option>
            </Select>

            <div className="flex items-center gap-2 sm:ml-auto">
              {!isLoading && (
                <span className="font-mono text-[0.78rem] text-fg-muted tabular">
                  {t("author.results", { count: formatNumber(active.total) })}
                </span>
              )}

              {search && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => update({ q: "" })}
                  iconStart={<X size={14} />}
                >
                  {t("author.clear")}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <ShelfSwitch
          label={t("author.shelfLabel")}
          shelves={[
            { key: "profiles", icon: UserRound, title: t("author.shelfProfiles"), hint: t("author.shelfProfilesHint") },
            { key: "index", icon: UsersRound, title: t("author.shelfIndex"), hint: t("author.shelfIndexHint") },
          ]}
          value={shelf}
          onChange={setShelf}
          loading={isLoading}
          counts={{ profiles: profiles.total, index: index.total }}
          panelId="authors-panel"
        />

        <div id="authors-panel" role="tabpanel" aria-labelledby={`shelf-tab-${shelf}`} className="mt-8">
          {error ? (
            <EmptyState title={t("author.error")} />
          ) : isLoading ? (
            shelf === "index" ? (
              <Skeleton className="h-[480px] w-full" rounded="card" />
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="aspect-[3/4] w-full" rounded="card" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            )
          ) : active.total === 0 && other.total > 0 ? (
            // Bu tortma bo'sh, qo'shnisida esa natija bor — o'sha yoqqa yo'l
            <EmptyState
              title={t("author.shelfEmpty")}
              description={t("author.shelfFoundThere", {
                shelf: t(otherKey === "index" ? "author.shelfIndex" : "author.shelfProfiles"),
                count: formatNumber(other.total),
              })}
              actions={
                <Button size="sm" variant="primary" onClick={() => setShelf(otherKey)}>
                  {t("author.shelfGo")}
                </Button>
              }
            />
          ) : active.total === 0 ? (
            <EmptyState
              title={search ? t("author.emptySearch", { term: search }) : t("author.empty")}
              description={search ? t("author.emptySearchHint") : undefined}
              actions={
                search ? (
                  <Button size="sm" variant="primary" onClick={() => update({ q: "" })}>
                    {t("author.all")}
                  </Button>
                ) : null
              }
            />
          ) : shelf === "index" ? (
            <AuthorIndex
              authors={index.items}
              total={index.total}
              page={indexPage}
              pageSize={INDEX_LIMIT}
              totalPages={index.totalPages}
              disabled={isFetching}
              onPageChange={(p) => update({ ipage: p > 1 ? String(p) : "" }, { resetPage: false })}
            />
          ) : (
            <>
              <Reveal
                key={`${search}|${sortKey}|${page}`}
                className={`grid grid-cols-2 gap-x-5 gap-y-8 transition-opacity duration-1 ease-out-soft sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 ${
                  isFetching ? "opacity-60" : ""
                }`}
              >
                {authors.map((author) => {
                  const name = pick(author, "full_name") || t("author.unknownName");
                  const photo = authorImage(author);
                  const nationality = pick(author, "nationality");

                  return (
                    <article key={author.id}>
                      <Link to={`/authors/${author.id}`} className="group block u-lift rounded-card">
                        <span className="relative block aspect-[3/4] overflow-hidden rounded-card bg-ink-deep">
                          {photo ? (
                            <img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" />
                          ) : (
                            <>
                              <span aria-hidden="true" className="girih-tile absolute inset-0" />
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="font-display text-[2.4rem] font-semibold text-gold/70">
                                  {name.charAt(0)}
                                </span>
                              </span>
                            </>
                          )}
                        </span>

                        <h2 className="mt-3 line-clamp-2 [overflow-wrap:anywhere] font-display text-[0.95rem] font-semibold leading-snug text-fg">
                          {name}
                        </h2>

                        {nationality && (
                          <p className="mt-0.5 font-sans text-[0.8rem] text-fg-muted">{nationality}</p>
                        )}
                      </Link>
                    </article>
                  );
                })}
              </Reveal>

              <div className="mt-14">
                <Pagination
                  page={page}
                  totalPages={profiles.totalPages}
                  disabled={isFetching}
                  onChange={(p) => update({ page: p > 1 ? String(p) : "" }, { resetPage: false })}
                  labels={{ nav: t("author.pagination"), prev: t("media.prevPage"), next: t("media.nextPage") }}
                />
              </div>
            </>
          )}
        </div>
      </PageShell>
    </>
  );
}
