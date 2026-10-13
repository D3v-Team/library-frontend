import { MapPin } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../../lib/cx";
import { useLocalized } from "../../lib/useLocalized";
import { useGetEventsQuery, useGetEventsWindowQuery } from "../../store/services/events";
import { Button, EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell, Pagination } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

/**
 * Tadbirlar ro'yxati.
 *
 * Taqvim ohangi: sana bloki + nom + joy. Yuqorida ikki tab —
 * kelayotgan va o'tgan tadbirlar. Ilgari hammasi bir ro'yxatda
 * aralash chiqardi, ya'ni "shu hafta nima bor?" savoliga javob
 * topib bo'lmasdi.
 *
 * Ajratish SERVERDA. Ilgari bitta 12 talik sahifa (yaratilgan sanasi
 * bo'yicha!) olinib, klientda bo'linardi: tab sonlari faqat 12 tani
 * hisoblardi, sahifalar bo'sh chiqardi, eski yaratilgan kelayotgan
 * tadbir esa oxirgi sahifalarga tushib qolardi.
 *
 *   kelayotganlar — GET /events?upcoming=true&sortBy=event_date&asc
 *   o'tganlar     — `event_date desc` ro'yxatida kelayotganlardan keyingi
 *                   qism (getEventsWindow; `upcoming=false` ga tayanmaymiz)
 */
const LIMIT = 12;

export default function Events() {
  const { t } = useTranslation();
  const { pick, formatMonth, formatDate } = useLocalized();

  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const when = params.get("when") === "past" ? "past" : "upcoming";

  const isUpcoming = when === "upcoming";

  // Kelayotganlar: o'z tabida — joriy sahifa, aks holda faqat soni (limit 1)
  const upRes = useGetEventsQuery({
    page: isUpcoming ? page : 1,
    limit: isUpcoming ? LIMIT : 1,
    upcoming: true,
    sortBy: "event_date",
    sortOrder: "asc",
  });
  const upTotal = upRes.data?.meta?.total;

  // O'tganlar: event_date desc da kelayotgan `upTotal` tadan keyingi oyna
  const pastRes = useGetEventsWindowQuery(
    { offset: (upTotal ?? 0) + (page - 1) * LIMIT, limit: LIMIT, sortBy: "event_date", sortOrder: "desc" },
    { skip: isUpcoming || upTotal == null },
  );

  // Kelayotganlar tabida o'tganlar sonini bilish uchun — jami tadbirlar
  const allRes = useGetEventsQuery({ page: 1, limit: 1 }, { skip: !isUpcoming });

  const allTotal = isUpcoming ? allRes.data?.meta?.total : pastRes.data?.meta?.total;
  const pastTotal = allTotal != null && upTotal != null ? Math.max(0, allTotal - upTotal) : null;

  const activeRes = isUpcoming ? upRes : pastRes;
  const shown = activeRes.data?.data ?? [];
  const activeTotal = isUpcoming ? upTotal : pastTotal;
  const totalPages = Math.max(1, Math.ceil((activeTotal ?? 0) / LIMIT));
  const total = allTotal;
  const isLoading = upRes.isLoading || (!isUpcoming && (pastRes.isLoading || pastRes.isUninitialized));
  const isFetching = activeRes.isFetching;
  const error = upRes.error || pastRes.error;


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
        meta={
          <>
            <PageMeta label={t("events.metaTotal")} value={total ?? "—"} />
            <PageMeta label={t("events.metaUpcoming")} value={upTotal || "—"} />
          </>
        }
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={when === "upcoming" ? "primary" : "ghost"}
              onClick={() => setParam("when", "")}
            >
              {t("events.upcoming")}
              <span className="ml-1.5 font-mono text-[0.7rem] opacity-60 tabular">
                {upTotal ?? "—"}
              </span>
            </Button>
            <Button
              size="sm"
              variant={when === "past" ? "primary" : "ghost"}
              onClick={() => setParam("when", "past")}
            >
              {t("events.past")}
              <span className="ml-1.5 font-mono text-[0.7rem] opacity-60 tabular">{pastTotal ?? "—"}</span>
            </Button>
          </div>
        }
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
          <EmptyState
            title={when === "past" ? t("events.emptyPast") : t("events.emptyUpcoming")}
            description={t("events.emptyHint")}
            actions={
              when === "past" ? (
                <Button size="sm" variant="primary" onClick={() => setParam("when", "")}>
                  {t("events.upcoming")}
                </Button>
              ) : (
                <Button size="sm" variant="primary" onClick={() => setParam("when", "past")}>
                  {t("events.past")}
                </Button>
              )
            }
          />
        ) : (
          <>
            <Reveal as="ul" className="flex flex-col border-t border-line">
              {shown.map((event) => {
                const d = event.event_date ? new Date(event.event_date) : null;
                const valid = d && !Number.isNaN(d.getTime());
                const location = pick(event, "location");
                const isPast = when === "past";

                return (
                  <li key={event.id} className="border-b border-line-soft">
                    <Link
                      to={`/events/${event.id}`}
                      className="-mx-3 flex items-center gap-5 rounded-field px-3 py-5 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
                    >
                      <span
                        className={cx(
                          "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-card border",
                          isPast ? "border-line-soft bg-paper-3" : "border-line bg-page",
                        )}
                      >
                        {valid ? (
                          <>
                            <span
                              className={cx(
                                "font-display text-[1.6rem] font-semibold leading-none tabular",
                                isPast ? "text-fg-faint" : "text-ink",
                              )}
                            >
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
