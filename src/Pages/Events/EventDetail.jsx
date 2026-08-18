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

  // Tilga qarab title ni olish
  const getTitle = () => {
    if (!event) return "";
    const lang = i18n.language;
    if (lang === "uz") return event.title_latin;
    if (lang === "ru") return event.title_ru;
    if (lang === "cyrl") return event.title_cyril;
    return event.title_latin || "Nomsiz";
  };

  // Tilga qarab description ni olish
  const getDescription = () => {
    if (!event) return "";
    const lang = i18n.language;
    if (lang === "uz") return event.description_latin;
    if (lang === "ru") return event.description_ru;
    if (lang === "cyrl") return event.description_cyril;
    return event.description_latin || "";
  };

  // Tilga qarab location ni olish
  const getLocation = () => {
    if (!event) return "";
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

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SEO title={t("events.loading")} description={t("events.loadingDesc")} />
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-3/4 rounded-lg bg-slate-200" />
          <div className="h-80 rounded-2xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !event) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SEO
          title={t("events.notFound")}
          description={t("events.notFoundDesc")}
          noIndex
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("events.notFound")}
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            {t("events.notFoundDesc")}
          </p>

          <Link
            to="/events"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            {t("events.back")}
          </Link>
        </div>
      </section>
    );
  }

  const title = getTitle();
  const description = getDescription();
  const location = getLocation();
  const imageUrl = event.cover_image ? `${BASE_URL}${event.cover_image}` : null;
  const date = formatDate(event.event_date);

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

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          {t("events.back")}
        </Link>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_520px] lg:gap-14">
          {/* LEFT CONTENT */}
          <div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {t("events.category")}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays size={15} />
                {date || "-"}
              </span>
            </div>

            <h1 className="mt-7 text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl max-w-3xl">
              {title}
            </h1>

            <div className="mt-8 h-px w-full bg-slate-200" />

            {description && (
              <p className="mt-8 whitespace-pre-line text-base leading-8 text-slate-600 sm:text-lg">
                {description}
              </p>
            )}

            {location && (
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={17} />
                {location}
              </div>
            )}

            {event.creator?.full_name && (
              <div className="mt-6 flex items-center gap-2 border-t border-slate-200 pt-5 text-sm text-slate-400">
                <User size={16} />
                {event.creator.full_name}
              </div>
            )}
          </div>

          {/* RIGHT IMAGE */}
          {imageUrl && (
            <div className="overflow-hidden rounded-3xl bg-slate-100 lg:sticky lg:top-24">
              <img
                src={imageUrl}
                alt={title}
                loading="lazy"
                className="h-[420px] w-full object-cover object-center transition duration-500 hover:scale-105 sm:h-[480px] lg:h-[560px]"
              />
            </div>
          )}
        </div>
      </section>
    </article>
  );
}