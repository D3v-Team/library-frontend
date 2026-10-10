import { useEffect, useRef, useState } from "react";
import { CalendarDays, MonitorSmartphone, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import cx from "../../../lib/cx";
import useReducedMotion from "../../../lib/useReducedMotion";
import { useLocalized } from "../../../lib/useLocalized";
import { useGetStatisticsQuery } from "../../../store/services/statistics.api";
import { Reveal, Skeleton } from "../../../ui";
import { SectionHeader } from "../../../patterns";

/**
 * 03 — Kutubxona raqamlarda. YANGI.
 *
 * Raqamlar admin paneldan kiritiladi (`/api/statistics`) — bu
 * katalogdagi yozuvlar soni emas, kutubxonaning RASMIY hisoboti:
 * fonddagi nusxalar, kitobxonlar, elektron resurslar.
 *
 * Tuzilma:
 *   chapda  — fond: umumiy son + tarkib chizig'i (badiiy / sohaga oid)
 *   o'ngda  — uch ko'rsatkich: kitobxonlar, elektron resurslar, tadbirlar
 *
 * Qoida StatRibbon dagi kabi: son kelmasa — u chizilmaydi. Hech
 * narsa kelmasa butun bo'lim yo'qoladi.
 */

/** Son ko'ringanda 0 dan sanab chiqadi. Reduced-motion da darhol. */
function CountUp({ value, format }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    let frame;
    const run = () => {
      const start = performance.now();
      const duration = 1100;

      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        // easeOutCubic — oxirida sekinlashadi
        const eased = 1 - (1 - p) ** 3;
        setShown(Math.round(value * eased));
        if (p < 1) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.4 },
    );
    io.observe(node);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, reduced]);

  return (
    <span ref={ref} className="tabular">
      {/* Ekran o'qish dasturi oxirgi sonni eshitadi, sanashni emas */}
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export default function StatsBand() {
  const { t } = useTranslation();
  const { formatNumber, formatDate } = useLocalized();
  const { data, isLoading, error } = useGetStatisticsQuery();

  const stats = data?.data ?? data;

  const fund = {
    copies: num(stats?.total_books_copies),
    titles: num(stats?.total_books_titles),
  };

  const parts = [
    {
      key: "fiction",
      copies: num(stats?.fiction_books_copies),
      titles: num(stats?.fiction_books_titles),
      tone: "bg-gold",
    },
    {
      key: "specialized",
      copies: num(stats?.specialized_books_copies),
      titles: num(stats?.specialized_books_titles),
      tone: "bg-ink",
    },
  ].filter((p) => p.copies != null);

  // Ulush umumiy fonddan hisoblanadi; umumiy son kiritilmagan bo'lsa —
  // qismlar yig'indisidan
  const partsTotal = parts.reduce((sum, p) => sum + p.copies, 0);
  const base = fund.copies || partsTotal;

  const metrics = [
    { key: "readers", icon: Users, value: num(stats?.total_readers) },
    { key: "resources", icon: MonitorSmartphone, value: num(stats?.electronic_resources) },
    { key: "events", icon: CalendarDays, value: num(stats?.annual_events) },
  ].filter((m) => m.value != null);

  if (error) return null;
  if (!isLoading && fund.copies == null && parts.length === 0 && metrics.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-line-soft bg-page" aria-labelledby="stats-heading">
      <div className="mx-auto w-full max-w-container px-gut py-16 sm:py-20">
        <SectionHeader
          eyebrow={t("statistics.badge")}
          title={
            <span id="stats-heading">
              {t("statistics.heading")}{" "}
              <em className="not-italic text-gold-dim">{t("statistics.headingSuffix")}</em>
            </span>
          }
          lede={t("statistics.description")}
        />

        {isLoading ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            <Skeleton className="h-[300px] w-full" rounded="card" />
            <div className="grid gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px] w-full" rounded="card" />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            {/* ---------- Fond ---------- */}
            {(fund.copies != null || parts.length > 0) && (
              <article className="relative overflow-hidden rounded-card border border-line bg-paper-2 p-6 sm:p-8">
                {/* Kitob tanasi motivi — BookCard dagi tilla yon chiziq */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-transparent via-gold to-transparent"
                />

                <p className="font-sans text-eyebrow font-semibold uppercase text-gold-dim">
                  {t("statistics.fund")}
                </p>

                {fund.copies != null && (
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-[clamp(2.6rem,6vw,3.75rem)] font-semibold leading-none text-ink">
                      <CountUp value={fund.copies} format={formatNumber} />
                    </span>
                    <span className="font-sans text-[0.95rem] text-fg-muted">
                      {t("statistics.copies")}
                    </span>
                  </div>
                )}

                {fund.titles != null && (
                  <p className="mt-2 font-mono text-[0.82rem] text-fg-muted tabular">
                    {t("statistics.titlesLabel", { count: formatNumber(fund.titles) })}
                  </p>
                )}

                {parts.length > 0 && base > 0 && (
                  <div className="mt-8">
                    <p className="font-sans text-[0.72rem] uppercase tracking-[0.11em] text-fg-faint">
                      {t("statistics.composition")}
                    </p>

                    {/* Tarkib chizig'i */}
                    <div
                      className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-paper-3"
                      role="img"
                      aria-label={parts
                        .map((p) => `${t(`statistics.${p.key}`)} ${Math.round((p.copies / base) * 100)}%`)
                        .join(", ")}
                    >
                      {parts.map((p) => (
                        <span
                          key={p.key}
                          className={cx("h-full first:rounded-l-full last:rounded-r-full", p.tone)}
                          style={{ width: `${Math.min(100, (p.copies / base) * 100)}%` }}
                        />
                      ))}
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      {parts.map((p) => (
                        <div key={p.key} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className={cx("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", p.tone)}
                          />
                          <div className="min-w-0">
                            <dt className="font-display text-[0.95rem] font-medium text-fg">
                              {t(`statistics.${p.key}`)}
                            </dt>
                            <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 font-mono text-[0.8rem] text-fg-muted tabular">
                              <span className="text-[1.05rem] font-medium text-fg">
                                {formatNumber(p.copies)}
                              </span>
                              <span>{t("statistics.copies")}</span>
                              {p.titles != null && (
                                <span className="text-fg-faint">
                                  · {formatNumber(p.titles)} {t("statistics.titles")}
                                </span>
                              )}
                            </dd>
                            <dd className="mt-0.5 font-sans text-[0.75rem] text-fg-faint">
                              {t("statistics.share", { pct: Math.round((p.copies / base) * 100) })}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </article>
            )}

            {/* ---------- Ko'rsatkichlar ---------- */}
            {metrics.length > 0 && (
              <Reveal as="dl" className="grid content-start gap-5">
                {metrics.map(({ key, icon: Icon, value }) => (
                  <div
                    key={key}
                    className="flex items-center gap-5 rounded-card border border-line bg-paper-2 px-5 py-5 sm:px-6"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-ink text-gold">
                      <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <dt className="font-sans text-[0.72rem] uppercase tracking-[0.11em] text-fg-faint">
                        {t(`statistics.${key}`)}
                      </dt>
                      <dd className="mt-1 font-display text-[1.75rem] font-semibold leading-none text-ink">
                        <CountUp value={value} format={formatNumber} />
                      </dd>
                      <dd className="mt-1.5 truncate font-sans text-[0.78rem] text-fg-muted">
                        {t(`statistics.${key}Desc`)}
                      </dd>
                    </div>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        )}

        {stats?.updated_at && (
          <p className="mt-6 font-mono text-[0.72rem] text-fg-faint tabular">
            {t("statistics.updated", { date: formatDate(stats.updated_at) })}
          </p>
        )}
      </div>
    </section>
  );
}
