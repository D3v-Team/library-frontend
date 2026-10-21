import { MapPin } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetEventsQuery } from "../../store/services/events";
import { EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell, Pagination } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

/**
 * Tadbirlar ro'yxati.
 *
 * Taqvim ohangi: sana bloki + nom + joy. Bitta umumiy ro'yxat —
 * o'tgan/kelayotgan bo'yicha ajratilmaydi va so'rovda ham
 * filtrlanmaydi. Sahifalash serverda: GET /events?page&limit.
 */
const LIMIT = 12;

export default function Events() {
  const { t } = useTranslation();
  const { pick, formatMonth, formatDate } = useLocalized();

  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);

  const { data, isLoading, isFetching, error } = useGetEventsQuery({
    page,
    limit: LIMIT,
    sortBy: "event_date",
    sortOrder: "desc",
  });

  const shown = data?.data ?? [];
  const total = data?.meta?.total;
  const totalPages = Math.max(1, data?.meta?.totalPages ?? Math.ceil((total ?? 0) / LIMIT));

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: key !== "page" });
  };

  return (
    <>
      <SEO {...SEO_CONFIG.events} />

      <PageShell
        breadcrumbs={[{ label: t("events.heading") }]}
        eyebrow={t("events.badge")}
        title={t("events.heading")}
        lede={t("events.description")}
        meta={<PageMeta label={t("events.metaTotal")} value={total ?? "—"} />}
      >
        {error ? (
          <EmptyState title={t("events.error")} />
        ) : isLoading ? (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-5">
                <Skeleton className="h-20 w-20 shrink-0" rounded="card" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState title={t("events.empty")} description={t("events.emptyHint")} />
        ) : (
          <>
            <Reveal as="ul" className="flex flex-col border-t border-line">
              {shown.map((event) => {
                const d = event.event_date ? new Date(event.event_date) : null;
                const valid = d && !Number.isNaN(d.getTime());
                const location = pick(event, "location");

                return (
                  <li key={event.id} className="border-b border-line-soft">
                    <Link
                      to={`/events/${event.id}`}
                      className="-mx-3 flex items-center gap-5 rounded-field px-3 py-5 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
                    >
                      <span
                        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-card border border-line bg-page"
                      >
                        {valid ? (
                          <>
                            <span className="font-display text-[1.6rem] font-semibold leading-none text-ink tabular">
                              {d.getDate()}
                            </span>
                            <span className="mt-1 font-sans text-[0.64rem] uppercase tracking-[0.1em] text-gold-dim">
                              {formatMonth(d, { short: true })}
                            </span>
                            <span className="font-mono text-[0.6rem] text-fg-faint tabular">
                              {d.getFullYear()}
                            </span>
                          </>
                        ) : (
                          <span className="font-mono text-[0.72rem] text-fg-faint">—</span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block line-clamp-2 font-display text-[1.05rem] font-medium leading-snug text-fg">
                          {pick(event, "title")}
                        </span>

                        {location && (
                          <span className="mt-1.5 flex items-center gap-1.5 font-sans text-[0.82rem] text-fg-muted">
                            <MapPin size={13} strokeWidth={1.8} className="shrink-0 text-gold-dim" />
                            <span className="truncate">{location}</span>
                          </span>
                        )}

                        {valid && (
                          <span className="mt-1 block font-mono text-[0.72rem] text-fg-faint tabular">
                            {formatDate(d)}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </Reveal>

            <div className="mt-14">
              <Pagination
                page={page}
                totalPages={totalPages}
                disabled={isFetching}
                onChange={(p) => setParam("page", p > 1 ? String(p) : "")}
              />
            </div>
          </>
        )}
      </PageShell>
    </>
  );
}
