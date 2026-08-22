// src/components/Hero.jsx
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { useGetBannersQuery } from "../../../store/services/banners.api";
import { BASE_URL } from "../../../store/api";

const AUTOPLAY_MS = 6500;

// Har slide uchun Ken Burns yo'nalishi — faqat scale + translateY (X yo'q — chiqib ketmasin)
const KB_VARIANTS = [
  { initial: { scale: 1.08, y: "0%"    }, animate: { scale: 1.0,  y: "-1.5%" } },
  { initial: { scale: 1.0,  y: "-1.5%" }, animate: { scale: 1.08, y: "0%"    } },
  { initial: { scale: 1.07, y: "0%"    }, animate: { scale: 1.0,  y: "-1%"   } },
  { initial: { scale: 1.0,  y: "-1%"   }, animate: { scale: 1.07, y: "0%"    } },
];


export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef(null);
  const { t, i18n } = useTranslation();

  const { data, isLoading, error } = useGetBannersQuery({ page: 1, limit: 10 });

  const getTitleByLanguage = (item) => {
    const lang = i18n.language;
    if (lang === "uz") return item.title_latin;
    if (lang === "ru") return item.title_ru;
    if (lang === "cyrl") return item.title_cyril;
    return item.title_latin;
  };

  const slides =
    data?.data
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
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const nextSlide = () => {
    clearInterval(timerRef.current);
    setActiveSlide((prev) => (prev + 1) % slides.length);
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  const prevSlide = () => {
    clearInterval(timerRef.current);
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  const goToSlide = (index) => {
    if (index === activeSlide) return;
    clearInterval(timerRef.current);
    setActiveSlide(index);
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  // ===== SKELETON =====
  if (isLoading) {
    return (
      <section className="relative min-h-[520px] overflow-hidden bg-slate-950 lg:min-h-[640px]">
        <div className="relative z-30 mx-auto flex min-h-[520px] max-w-[1440px] items-center px-6 py-20 sm:px-10 lg:min-h-[640px] lg:px-16 xl:px-20">
          <div className="w-full max-w-3xl animate-pulse space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10" />
              <div className="h-4 w-32 rounded bg-white/10" />
            </div>
            <div className="h-12 w-3/4 rounded bg-white/10 sm:h-14 lg:h-16" />
            <div className="h-12 w-40 rounded-lg bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !slides.length) return null;

  const currentSlide = slides[activeSlide] || slides[0];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="relative min-h-[520px] lg:min-h-[640px]">

        {/* ── Background: Ken Burns rasmlar ── */}
        <div className="absolute inset-0 overflow-hidden">
          {slides.map((slide, index) => {
            const isActive = index === activeSlide;
            const nextIndex = (activeSlide + 1) % slides.length;
            // Faqat aktiv va keyingi slide render qilinadi — boshqalari DOM da yo'q
            if (!isActive && index !== nextIndex) return null;

            const kbVar = KB_VARIANTS[index % KB_VARIANTS.length];

            return (
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
                style={{ zIndex: isActive ? 10 : 0 }}
              >
                {/* Ken Burns motion wrapper */}
                <motion.div
                  className="absolute inset-0 overflow-hidden will-change-transform"
                  initial={kbVar.initial}
                  animate={isActive ? kbVar.animate : kbVar.initial}
                  transition={{
                    duration: AUTOPLAY_MS / 1000,
                    ease: "linear",
                  }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-full w-full object-cover object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </motion.div>

                {/* Gradient overlay — matn o'qilishi uchun */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </motion.div>
            );
          })}
        </div>

        {/* ── Kontent ── */}
        <div className="relative z-30 mx-auto min-h-[520px] max-w-[1440px] px-6 py-20 sm:px-10 lg:min-h-[640px] lg:px-16 xl:px-20">
          {/* Absolute positioned — layout shift bo'lmasin */}
         <div className="absolute inset-x-6 inset-y-0 flex items-center sm:inset-x-10 lg:inset-x-16 xl:inset-x-20">
  <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={currentSlide.id + "-" + i18n.language}
      initial={{ opacity: 0, y: 16, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } }}
      exit={{ opacity: 0, x: 0, transition: { duration: 0.2 } }}
      className="absolute left-0 w-full max-w-2xl"   // 👈 shu joy o'zgardi
    >
                {/* Eyebrow */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-black/40 text-white backdrop-blur-md shadow-lg">
                    <BookOpen size={19} strokeWidth={1.8} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90 sm:text-sm">
                    {currentSlide.eyebrow}
                  </span>
                </div>

                {/* Sarlavha */}
                <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {currentSlide.title}
                </h1>

                {/* Description */}
                {currentSlide.description && (
                  <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                    {currentSlide.description}
                  </p>
                )}

                {/* Button */}
                {currentSlide.button && (
                  <div className="mt-8">
                    <a
                      href={currentSlide.path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-black gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-2xl shadow-black/50 transition-all duration-200 hover:bg-slate-100 active:scale-[0.98]"
                    >
                      {currentSlide.button}
                      <ArrowRight size={17} />
                    </a>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="absolute bottom-7 left-6 right-6 z-40 flex items-center justify-between sm:left-10 sm:right-10 lg:left-16 lg:right-16 xl:left-20 xl:right-20">

          {/* Dots */}
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
                  className="relative h-1.5 w-8 overflow-hidden rounded-full bg-white/35 shadow-md transition-all duration-300 hover:bg-white/55"
                >
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: isActive ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </button>
              );
            })}
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              aria-label={t("hero.prev")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:border-white/60 hover:bg-white hover:text-slate-900 active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label={t("hero.next")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:border-white/60 hover:bg-white hover:text-slate-900 active:scale-95"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
