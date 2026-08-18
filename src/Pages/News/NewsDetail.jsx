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

  const { data, isLoading, error } = useGetAnnouncementByIdQuery(id);

  const announcement = data;

  // Tilga qarab title va content ni tanlash
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

  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <SEO {...SEO_CONFIG.news} title={t("announcements.loading")} />
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-3/4 rounded-lg bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !announcement) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <SEO
          title={t("announcements.notFound")}
          description={t("announcements.notFoundDesc")}
          noIndex
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("announcements.notFound")}
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            {t("announcements.notFoundDesc")}
          </p>

          <Link
            to="/news"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            {t("announcements.back")}
          </Link>
        </div>
      </section>
    );
  }

  const title = getTitleByLanguage(announcement);
  const content = getContentByLanguage(announcement);

  const imageUrl = announcement.cover_image
    ? `${BASE_URL}${announcement.cover_image}`
    : null;

  const date = formatDate(announcement.published_at, i18n.language);
  const createdDate = formatDate(announcement.created_at, i18n.language);
  const updatedDate = formatDate(announcement.updated_at, i18n.language);

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

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          {t("announcements.back")}
        </Link>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_520px] lg:gap-14">
          {/* LEFT CONTENT */}
          <div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {t("announcements.category")}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays size={15} />
                {createdDate || "-"}
              </span>
            </div>

            <h1 className="mt-7 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[46px]">
              {title}
            </h1>

            <div className="mt-8 h-px w-full bg-slate-200" />

            <p className="mt-8 whitespace-pre-line text-base leading-8 text-slate-600 sm:text-lg">
              {content}
            </p>

            <div className="mt-10 border-t border-slate-200 pt-5 text-sm text-slate-400">
              {t("announcements.updated")}: {updatedDate || "-"}
            </div>
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