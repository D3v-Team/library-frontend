// src/components/Announcements.jsx
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetAnnouncementsQuery } from "../../../store/services/announcements.api";
import { BASE_URL } from "../../../store/api";

const AUTOPLAY_MS = 4000;

const BREAKPOINTS = [
  { minWidth: 1024, itemsPerPage: 3 },
  { minWidth: 768, itemsPerPage: 2 },
  { minWidth: 0, itemsPerPage: 1 },
];

const categoryStyles = {
  Muhim: {
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-600",
    accent: "bg-amber-600",
  },
  default: {
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-700",
    accent: "bg-blue-700",
  },
};

function getCategoryStyle(category) {
  return categoryStyles[category] || categoryStyles.default;
}

function getItemsPerPage(width) {
  const match = BREAKPOINTS.find((item) => width >= item.minWidth);
  return match ? match.itemsPerPage : 1;
}

export default function Announcements() {
  const { t, i18n } = useTranslation();

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

  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [index, setIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const goNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIndex((prev) => prev + 1);
  };

  const goToSlide = (slideIndex) => {
    if (isAnimating) return;
    setIndex(slideIndex);
  };

  const handleTransitionEnd = () => {
    setIsAnimating(false);

    if (index >= total) {
      setTransitionEnabled(false);
      setIndex(0);
    }

    if (index < 0) {
      setTransitionEnabled(false);
      setIndex(total - 1);
    }
  };

  useEffect(() => {
    const resizeHandler = () => {
      setItemsPerPage(
        Math.min(
          getItemsPerPage(window.innerWidth),
          total || 1,
        ),
      );
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= itemsPerPage) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const timer = setInterval(goNext, AUTOPLAY_MS);

    return () => {
      clearInterval(timer);
    };
  }, [isPaused, itemsPerPage, total, isAnimating]);

  useEffect(() => {
    if (transitionEnabled) return;

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [transitionEnabled]);

  useEffect(() => {
    setIndex((prev) => prev);
  }, [i18n.language]);

  if (isLoading) {
    const skeletonCount = getItemsPerPage(window.innerWidth) || 3;
    return (
      <section className="bg-slate-50 py-16 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-7 w-1 rounded-full bg-blue-700/40 animate-pulse" />
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                  <Megaphone size={17} className="text-blue-700/40 animate-pulse" />
                  <span className="h-6 w-48 animate-pulse rounded bg-blue-700/50" />
                </div>
              </div>
              <div className="h-10 w-64 animate-pulse rounded bg-blue-700/50" />
              <div className="mt-3 h-4 w-72 animate-pulse rounded bg-blue-700/40" />
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-blue-700/40" />
          </div>

          {/* Cards skeleton */}
          <div className={`grid gap-5 ${skeletonCount === 1 ? 'grid-cols-1' : skeletonCount === 2 ? 'sm:grid-cols-2' : 'lg:grid-cols-3'}`}>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-44 animate-pulse bg-blue-700" />
                <div className="h-1 w-full bg-blue-700" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-blue-700" />
                    <div className="h-4 w-24 animate-pulse rounded bg-blue-700" />
                  </div>
                  <div className="h-6 w-12 animate-pulse rounded bg-blue-700" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-blue-700" />
                  <div className="h-4 w-full animate-pulse rounded bg-blue-700" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-blue-700" />
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="h-8 w-28 animate-pulse rounded bg-blue-700" />
                  </div>
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

  const trackItems = [
    ...announcements.slice(-itemsPerPage).map((item, index) => ({
      ...item,
      _slot: `front-${index}`,
    })),
    ...announcements.map((item) => ({
      ...item,
      _slot: `real-${item.id}`,
    })),
    ...announcements.slice(0, itemsPerPage).map((item, index) => ({
      ...item,
      _slot: `back-${index}`,
    })),
  ];

  const activePagination = ((index % total) + total) % total;
  const itemWidthPercent = 100 / trackItems.length;
  const trackWidthPercent = (trackItems.length / itemsPerPage) * 100;
  const trackPosition = index + itemsPerPage;

  const goPrevSlide = () => {
    if (isAnimating) return;
    const newIndex = activePagination - 1 < 0 ? total - 1 : activePagination - 1;
    goToSlide(newIndex);
  };

  const goNextSlide = () => {
    if (isAnimating) return;
    const newIndex = (activePagination + 1) % total;
    goToSlide(newIndex);
  };

  return (
    <section className="bg-slate-50 py-16 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700" />
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
                <Megaphone size={17} />
                <span>{t("announcements.title")}</span>
              </div>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t("announcements.heading")}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {t("announcements.description")}
            </p>
          </div>

          <Link
            to="/news"
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-blue-700"
          >
            {t("announcements.all")}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 transition-all group-hover:border-blue-700 group-hover:bg-blue-700 group-hover:text-white">
              <ArrowRight size={15} />
            </span>
          </Link>
        </div>

        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div
            className="flex"
            onTransitionEnd={handleTransitionEnd}
            style={{
              width: `${trackWidthPercent}%`,
              transform: `translateX(-${trackPosition * itemWidthPercent}%)`,
              transition: transitionEnabled
                ? "transform 800ms cubic-bezier(0.22,1,0.36,1)"
                : "none",
            }}
          >
            {trackItems.map((announcement) => {
              const style = getCategoryStyle(announcement.category);
              const originalIndex = announcements.findIndex(
                (item) => item.id === announcement.id
              );

              return (
                <div
                  key={announcement._slot}
                  className="shrink-0 px-2.5"
                  style={{
                    flex: `0 0 ${itemWidthPercent}%`,
                  }}
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
                      <div className="flex items-center justify-between gap-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${style.badge}`}>
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

                      <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-[1.3] text-slate-900 transition-colors group-hover:text-blue-700">
                        {announcement.title}
                      </h3>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                        {announcement.description}
                      </p>

                      <div className="mt-auto border-t border-slate-100 pt-5">
                        <Link
                          to={`/news/${announcement.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-blue-700"
                        >
                          {t("announcements.details")}
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition hover:border-blue-700 hover:bg-blue-700 hover:text-white">
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

        {/* ===== PAGINATION ===== */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {/* Desktop dots – yumaloq pagination */}
          <div className="hidden md:flex items-center gap-2">
            {announcements.map((item, index) => {
              const active = activePagination === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`${index + 1}-e'lon`}
                  className={`h-2 rounded-full border transition-all duration-500 ${
                    active
                      ? "w-10 bg-blue-700 border-blue-700"
                      : "w-3 bg-white border-slate-300 hover:border-blue-500 hover:bg-blue-100"
                  }`}
                />
              );
            })}
          </div>

          {/* Mobile – oldinga/orqaga strelkalar + joriy sahifa */}
          <div className="flex md:hidden items-center gap-4">
            <button
              type="button"
              onClick={goPrevSlide}
              aria-label="Oldingi"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
              disabled={total <= 1}
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm font-medium text-slate-600">
              {activePagination + 1} / {total}
            </span>

            <button
              type="button"
              onClick={goNextSlide}
              aria-label="Keyingi"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
              disabled={total <= 1}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}