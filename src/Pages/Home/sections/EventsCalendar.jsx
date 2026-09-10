import { useMemo, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../../../lib/cx";
import { useLocalized } from "../../../lib/useLocalized";
import { useGetEventsQuery } from "../../../store/services/events";
import { Button, EmptyState, Reveal, Skeleton } from "../../../ui";
import { SectionHeader } from "../../../patterns";

/**
 * 05 — Tadbirlar. Taqvim ohangi.
 *
 * Audit topilmasi: eski blok tadbirlarni kartochka karuselida
 * ko'rsatardi. Lekin tadbirni odam SANA bo'yicha qidiradi — "shu
 * hafta nima bor?" degan savolga karusel javob bermaydi.
 *
 * Endi: yuqorida oy lentasi (faqat tadbiri bor oylar), ostida
 * ro'yxat — sana bloki + nom + joy.
 */
export default function EventsCalendar() {
  const { t } = useTranslation();
  const { pick, formatMonth } = useLocalized();

  const { data, isLoading, error } = useGetEventsQuery({ page: 1, limit: 24 });
  const [month, setMonth] = useState(null);

  /* `data?.data ?? []` har renderda YANGI massiv qaytaradi, ya'ni
     uni useMemo bog'liqligiga bersak memo hech qachon ishlamaydi
     (har render qayta hisoblanadi). Shuning uchun massivning o'zi
     ham memo qilinadi va pastdagi memo `data` ga bog'lanadi. */
  const events = useMemo(() => data?.data ?? [], [data]);

  /* Oylarni tadbirlardan yig'amiz — bo'sh oy lentaga chiqmaydi */
  const months = useMemo(() => {
    const map = new Map();

    for (const e of events) {
      const d = e.event_date ? new Date(e.event_date) : null;
      if (!d || Number.isNaN(d.getTime())) continue;

      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: formatMonth(d),
          year: d.getFullYear(),
          count: 0,
        });
      }
      map.get(key).count += 1;
    }

    return [...map.values()];
  }, [events, formatMonth]);

  const shown = month
    ? events.filter((e) => {
        const d = new Date(e.event_date);
        return `${d.getFullYear()}-${d.getMonth()}` === month;
      })
    : events;

  return (
    <section className="border-t border-line-soft bg-paper-2">
      <div className="mx-auto w-full max-w-container px-gut py-16 sm:py-20">
        <SectionHeader
          eyebrow={t("events.badge")}
          title={t("home.events.title")}
          lede={t("home.events.lede")}
          action={
            <Button variant="secondary" to="/events" iconEnd={<ArrowRight size={16} />}>
              {t("home.events.all")}
            </Button>
          }
        />

        {/* ---------- Oy lentasi ---------- */}
        {months.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={month === null ? "primary" : "ghost"}
              onClick={() => setMonth(null)}
            >
              {t("home.events.allMonths")}
            </Button>

            {months.map((m) => (
              <Button
                key={m.key}
                size="sm"
                variant={month === m.key ? "primary" : "ghost"}
                onClick={() => setMonth(m.key)}
              >
                {m.label}
                <span className="ml-1.5 font-mono text-[0.7rem] opacity-60 tabular">{m.count}</span>
              </Button>
            ))}
          </div>
        )}

        <div className="mt-8">
          {error ? (
            <EmptyState title={t("events.error")} />
          ) : isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-5">
                  <Skeleton className="h-16 w-16 shrink-0" rounded="card" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : shown.length === 0 ? (
            <EmptyState title={t("events.empty")} />
          ) : (
            <Reveal as="ul" className="flex flex-col border-t border-line">
              {shown.slice(0, 6).map((event) => {
                const d = event.event_date ? new Date(event.event_date) : null;
                const valid = d && !Number.isNaN(d.getTime());
                const location = pick(event, "location");

                return (
                  <li key={event.id} className="border-b border-line-soft">
                    <Link
                      to={`/events/${event.id}`}
                      className={cx(
                        "-mx-3 flex items-center gap-5 rounded-field px-3 py-5",
                        "transition-colors duration-1 ease-out-soft hover:bg-paper-3",
                      )}
                    >
                      {/* Sana bloki — taqvim varag'i */}
                      <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-card border border-line bg-page">
                        {valid ? (
                          <>
                            <span className="font-display text-[1.35rem] font-semibold leading-none text-ink tabular">
                              {d.getDate()}
                            </span>
                            <span className="mt-1 font-sans text-[0.62rem] uppercase tracking-[0.1em] text-gold-dim">
                              {formatMonth(d, { short: true })}
                            </span>
                          </>
                        ) : (
                          <span className="font-mono text-[0.7rem] text-fg-faint">—</span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block line-clamp-2 font-display text-[1rem] font-medium leading-snug text-fg">
                          {pick(event, "title")}
                        </span>

                        {location && (
                          <span className="mt-1.5 flex items-center gap-1.5 font-sans text-[0.8rem] text-fg-muted">
                            <MapPin size={13} strokeWidth={1.8} className="shrink-0 text-gold-dim" />
                            <span className="truncate">{location}</span>
                          </span>
                        )}
                      </span>

                      <ArrowRight
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className="hidden shrink-0 text-fg-faint sm:block"
                      />
                    </Link>
                  </li>
                );
              })}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
