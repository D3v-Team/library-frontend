// src/components/Hero.jsx
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetBannersQuery } from "../../../store/services/banners.api";
import { BASE_URL } from "../../../store/api";

const AUTOPLAY_MS = 6500;

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState("next");
  console.log(localStorage.getItem('i18nextLng')); // "uz" yoki "ru" yoki "cyrl"

  const timerRef = useRef(null);

  const { t, i18n } = useTranslation();

  const { data, isLoading, error } = useGetBannersQuery({
    page: 1,
    limit: 10,
  });

  // Tilga qarab title ni tanlash
  const getTitleByLanguage = (item) => {
    const lang = i18n.language;
    
    if (lang === "uz") return item.title_latin;
    if (lang === "ru") return item.title_ru;
    if (lang === "cyrl") return item.title_cyril;
    
    return item.title_latin; // fallback
  };

  const slides = data?.data
    ?.filter((item) => item.is_active)
    ?.sort((a, b) => a.order - b.order)
    ?.map((item) => ({
      id: item.id,
      eyebrow: t("hero.eyebrow"),
      title: getTitleByLanguage(item),
      description: "",
      button: item.link_url ? t("hero.details") : null,
      path: item.link_url || "#",
      image: `${BASE_URL}${item.image_url}`,
    })) || [];

  useEffect(() => {
    if (!slides.length) return;

    timerRef.current = setInterval(() => {
      setDirection("next");
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [slides.length]);

  // Til o'zgarganda slaydni yangilash
  useEffect(() => {
    setActiveSlide((prev) => prev);
  }, [i18n.language]);

  const nextSlide = () => {
    if (!slides.length) return;

    setDirection("next");
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (!slides.length) return;

    setDirection("prev");
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    if (index === activeSlide) return;

    setDirection(index > activeSlide ? "next" : "prev");
    setActiveSlide(index);
  };

  if (isLoading) {
    return <section className="min-h-[520px] bg-slate-950" />;
  }

  if (error || !slides.length) {
    return null;
  }

  const currentSlide = slides[activeSlide] || slides[0];

  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="relative min-h-[520px] lg:min-h-[640px]">
        <div className="absolute inset-0 overflow-hidden">
          {slides.map((slide, index) => {
            const isActive = index === activeSlide;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 ${
                  isActive
                    ? "z-10 pointer-events-auto"
                    : "z-0 pointer-events-none"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover object-center ${
                    isActive
                      ? direction === "next"
                        ? "animate-[heroPageInNext_900ms_ease-out]"
                        : "animate-[heroPageInPrev_900ms_ease-out]"
                      : ""
                  }`}
                />

                <div className="absolute inset-0 bg-black/20" />
              </div>
            );
          })}
          
          <div className="pointer-events-none absolute left-[2%] top-[18%] z-20 h-[62%] w-[58%] sm:left-[4%] sm:w-[54%] lg:left-[5%] lg:top-[17%] lg:h-[64%] lg:w-[50%]">
            <div className="absolute inset-0 rounded-[45px] bg-slate-950/20 backdrop-blur-[4px]" />
            <div className="absolute inset-0 rounded-[45px] bg-gradient-to-r from-slate-950/35 via-slate-950/10 to-transparent" />
            <div className="absolute inset-0 rounded-[45px] bg-gradient-to-b from-transparent via-transparent to-slate-950/20" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
        </div>

        <div className="relative z-30 mx-auto flex min-h-[520px] max-w-[1440px] items-center px-6 py-20 sm:px-10 lg:min-h-[640px] lg:px-16 xl:px-20">
          <div
            key={currentSlide.id + i18n.language}
            className="max-w-3xl text-white animate-[heroContentIn_700ms_ease-out]"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-black/20 text-white backdrop-blur-sm">
                <BookOpen size={19} strokeWidth={1.8} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-sm">
                {currentSlide.eyebrow}
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)] sm:text-5xl lg:text-6xl xl:text-[64px]">
              {currentSlide.title}
            </h1>

            {currentSlide.description && (
              <p className="mt-6 max-w-2xl text-base leading-7 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-lg sm:leading-8">
                {currentSlide.description}
              </p>
            )}

            {currentSlide.button && (
              <a
                href={currentSlide.path}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold !text-black shadow-lg shadow-black/25 transition-all duration-200 hover:bg-slate-100 hover:shadow-xl active:scale-[0.98]"
              >
                <span className="!text-slate-900">{currentSlide.button}</span>
                <ArrowRight size={18} className="!text-slate-900" />
              </a>
            )}
          </div>
        </div>

        <div className="absolute bottom-7 left-6 right-6 z-40 flex items-center justify-between sm:left-10 sm:right-10 lg:left-16 lg:right-16 xl:left-20 xl:right-20">
          <div className="flex items-center gap-2.5">
            {slides.map((slide, index) => {
              const isActive = index === activeSlide;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`${index + 1}-slayd`}
                  aria-current={isActive ? "true" : undefined}
                  className="relative h-1.5 w-8 overflow-hidden rounded-full bg-white/30"
                >
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-500 ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              aria-label={t("hero.prev")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm transition-all duration-200 hover:border-white/60 hover:bg-white hover:text-slate-900 active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label={t("hero.next")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm transition-all duration-200 hover:border-white/60 hover:bg-white hover:text-slate-900 active:scale-95"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroPageInNext {
          0% {
            opacity: 0;
            transform: perspective(1600px)
              rotateY(-8deg)
              translateX(45px)
              scale(1.015);
            transform-origin: left center;
          }

          45% {
            opacity: 1;
          }

          100% {
            opacity: 1;
            transform: perspective(1600px)
              rotateY(0deg)
              translateX(0)
              scale(1);
            transform-origin: left center;
          }
        }

        @keyframes heroPageInPrev {
          0% {
            opacity: 0;
            transform: perspective(1600px)
              rotateY(8deg)
              translateX(-45px)
              scale(1.015);
            transform-origin: right center;
          }

          45% {
            opacity: 1;
          }

          100% {
            opacity: 1;
            transform: perspective(1600px)
              rotateY(0deg)
              translateX(0)
              scale(1);
            transform-origin: right center;
          }
        }

        @keyframes heroContentIn {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}