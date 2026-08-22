// src/pages/News.jsx
import { useState, useEffect } from "react";
import { ArrowRight, CalendarDays, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetAnnouncementsQuery } from "../../store/services/announcements.api";
import { BASE_URL } from "../../store/api";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

function formatDate(date, lang) {
  if (!date) return "";

  const locale = lang === "ru" ? "ru-RU" : "uz-UZ";

  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function truncateText(text, limit = 140) {
  if (!text) return "";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
}

export default function News() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetAnnouncementsQuery({
    page,
    limit: 12,
    is_public: true,
  });

  // Tilga qarab title va content ni tanlash
  const getTitleByLanguage = (item) => {
    const lang = i18n.language;
    
    if (lang === "uz") return item.title_latin;
    if (lang === "ru") return item.title_ru;
    if (lang === "cyrl") return item.title_cyril;
    
    return item.title_latin;
  };

  const getContentByLanguage = (item) => {
    const lang = i18n.language;
    
    if (lang === "uz") return item.content_latin;
    if (lang === "ru") return item.content_ru;
    if (lang === "cyrl") return item.content_cyril;
    
    return item.content_latin;
  };

  const announcements = data?.data
    ?.filter((item) => item.is_public)
    ?.map((item) => ({
      ...item,
      title: getTitleByLanguage(item),
      content: getContentByLanguage(item),
    })) || [];

  const totalPages = data?.meta?.totalPages || 1;

  // Til o'zgarganda sahifani yangilash
  useEffect(() => {
    setPage(1);
  }, [i18n.language]);

  // ===== SKELETON LOADING =====
  if (isLoading) {
    return (
      <section className="bg-slate-50 py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* HEADER SKELETON */}
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-7 w-1 rounded-full bg-slate-300 animate-pulse" />
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                  <Megaphone size={17} className="text-slate-400 animate-pulse" />
                  <span className="h-6 w-48 animate-pulse rounded bg-slate-300" />
                </div>
              </div>
              <div className="h-10 w-64 animate-pulse rounded bg-slate-300" />
              <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-300" />
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-slate-300" />
          </div>

          {/* CARDS SKELETON */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-52 animate-pulse bg-slate-300" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-slate-300" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-300" />
                  </div>
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-300" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-300" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-300" />
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="h-8 w-28 animate-pulse rounded bg-slate-300" />
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
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <SEO {...SEO_CONFIG.news} noIndex />
        <div className="mx-auto max-w-7xl rounded-xl bg-red-50 p-6 text-center text-sm text-red-600">
          {t("announcements.error")}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-10 sm:py-12 lg:py-14">
      <SEO {...SEO_CONFIG.news} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700" />
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
                <Megaphone size={17} />
                <span>{t("announcements.title")}</span>
              </div>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t("announcements.heading")}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {t("announcements.description")}
            </p>
          </div>

          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            {t("announcements.home")}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 transition group-hover:bg-slate-900 group-hover:text-white">
              <ArrowRight size={15} />
            </span>
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-slate-500">
              {t("announcements.empty")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  {item.cover_image ? (
                    <img
                      src={`${BASE_URL}${item.cover_image}`}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      {t("announcements.noImage")}
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                <div className="flex flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />
                      {t("announcements.category")}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays size={14} />
                      {formatDate(item.published_at, i18n.language)}
                    </div>
                  </div>

                  <h2 className="mt-5 line-clamp-2 text-xl font-semibold leading-[1.3] text-slate-900 transition-colors group-hover:text-slate-900">
                    {item.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {truncateText(item.content, 140)}
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <Link
                      to={`/news/${item.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
                    >
                      {t("announcements.details")}
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition-all group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                        <ArrowRight size={15} />
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => {
                    setPage(pageNumber);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    page === pageNumber
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-slate-900"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}