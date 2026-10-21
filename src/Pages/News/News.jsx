import { Images } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetNewsQuery } from "../../store/services/news.api";
import { EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell, Pagination } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";
import { dayLabel, groupByDay, newsCover, photoCount } from "./newsHelpers";

/**
 * Yangiliklar — kutubxonaning har kungi faoliyatidan fotolavhalar
 * (backend: GET /news — faqat chop etilganlar).
 *
 * Lenta kunlar bo'yicha: "Bugun", "Kecha", sana — har kun ostida o'sha
 * kungi postlar, foto birinchi o'rinda. Sahifalash serverda (`?page=`),
 * tartib — backend standarti (eng yangisi birinchi).
 */
const LIMIT = 12;

export default function News() {
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);

  const { data, isLoading, isFetching, error } = useGetNewsQuery({ page, limit: LIMIT });

  const items = data?.data ?? [];
  const total = data?.meta?.total;
  const totalPages = data?.meta?.totalPages ?? 1;

  const goPage = (p) => {
    const next = new URLSearchParams(params);
    if (p > 1) next.set("page", String(p));
    else next.delete("page");
    setParams(next);
  };

  return (
    <>
      <SEO {...SEO_CONFIG.news} />

      <PageShell
        breadcrumbs={[{ label: t("news.heading") }]}
        eyebrow={t("news.title")}
        title={t("news.heading")}
        lede={t("news.description")}
        meta={<PageMeta label={t("news.metaTotal")} value={total ?? "—"} />}
      >
        {error ? (
          <EmptyState title={t("news.error")} />
        ) : isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[16/10] w-full" rounded="card" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title={t("news.empty")} />
        ) : (
          <>
            <div className="flex flex-col gap-14">
              {groupByDay(items).map((group) => (
                <section key={group.key} aria-label={dayLabel(group.date, { t, formatDate })}>
                  {/* Kun sarlavhasi — lenta kunlik hisobot kabi o'qiladi */}
                  <div className="mb-6 flex items-baseline gap-4 border-b border-line pb-3">
                    <h2 className="font-display text-h3 font-semibold text-fg">
                      {dayLabel(group.date, { t, formatDate })}
                    </h2>
                    <span className="font-mono text-[0.74rem] text-fg-faint tabular">
                      {t("news.postsCount", { count: group.items.length })}
                    </span>
                  </div>

                  <Reveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => {
                      const cover = newsCover(item);
                      const photos = photoCount(item);

                      return (
                        <article key={item.id}>
                          <Link to={`/news/${item.id}`} className="group block">
                            <span className="relative block aspect-[4/3] overflow-hidden rounded-card bg-ink-deep">
                              {cover ? (
                                <img
                                  src={cover}
                                  alt=""
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-4 ease-out-soft group-hover:scale-[1.03]"
                                />
                              ) : (
                                <span aria-hidden="true" className="girih-tile absolute inset-0" />
                              )}

                              {photos > 1 && (
                                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-field bg-ink-deep/75 px-2 py-1 font-mono text-[0.72rem] text-white tabular backdrop-blur-sm">
                                  <Images size={13} strokeWidth={1.8} aria-hidden="true" />
                                  {t("news.photos", { count: photos })}
                                </span>
                              )}
                            </span>

                            <h3 className="mt-4 line-clamp-2 font-display text-[1.05rem] font-semibold leading-snug text-fg transition-colors duration-1 ease-out-soft group-hover:text-accent">
                              {pick(item, "title")}
                            </h3>
                          </Link>
                        </article>
                      );
                    })}
                  </Reveal>
                </section>
              ))}
            </div>

            <div className="mt-14">
              <Pagination page={page} totalPages={totalPages} disabled={isFetching} onChange={goPage} />
            </div>
          </>
        )}
      </PageShell>
    </>
  );
}
