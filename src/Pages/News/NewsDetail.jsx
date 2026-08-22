// src/pages/NewsDetail.jsx
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetAnnouncementByIdQuery } from "../../store/services/announcements.api";
import { BASE_URL } from "../../store/api";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";
import { truncateForMeta } from "../../seo/seoUtils";

export default function NewsDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();

  const { data: announcement, isLoading, error } = useGetAnnouncementByIdQuery(id);

  const getTitleByLanguage = (item) => {
    if (!item) return "";
    const lang = i18n.language;
    if (lang === "uz") return item.title_latin;
    if (lang === "ru") return item.title_ru;
    if (lang === "cyrl") return item.title_cyril;
    return item.title_latin;
  };

  const getContentByLanguage = (item) => {
    if (!item) return "";
    const lang = i18n.language;
    if (lang === "uz") return item.content_latin;
    if (lang === "ru") return item.content_ru;
    if (lang === "cyrl") return item.content_cyril;
    return item.content_latin;
  };

  const formatDate = (date, lang) => {
    if (!date) return "";
    const locale = lang === "ru" ? "ru-RU" : "uz-UZ";
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
        <SEO {...SEO_CONFIG.news} title={t("announcements.loading")} />
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
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`h-4 rounded bg-slate-300 ${i % 3 === 2 ? "w-4/5" : "w-full"}`} />
                  ))}
                </div>
                <div className="h-4 w-48 rounded bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ===== ERROR =====
  if (error || !announcement) {
    return (
      <section className="bg-white">
        <SEO
          title={t("announcements.notFound")}
          description={t("announcements.notFoundDesc")}
          noIndex
        />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            to="/news"
            className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            {t("announcements.back")}
          </Link>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-20 text-center">
            <p className="text-base font-semibold text-slate-900">{t("announcements.notFound")}</p>
            <p className="mt-2 text-sm text-slate-500">{t("announcements.notFoundDesc")}</p>
          </div>
        </div>
      </section>
    );
  }

  const title = getTitleByLanguage(announcement);
  const content = getContentByLanguage(announcement);
  const imageUrl = announcement.cover_image ? `${BASE_URL}${announcement.cover_image}` : null;
  const createdDate = formatDate(announcement.created_at, i18n.language);
  const updatedDate = formatDate(announcement.updated_at, i18n.language);

  // ===== CONTENT =====
  return (
    <article className="bg-white">
      <SEO
        title={title}
        description={truncateForMeta(content)}
        image={imageUrl}
        type="article"
        publishedTime={announcement.published_at}
        modifiedTime={announcement.updated_at}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: title,
          description: truncateForMeta(content),
          image: imageUrl || undefined,
          datePublished: announcement.published_at,
          dateModified: announcement.updated_at,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Back */}
        <Link
          to="/news"
          className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {t("announcements.back")}
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
                {t("announcements.category")}
              </span>
              {createdDate && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <CalendarDays size={14} />
                  {createdDate}
                </span>
              )}
            </div>

            {/* Sarlavha */}
            <h1 className="text-2xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {title}
            </h1>

            <div className="mt-7 h-px w-full bg-slate-100" />

            {/* Kontent */}
            <div className="mt-7 whitespace-pre-line text-base leading-8 text-slate-600 sm:text-[17px]">
              {content}
            </div>

            {/* Footer */}
            {updatedDate && (
              <div className="mt-10 border-t border-slate-100 pt-5 text-sm text-slate-400">
                {t("announcements.updated")}: {updatedDate}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
