import { ArrowLeft, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetEventByIdQuery, useGetEventsQuery } from "../../store/services/events";
import { BASE_URL } from "../../store/api";
import { Button, EmptyState, Skeleton } from "../../ui";
import { MountedImage, PageShell, Prose, SectionHeader } from "../../patterns";
import SEO from "../../seo/SEO";

const imageUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

export default function EventDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { pick, formatDate, formatMonth } = useLocalized();

  const { data, isLoading, error } = useGetEventByIdQuery(id);
  const others = useGetEventsQuery({ page: 1, limit: 6 });

  const event = data?.data ?? data;
  const rest = (others.data?.data ?? []).filter((e) => e.id !== id).slice(0, 4);

  if (isLoading) {
    return (
      <PageShell breadcrumbs={[{ label: t("events.heading"), to: "/events" }]} title={t("events.loading")}>
        <Skeleton className="h-[280px] w-full" rounded="card" />
      </PageShell>
    );
  }

  if (error || !event) {
    return (
      <PageShell breadcrumbs={[{ label: t("events.heading"), to: "/events" }]} title={t("events.notFound")}>
        <EmptyState
          title={t("events.notFound")}
          description={t("events.notFoundHint")}
          actions={
            <Button size="sm" variant="primary" to="/events">
              {t("events.back")}
            </Button>
          }
        />
      </PageShell>
    );
  }

  const title = pick(event, "title");
  const location = pick(event, "location");
  const cover = imageUrl(event.cover_image);
  const d = event.event_date ? new Date(event.event_date) : null;
  const valid = d && !Number.isNaN(d.getTime());

  return (
    <>
      <SEO title={title} description={String(pick(event, "description") ?? "").replace(/<[^>]*>/g, " ").slice(0, 160)} image={cover} />

      <PageShell
        breadcrumbs={[{ label: t("events.heading"), to: "/events" }, { label: title }]}
        eyebrow={t("events.category")}
        title={title}
        // Meta ATAYLAB yo'q: sana va joy yon panelda to'liq ko'rsatiladi.
        // Ilgari sana bir ekranda uch marta takrorlanardi (lenta meta,
        // taqvim kartochkasi, yon panel qatori), joy esa ikki marta.
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_260px] lg:gap-16">
          <div>
            {cover && (
              <MountedImage src={cover} maxHeight={280} className="mb-9" />
            )}

            <Prose html={pick(event, "description")} />

            <div className="mt-12">
              <Button variant="secondary" to="/events" iconStart={<ArrowLeft size={16} />}>
                {t("events.back")}
              </Button>
            </div>
          </div>

          {/* Yon panel — taqvim varag'i va joy */}
          <aside className="flex flex-col gap-6">
            {valid && (
              <div className="flex flex-col items-center rounded-card border border-line bg-paper-2 px-6 py-7">
                <span className="font-display text-[3rem] font-semibold leading-none text-ink tabular">
                  {d.getDate()}
                </span>
                <span className="mt-2 font-sans text-[0.78rem] uppercase tracking-[0.12em] text-gold-dim">
                  {formatMonth(d)}
                </span>
                <span className="mt-0.5 font-mono text-[0.8rem] text-fg-muted tabular">
                  {d.getFullYear()}
                </span>
              </div>
            )}

            {/* Sana bu ro'yxatda YO'Q: ustidagi taqvim kartochkasi uni
                allaqachon ko'rsatadi. Faqat joy qoladi. */}
            <dl className="flex flex-col border-t border-line">
              {[{ icon: MapPin, label: t("events.location"), value: location }]
                .filter((r) => r.value)
                .map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-start gap-3 border-b border-line-soft py-4">
                      <Icon size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-gold-dim" />
                      <div className="min-w-0">
                        <dt className="font-sans text-[0.7rem] uppercase tracking-[0.1em] text-fg-faint">
                          {row.label}
                        </dt>
                        <dd className="mt-0.5 font-display text-[0.92rem] text-fg">{row.value}</dd>
                      </div>
                    </div>
                  );
                })}
            </dl>
          </aside>
        </div>

        {rest.length > 0 && (
          <div className="mt-20 border-t border-line pt-14">
            <SectionHeader eyebrow={t("events.badge")} title={t("events.otherTitle")} />

            <ul className="mt-8 grid gap-x-10 border-t border-line sm:grid-cols-2">
              {rest.map((e) => (
                <li key={e.id} className="border-b border-line-soft">
                  <Link
                    to={`/events/${e.id}`}
                    className="-mx-3 block rounded-field px-3 py-4 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
                  >
                    <p className="font-mono text-[0.72rem] text-fg-faint tabular">
                      {formatDate(e.event_date)}
                    </p>
                    <p className="mt-1 line-clamp-2 font-display text-[0.95rem] font-medium leading-snug text-fg">
                      {pick(e, "title")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageShell>
    </>
  );
}
