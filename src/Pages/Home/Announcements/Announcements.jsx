// src/components/Announcements.jsx
import { useMemo, useState, useEffect } from "react";
import { ArrowRight, CalendarDays, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetAnnouncementsQuery } from "../../../store/services/announcements.api";
import { BASE_URL } from "../../../store/api";

const categoryStyles = {
  Muhim: {
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-600",
    accent: "bg-amber-600",
  },
  default: {
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-slate-900",
    accent: "bg-slate-900",
  },
};

function getCategoryStyle(category) {
  return categoryStyles[category] || categoryStyles.default;
}

export default function Announcements() {
  const { t, i18n } = useTranslation();
  const [mobileIndex, setMobileIndex] = useState(0);

  const { data, isLoading, error } = useGetAnnouncementsQuery({
    page: 1,
    limit: 10,
    is_public: true,
  });

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

  const announcements =
    data?.data
      ?.filter((item) => item.is_public)
      ?.map((item) => ({
        id: item.id,
        date: item.published_at
          ? new Date(item.published_at).toLocaleDateString(
              i18n.language === "ru" ? "ru-RU" :
              i18n.language === "cyrl" ? "uz-UZ" : "uz-UZ",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }
            )
          : "",
        isoDate: item.published_at,
        category: t("announcements.category"),
        title: getTitleByLanguage(item),
        description: getContentByLanguage(item),
        image: item.cover_image ? `${BASE_URL}${item.cover_image}` : null,
      })) || [];

  const total = announcements.length;

  useEffect(() => {
    if (!total) return;
    const timer = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % total);
    }, 3000);
    return () => clearInterval(timer);
  }, [total]);

  const marqueeItems = useMemo(() => {
    if (!total) return [];
    return [
      ...announcements.map((item, i) => ({ ...item, _slot: `a-${i}` })),
      ...announcements.map((item, i) => ({ ...item, _slot: `b-${i}` })),
    ];
  }, [announcements, total]);

  const animationDuration = Math.max(total * 7, 24);

  // ===== SKELETON LOADING =====
  if (isLoading) {
    return (
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-7 w-1 rounded-full bg-blue-700" />
                <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
                  i === 1 ? "hidden sm:block" : ""
                } ${i === 2 ? "hidden lg:block" : ""}`}
              >
                <div className="h-44 animate-pulse bg-slate-300" />
                <div className="h-1 w-full bg-blue-700" />
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-slate-300" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !announcements.length) {
    return null;
  }

  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <style>{`
        @keyframes announcementsMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (min-width: 768px) {
          .announcements-track {
            animation: announcementsMarquee ${animationDuration}s linear infinite;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .announcements-track {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700" />
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
                <Megaphone size={17} />
                <span>{t("announcements.title")}</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">
              {t("announcements.heading")}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {t("announcements.description")}
            </p>
          </div>

          <div className="hidden lg:block lg:flex-1 self-end mb-[3px] border-b border-slate-200 mx-6" />

          <Link
            to="/news"
            className="group inline-flex w-fit shrink-0 items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
          >
            {t("announcements.all")}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 transition-all group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
              <ArrowRight size={15} />
            </span>
          </Link>
        </div>

        {/* ===== MOBILE VERSION (< 768px): 1 TA KARTA (3s Interval) ===== */}
        <div className="block md:hidden overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
          >
            {announcements.map((announcement) => {
              const style = getCategoryStyle(announcement.category);

              return (
                <div key={announcement.id} className="w-full shrink-0 px-1">
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {announcement.image && (
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        loading="lazy"
                        className="h-44 w-full object-cover"
                      />
                    )}

                    <div className={`h-1 w-full ${style.accent}`} />

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {announcement.category}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <CalendarDays size={14} />
                          <time dateTime={announcement.isoDate}>
                            {announcement.date}
                          </time>
                        </div>
                      </div>

                      <div className="mt-4 text-xs font-medium tracking-widest text-slate-300">
                        {String(announcements.indexOf(announcement) + 1).padStart(2, "0")}
                      </div>

                      <h3 className="mt-1.5 line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
                        {announcement.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {announcement.description}
                      </p>

                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <Link
                          to={`/news/${announcement.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                        >
                          {t("announcements.details")}
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-700">
                            <ArrowRight size={14} />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>

          {/* Mobile Indicators */}
          <div className="mt-4 flex justify-center gap-1.5">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={() => setMobileIndex(i)}
                aria-label={`Slayd ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === mobileIndex ? "w-6 bg-slate-900" : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ===== TABLET & DESKTOP VERSION (>= 768px): Planshetda 2 ta, Desktopda 3 ta ===== */}
        <div className="hidden md:block relative overflow-hidden">
          <div className="announcements-track flex w-max">
            {marqueeItems.map((announcement) => {
              const style = getCategoryStyle(announcement.category);
              const originalIndex = announcements.findIndex(
                (item) => item.id === announcement.id
              );

              return (
                <div
                  key={announcement._slot}
                  className="shrink-0 px-2.5 w-[320px] lg:w-[360px]"
                >
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    {announcement.image && (
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        loading="lazy"
                        className="h-44 w-full object-cover"
                      />
                    )}

                    <div className={`h-1 w-full ${style.accent}`} />

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${style.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {announcement.category}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <CalendarDays size={14} />
                          <time dateTime={announcement.isoDate}>
                            {announcement.date}
                          </time>
                        </div>
                      </div>

                      <div className="mt-6 text-sm font-medium tracking-widest text-slate-300">
                        {String(originalIndex + 1).padStart(2, "0")}
                      </div>

                      <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-[1.3] text-slate-900 transition-colors group-hover:text-slate-900">
                        {announcement.title}
                      </h3>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                        {announcement.description}
                      </p>

                      <div className="mt-auto border-t border-slate-100 pt-5">
                        <Link
                          to={`/news/${announcement.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                        >
                          {t("announcements.details")}
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                            <ArrowRight size={15} />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}