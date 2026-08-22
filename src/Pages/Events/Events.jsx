// src/pages/Events.jsx
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetEventsQuery } from "../../store/services/events";
import { BASE_URL } from "../../store/api";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

export default function Events() {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error, isFetching } = useGetEventsQuery({
    page: 1,
    limit: 12,
  });

  const events = data?.data ?? [];

  // Tilga qarab title ni olish
  const getTitle = (event) => {
    const lang = i18n.language;
    if (lang === "uz") return event.title_latin;
    if (lang === "ru") return event.title_ru;
    if (lang === "cyrl") return event.title_cyril;
    return event.title_latin || "Nomsiz";
  };

  // Tilga qarab description ni olish
  const getDescription = (event) => {
    const lang = i18n.language;
    if (lang === "uz") return event.description_latin;
    if (lang === "ru") return event.description_ru;
    if (lang === "cyrl") return event.description_cyril;
    return event.description_latin || "";
  };

  // Tilga qarab location ni olish
  const getLocation = (event) => {
    const lang = i18n.language;
    if (lang === "uz") return event.location_latin;
    if (lang === "ru") return event.location_ru;
    if (lang === "cyrl") return event.location_cyril;
    return event.location_latin || "";
  };

  // Sanani formatlash
  const formatDate = (date) => {
    if (!date) return "";
    const locale = i18n.language === "ru" ? "ru-RU" : "uz-UZ";
    return new Date(date).toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Oyni formatlash
  const formatMonth = (date) => {
    if (!date) return "";
    const locale = i18n.language === "ru" ? "ru-RU" : "uz-UZ";
    return new Date(date)
      .toLocaleString(locale, { month: "short" })
      .toUpperCase();
  };

  // ===== SKELETON LOADING =====
  if (isLoading) {
    return (
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* HEADER SKELETON */}
          <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-7 w-1 rounded-full bg-slate-300 animate-pulse" />
                <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.12em]">
                  <CalendarDays size={17} className="text-slate-400 animate-pulse" />
                  <span className="h-6 w-32 animate-pulse rounded bg-slate-300" />
                </div>
              </div>
              <div className="h-10 w-64 animate-pulse rounded bg-slate-300" />
              <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-300" />
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-slate-300" />
          </div>

          {/* CARDS SKELETON */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-[16/9] animate-pulse bg-slate-300" />
                <div className="p-6 space-y-4">
                  <div className="h-7 w-3/4 animate-pulse rounded bg-slate-300" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-300" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-300" />
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-300" />
                    <div className="h-4 w-40 animate-pulse rounded bg-slate-300" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-6 w-24 animate-pulse rounded bg-slate-300" />
                    <div className="h-8 w-8 animate-pulse rounded-full bg-slate-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SEO {...SEO_CONFIG.events} noIndex />
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-red-600">
          {t("events.error")}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <SEO {...SEO_CONFIG.events} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700" />
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
                <CalendarDays size={17} />
                <span>{t("events.badge")}</span>
              </div>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t("events.heading")}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {t("events.description")}
            </p>
          </div>

          <Link
            to="/"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            {t("events.home")}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 transition group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
              <ArrowRight size={15} />
            </span>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-sm text-slate-500">{t("events.empty")}</p>
          </div>
        ) : (
          <div className={`grid gap-6 md:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
            {events.map((event) => {
              const date = new Date(event.event_date);
              const title = getTitle(event);
              const description = getDescription(event);
              const location = getLocation(event);

              return (
                <article
                  key={event.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    {event.cover_image ? (
                      <img
                        src={
                          event.cover_image.startsWith("http")
                            ? event.cover_image
                            : `${BASE_URL}${event.cover_image}`
                        }
                        alt={title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        {t("events.noImage")}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

                    {/* Date */}
                    <div className="absolute left-4 top-4 flex h-[72px] w-[68px] flex-col items-center justify-center rounded-lg bg-white shadow-lg">
                      <span className="text-2xl font-bold text-slate-900">
                        {date.getDate()}
                      </span>
                      <span className="text-[10px] font-bold tracking-[0.15em] text-slate-900">
                        {formatMonth(event.event_date)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="line-clamp-2 text-xl font-semibold text-slate-900 transition group-hover:text-slate-900">
                      {title}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {description}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <CalendarDays size={15} className="text-slate-900" />
                        {formatDate(event.event_date)}
                      </div>

                      {location && (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <MapPin size={15} className="text-slate-900" />
                          {location}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/events/${event.id}`}
                      className="group/link mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
                    >
                      {t("events.details")}
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition group-hover/link:border-slate-900 group-hover/link:bg-slate-900 group-hover/link:text-white">
                        <ArrowRight size={15} />
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}