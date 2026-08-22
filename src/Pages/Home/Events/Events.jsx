import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

import { useGetEventsQuery } from "../../../store/services/events";
import { BASE_URL } from "../../../store/api";

const AUTO_PLAY_DELAY = 3000;

export default function Events() {
  const { t, i18n } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [transitionEnabled, setTransitionEnabled] =
    useState(true);

  const {
    data,
    isLoading,
    error,
  } = useGetEventsQuery({
    page: 1,
    limit: 9,
  });

  const events = data?.data ?? [];
  const totalEvents = events.length;

  // ==========================================
  // RESPONSIVE
  // ==========================================

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCards(3);
      } else if (window.innerWidth >= 640) {
        setVisibleCards(2);
      } else {
        setVisibleCards(1);
      }
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

  // ==========================================
  // INFINITE DATA
  // ==========================================

  const extendedEvents =
    totalEvents > 0
      ? [
          ...events,
          ...events,
          ...events,
        ]
      : [];

  // Markaziy nusxa
  const middleStart = totalEvents;

  // ==========================================
  // BOSHLANG‘ICH POSITION
  // ==========================================

  useEffect(() => {
    if (!totalEvents) {
      setCurrentIndex(0);
      return;
    }

    setTransitionEnabled(false);
    setCurrentIndex(middleStart);

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    totalEvents,
    visibleCards,
    middleStart,
  ]);

  // ==========================================
  // AUTOPLAY
  // ==========================================

  useEffect(() => {
    if (totalEvents <= visibleCards) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, AUTO_PLAY_DELAY);

    return () => {
      clearInterval(interval);
    };
  }, [
    totalEvents,
    visibleCards,
  ]);

  // ==========================================
  // INFINITE RESET
  // ==========================================

  const handleTransitionEnd = () => {
    if (!totalEvents) {
      return;
    }

    // O‘ng tomonga juda uzoq ketganda
    if (
      currentIndex >=
      middleStart + totalEvents
    ) {
      const normalizedIndex =
        middleStart +
        (currentIndex -
          (middleStart + totalEvents));

      setTransitionEnabled(false);
      setCurrentIndex(normalizedIndex);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
        });
      });

      return;
    }

    // Chap tomonga juda uzoq ketganda
    if (currentIndex < middleStart) {
      const normalizedIndex =
        middleStart +
        (currentIndex -
          middleStart +
          totalEvents);

      setTransitionEnabled(false);
      setCurrentIndex(normalizedIndex);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
        });
      });
    }
  };

  // ==========================================
  // LANGUAGE
  // ==========================================

  const getTitle = (event) => {
    const lang = i18n.language;

    if (lang === "ru") {
      return (
        event.title_ru ||
        event.title_latin ||
        event.title_cyril ||
        "Nomsiz"
      );
    }

    if (lang === "cyrl") {
      return (
        event.title_cyril ||
        event.title_latin ||
        event.title_ru ||
        "Номсиз"
      );
    }

    return (
      event.title_latin ||
      event.title_ru ||
      event.title_cyril ||
      "Nomsiz"
    );
  };

  const getDescription = (event) => {
    const lang = i18n.language;

    if (lang === "ru") {
      return (
        event.description_ru ||
        event.description_latin ||
        event.description_cyril ||
        ""
      );
    }

    if (lang === "cyrl") {
      return (
        event.description_cyril ||
        event.description_latin ||
        event.description_ru ||
        ""
      );
    }

    return (
      event.description_latin ||
      event.description_ru ||
      event.description_cyril ||
      ""
    );
  };

  const getLocation = (event) => {
    const lang = i18n.language;

    if (lang === "ru") {
      return (
        event.location_ru ||
        event.location_latin ||
        event.location_cyril ||
        ""
      );
    }

    if (lang === "cyrl") {
      return (
        event.location_cyril ||
        event.location_latin ||
        event.location_ru ||
        ""
      );
    }

    return (
      event.location_latin ||
      event.location_ru ||
      event.location_cyril ||
      ""
    );
  };

  // ==========================================
  // DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "";

    const locale =
      i18n.language === "ru"
        ? "ru-RU"
        : "uz-UZ";

    return new Date(
      date,
    ).toLocaleDateString(
      locale,
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );
  };

  const formatMonth = (date) => {
    if (!date) return "";

    const locale =
      i18n.language === "ru"
        ? "ru-RU"
        : "uz-UZ";

    return new Date(date)
      .toLocaleString(locale, {
        month: "short",
      })
      .toUpperCase();
  };

  const getDay = (date) => {
    if (!date) return "";

    return new Date(date).getDate();
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const goPrevious = () => {
    if (totalEvents <= visibleCards) {
      return;
    }

    setCurrentIndex(
      (prev) => prev - 1,
    );
  };

  const goNext = () => {
    if (totalEvents <= visibleCards) {
      return;
    }

    setCurrentIndex(
      (prev) => prev + 1,
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return (
      <section className="bg-slate-50 py-16 sm:py-12 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-7 w-1 animate-pulse rounded-full bg-slate-300" />

                <div className="h-5 w-48 animate-pulse rounded bg-slate-300" />
              </div>

              <div className="h-10 w-64 animate-pulse rounded bg-slate-300" />

              <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-300" />
            </div>

            <div className="flex gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-300" />
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-300" />
              <div className="h-8 w-28 animate-pulse rounded bg-slate-300" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-52 animate-pulse bg-slate-300" />

                <div className="space-y-4 p-6">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-300" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-300" />

                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-300" />

                  <div className="border-t border-slate-100 pt-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

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

  // ==========================================
  // EMPTY
  // ==========================================

  if (!events.length) {
    return (
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
            {t("events.empty")}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // TRANSLATE
  // ==========================================

  const translateX =
    -(currentIndex * 100) /
    visibleCards;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="bg-slate-50 py-16 sm:py-12 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ======================================
            HEADER
        ======================================= */}

        <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700" />

              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
                <CalendarDays size={17} />

                <span>
                  {t("events.badge")}
                </span>
              </div>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t("events.heading")}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              {t(
                "events.description",
              )}
            </p>
          </div>

          {/* ACTIONS */}

          <div className="hidden lg:block lg:flex-1 self-end mb-[3px] border-b border-slate-200 mx-6" />

          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/events"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              {t("events.all")}

              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            {totalEvents >
              visibleCards && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    goPrevious
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-300
                    bg-white
                    text-slate-600
                    shadow-sm
                    transition
                    hover:border-slate-900
                    hover:bg-slate-900
                    hover:text-white
                  "
                  aria-label="Oldingi tadbir"
                >
                  <ChevronLeft
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-300
                    bg-white
                    text-slate-600
                    shadow-sm
                    transition
                    hover:border-slate-900
                    hover:bg-slate-900
                    hover:text-white
                  "
                  aria-label="Keyingi tadbir"
                >
                  <ChevronRight
                    size={17}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================
            CAROUSEL
        ======================================= */}

        <div className="overflow-hidden">
          <div
            className={`
              flex
              will-change-transform
              ${
                transitionEnabled
                  ? "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  : "transition-none"
              }
            `}
            style={{
              transform: `translateX(${translateX}%)`,
            }}
            onTransitionEnd={
              handleTransitionEnd
            }
          >
            {extendedEvents.map(
              (event, index) => {
                const title =
                  getTitle(event);

                const description =
                  getDescription(
                    event,
                  );

                const location =
                  getLocation(event);

                const date =
                  formatDate(
                    event.event_date,
                  );

                const month =
                  formatMonth(
                    event.event_date,
                  );

                const day =
                  getDay(
                    event.event_date,
                  );

                return (
                  <div
                    key={`${event.id}-${index}`}
                    className="shrink-0 px-2.5"
                    style={{
                      width: `${100 / visibleCards}%`,
                    }}
                  >
                    <article
                      className="
                        group
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-lg
                      "
                    >
                      {/* IMAGE */}

                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                        {event.cover_image ? (
                          <img
                            src={
                              event.cover_image.startsWith(
                                "http",
                              )
                                ? event.cover_image
                                : `${BASE_URL}${event.cover_image}`
                            }
                            alt={
                              title
                            }
                            loading="lazy"
                            draggable={
                              false
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-500
                              group-hover:scale-[1.03]
                            "
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            {t(
                              "events.noImage",
                            )}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

                        {/* DATE */}

                        <div className="absolute left-4 top-4 flex h-[72px] w-[68px] flex-col items-center justify-center rounded-xl bg-white shadow-lg">
                          <span className="text-2xl font-bold leading-none text-slate-900">
                            {day}
                          </span>

                          <span className="mt-1 text-[10px] font-bold tracking-[0.15em] text-blue-700">
                            {month}
                          </span>
                        </div>
                      </div>

                      {/* CONTENT */}

                      <div className="p-6">
                        <h3 className="line-clamp-2 text-xl font-semibold text-slate-900 transition-colors group-hover:text-slate-900">
                          {title}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                          {
                            description
                          }
                        </p>

                        <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <CalendarDays
                              size={15}
                              className="text-blue-700"
                            />

                            {date}
                          </div>

                          {location && (
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                              <MapPin
                                size={15}
                                className="shrink-0 text-blue-700"
                              />

                              <span className="line-clamp-1">
                                {location}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* DETAIL */}

                        <Link
                          to={`/events/${event.id}`}
                          className="group/link mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                        >
                          {t(
                            "events.details",
                          )}

                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition group-hover/link:border-slate-900 group-hover/link:bg-slate-900 group-hover/link:text-white">
                            <ArrowRight
                              size={15}
                            />
                          </span>
                        </Link>
                      </div>
                    </article>
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* ======================================
            SMALL PROGRESS
        ======================================= */}

        {totalEvents >
          visibleCards && (
          <div className="mt-6 flex justify-center gap-1.5">
            {events.map(
              (event, index) => {
                const active =
                  currentIndex %
                    totalEvents ===
                  index;

                return (
                  <span
                    key={event.id}
                    className={`
                      h-1.5
                      rounded-full
                      transition-all
                      duration-300
                      ${
                        active
                          ? "w-8 bg-slate-900"
                          : "w-1.5 bg-slate-300"
                      }
                    `}
                  />
                );
              },
            )}
          </div>
        )}
      </div>
    </section>
  );
}