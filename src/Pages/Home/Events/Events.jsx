// src/components/Events.jsx
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetEventsQuery } from "../../../store/services/events";
import { BASE_URL } from "../../../store/api";

export default function Events() {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error } = useGetEventsQuery({
    page: 1,
    limit: 3,
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

  // Kunni olish
  const getDay = (date) => {
    if (!date) return "";
    return new Date(date).getDate();
  };

  // ===== SKELETON LOADING =====
  if (isLoading) {
    return (
      <section className="bg-slate-50 py-16 sm:py-12 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* HEADER SKELETON */}
          <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-7 w-1 rounded-full bg-blue-700/40 animate-pulse" />
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                  <CalendarDays size={17} className="text-blue-700/40 animate-pulse" />
                  <span className="h-6 w-48 animate-pulse rounded bg-blue-700/50" />
                </div>
              </div>
              <div className="h-10 w-64 animate-pulse rounded bg-blue-700/50" />
              <div className="mt-3 h-4 w-72 animate-pulse rounded bg-blue-700/40" />
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-blue-700/40" />
          </div>

          {/* CARDS SKELETON */}
          <div className="grid gap-5 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/9] animate-pulse bg-blue-700" />
                <div className="p-6 space-y-4">
                  <div className="h-7 w-3/4 animate-pulse rounded bg-blue-700/60" />
                  <div className="h-4 w-full animate-pulse rounded bg-blue-700/50" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-blue-700/50" />
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                    <div className="h-4 w-32 animate-pulse rounded bg-blue-700/40" />
                    <div className="h-4 w-40 animate-pulse rounded bg-blue-700/40" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-6 w-24 animate-pulse rounded bg-blue-700/40" />
                    <div className="h-8 w-8 animate-pulse rounded-full bg-blue-700/40" />
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
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-red-50 px-6 py-10 text-center text-sm text-red-600">
            {t("events.error")}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-16 sm:py-12 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700" />
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
                <CalendarDays size={17} />
                <span>{t("events.badge")}</span>
              </div>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t("events.heading")}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              {t("events.description")}
            </p>
          </div>

          <Link
            to="/events"
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700"
          >
            {t("events.all")}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300">
              <ArrowRight size={15} />
            </span>
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {events.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
              {t("events.empty")}
            </div>
          ) : (
            events.map((event) => {
              const title = getTitle(event);
              const description = getDescription(event);
              const location = getLocation(event);
              const date = formatDate(event.event_date);
              const month = formatMonth(event.event_date);
              const day = getDay(event.event_date);

              return (
                <article
                  key={event.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
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
                      <div className="flex h-full items-center justify-center text-slate-400">
                        {t("events.noImage")}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

                    <div className="absolute left-4 top-4 flex h-[72px] w-[68px] flex-col items-center justify-center rounded-lg bg-white shadow-lg">
                      <span className="text-2xl font-bold leading-none text-slate-900">
                        {day}
                      </span>
                      <span className="mt-1 text-[10px] font-bold tracking-[0.15em] text-blue-700">
                        {month}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-700">
                      {title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {description}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <CalendarDays size={15} className="text-blue-700" />
                        {date}
                      </div>

                      {location && (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <MapPin size={15} className="text-blue-700" />
                          {location}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/events/${event.id}`}
                      className="group/link mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700"
                    >
                      {t("events.details")}
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
                        <ArrowRight size={15} />
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}