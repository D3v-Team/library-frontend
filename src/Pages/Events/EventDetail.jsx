// src/pages/EventDetail.jsx
import { ArrowLeft, CalendarDays, MapPin, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetEventByIdQuery } from "../../store/services/events";
import { BASE_URL } from "../../store/api";
import SEO from "../../seo/SEO";
import { truncateForMeta } from "../../seo/seoUtils";

export default function EventDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();

  const { data: event, isLoading, error } = useGetEventByIdQuery(id);

  const getTitle = () => {
    if (!event) return "";
    const lang = i18n.language;
    if (lang === "uz") return event.title_latin;
    if (lang === "ru") return event.title_ru;
    if (lang === "cyrl") return event.title_cyril;
    return event.title_latin || "Nomsiz";
  };

  const getDescription = () => {
    if (!event) return "";
    const lang = i18n.language;
    if (lang === "uz") return event.description_latin;
    if (lang === "ru") return event.description_ru;
    if (lang === "cyrl") return event.description_cyril;
    return event.description_latin || "";
  };

  const getLocation = () => {
    if (!event) return "";
    const lang = i18n.language;
    if (lang === "uz") return event.location_latin;
    if (lang === "ru") return event.location_ru;
    if (lang === "cyrl") return event.location_cyril;
    return event.location_latin || "";
  };

  const formatDate = (date) => {
    if (!date) return "";
    const locale = i18n.language === "ru" ? "ru-RU" : "uz-UZ";
    return new Date(date).toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ===== SKELETON =====
  if (isLoading) {
    return (
      <section className="bg-white">
        <SEO title={t("events.loading")} description={t("events.loadingDesc")} />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-10 h-4 w-28 rounded bg-slate-300" />
            <div className="grid gap-10 lg:grid-cols-[400px_1fr] lg:gap-14">
              {/* Rasm */}
              <div className="aspect-[4/3] w-full rounded-2xl bg-slate-300 lg:aspect-auto lg:h-[480px]" />
              {/* Kontent */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-24 rounded-full bg-slate-300" />
                  <div className="h-4 w-32 rounded bg-slate-300" />
                </div>
                <div className="h-9 w-full rounded-lg bg-slate-300" />
                <div className="h-8 w-4/5 rounded-lg bg-slate-300" />
                <div className="h-px w-full rounded bg-slate-300" />
                <div className="space-y-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-4 rounded bg-slate-300 ${i % 3 === 2 ? "w-4/5" : "w-full"}`} />
                  ))}
                </div>
                <div className="h-5 w-48 rounded bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ===== ERROR =====
  if (error || !event) {
    return (
      <section className="bg-white">
        <SEO
          title={t("events.notFound")}
          description={t("events.notFoundDesc")}
          noIndex
        />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            to="/events"
            className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            {t("events.back")}
          </Link>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-20 text-center">
            <p className="text-base font-semibold text-slate-900">{t("events.notFound")}</p>
            <p className="mt-2 text-sm text-slate-500">{t("events.notFoundDesc")}</p>
          </div>
        </div>
      </section>
    );
  }

  const title = getTitle();
  const description = getDescription();
  const location = getLocation();
  const imageUrl = event.cover_image ? `${BASE_URL}${event.cover_image}` : null;
  const date = formatDate(event.event_date);

  // ===== CONTENT =====
  return (
    <article className="bg-white">
      <SEO
        title={title}
        description={truncateForMeta(description)}
        image={imageUrl}
        type="article"
        publishedTime={event.created_at}
        modifiedTime={event.updated_at}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: title,
          description: truncateForMeta(description),
          image: imageUrl || undefined,
          startDate: event.event_date,
          location: location ? { "@type": "Place", name: location } : undefined,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Back */}
        <Link
          to="/events"
          className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {t("events.back")}
        </Link>

        <div className={`grid gap-10 lg:gap-14 ${imageUrl ? "lg:grid-cols-[400px_1fr]" : ""}`}>
          {/* ── Chap: rasm ── */}
          {imageUrl && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-md">
                <img
                  src={imageUrl}
                  alt={title}
                  loading="lazy"
                  className="w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            </div>
          )}

          {/* ── O'ng: kontent ── */}
          <div>
            {/* Meta */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {t("events.category")}
              </span>
              {date && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <CalendarDays size={14} />
                  {date}
                </span>
              )}
            </div>

            {/* Sarlavha */}
            <h1 className="text-2xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {title}
            </h1>

            <div className="mt-7 h-px w-full bg-slate-100" />

            {/* Tavsif */}
            {description && (
              <div className="mt-7 whitespace-pre-line text-base leading-8 text-slate-600 sm:text-[17px]">
                {description}
              </div>
            )}

            {/* Qo'shimcha meta */}
            <div className="mt-8 space-y-3">
              {location && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} className="shrink-0 text-slate-400" />
                  {location}
                </div>
              )}
              {event.creator?.full_name && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <User size={15} className="shrink-0" />
                  {event.creator.full_name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
