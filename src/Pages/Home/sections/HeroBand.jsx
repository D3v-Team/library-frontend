import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import cx from "../../../lib/cx";
import useReducedMotion from "../../../lib/useReducedMotion";
import { useLocalized } from "../../../lib/useLocalized";
import { useGetBannersQuery } from "../../../store/services/banners.api";
import { BASE_URL } from "../../../store/api";
import { ArchFrame, Button, GirihSurface, Rule, Skeleton } from "../../../ui";
import GirihStar from "../../../design/motifs/GirihStar";
import StatRibbon from "./StatRibbon";

/**
 * 01 — Peshtoq hero. Signatura sirt.
 *
 * Chap tomonda matn va bitta birlamchi amal, o'ngda rasm peshtoq
 * ravoq ichida (naqsh 4). Pastda haqiqiy statistika lentasi.
 *
 * Harakat budjeti: bu sahifadagi YAGONA ambient harakat — banner
 * avtoplayi va Ken Burns (naqsh 9). Ikkalasi ham hover/fokusda
 * to'xtaydi va `prefers-reduced-motion` da umuman ishlamaydi.
 */
const AUTOPLAY_MS = 6500;

export default function HeroBand() {
  const { t } = useTranslation();
  const { pick } = useLocalized();
  const reduced = useReducedMotion();

  const { data, isLoading } = useGetBannersQuery({ page: 1, limit: 10 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const slides = (data?.data ?? []).filter((b) => b.image_url);
  const count = slides.length;
  const slide = slides[index];

  // Banner soni o'zgarsa (API javobi kelsa) indeks chegaradan chiqmasin
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  /* Avtoplay — pauza, reduced-motion va bitta slayd holatini hisobga oladi */
  useEffect(() => {
    if (reduced || paused || count < 2) return;

    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer.current);
  }, [reduced, paused, count]);

  const go = (dir) => setIndex((i) => (i + dir + count) % count);

  return (
    <GirihSurface as="section" tone="deep" aria-label={t("hero.eyebrow")}>
      {/* Nur motivi — o'ng yuqori burchakda, logotipdagi nurlardan */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />

      
      <div className="mx-auto grid w-full max-w-container items-center gap-8 px-gut py-10 lg:min-h-[calc(100dvh-var(--header-h)-1px)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-12">
        <div className="flex flex-col gap-5">
          <span className="inline-flex items-center gap-2 font-sans text-eyebrow font-semibold uppercase text-gold">
            <GirihStar size={11} />
            {t("hero.eyebrow")}
          </span>

          <h1 className="max-w-measure font-display text-h1 font-semibold text-on-ink">
            {t("home.hero.titleLead")}{" "}
            <em className="not-italic text-gold">{t("home.hero.titleAccent")}</em>{" "}
            {t("home.hero.titleTail")}
          </h1>

          <Rule width="short" />

          <p className="max-w-measure font-sans text-[0.95rem] leading-relaxed text-on-ink/70">
            {t("home.hero.lede")}
          </p>

          {/* Bitta birlamchi amal — kutubxona saytida bu katalog */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="gold" size="lg" to="/books" iconEnd={<ArrowRight size={17} />}>
              {t("home.hero.cta")}
            </Button>

            {slide?.link_url && (
              <Button variant="onInk" size="lg" href={slide.link_url}>
                {t("hero.details")}
              </Button>
            )}
          </div>

          <StatRibbon />
        </div>

        {/* ---------- Rasm: peshtoq ravoq ichida ---------- */}
        {/* max-w va max-h: rasm hero ni cho'zib yubormaydi.
            -translate-y: rasm sal yuqoriga ko'tariladi. Ataylab margin
            emas — translate layout ga tegmaydi, ya'ni hero balandligi
            va statistika lentasining joyi o'zgarmaydi. 32px yuqoriga
            siljish `py-12` (48px) padding ichida qoladi, shuning uchun
            GirihSurface ning `overflow-hidden` i rasmni kesmaydi. */}
        <div
          className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:max-h-[62vh] lg:-translate-y-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {isLoading ? (
            <Skeleton className="aspect-[3/4] w-full" rounded="card" />
          ) : count === 0 ? (
            // Banner yo'q — bo'sh joy emas, naqshli ravoq qoladi
            <ArchFrame ratio="4 / 5">
              <span aria-hidden="true" className="girih-tile absolute inset-0" />
            </ArchFrame>
          ) : (
            <>
              <ArchFrame ratio="4 / 5">
                {slides.map((b, i) => (
                  <img
                    key={b.id ?? i}
                    src={`${BASE_URL}${b.image_url}`}
                    alt={pick(b, "title") || ""}
                    loading={i === 0 ? "eager" : "lazy"}
                    className={cx(
                      "absolute inset-0 h-full w-full object-cover",
                      // Naqsh 6 — krossfeyd, siljish yo'q
                      "transition-opacity duration-4 ease-in-out-soft",
                      i === index ? "opacity-100" : "opacity-0",
                      // Naqsh 9 — Ken Burns, faqat faol slaydda
                      i === index && !reduced && !paused && "u-kenburns",
                    )}
                  />
                ))}

                {/* Sarlavha rasm ustida — pastdan gradient bilan */}
                {pick(slide, "title") && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-deep via-ink-deep/70 to-transparent p-6 pt-16">
                    <span className="block font-display text-[1.05rem] font-medium leading-snug text-on-ink">
                      {pick(slide, "title")}
                    </span>
                  </span>
                )}
              </ArchFrame>

              {count > 1 && (
                <div className="mt-5 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={t("hero.prev")}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-field border border-on-ink/25 text-on-ink/70 transition-colors duration-1 ease-out-soft hover:border-gold hover:text-gold"
                  >
                    <ChevronLeft size={17} strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={t("hero.next")}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-field border border-on-ink/25 text-on-ink/70 transition-colors duration-1 ease-out-soft hover:border-gold hover:text-gold"
                  >
                    <ChevronRight size={17} strokeWidth={1.9} />
                  </button>

                  <span className="ml-2 font-mono text-[0.76rem] text-on-ink/50 tabular">
                    {index + 1} / {count}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </GirihSurface>
  );
}
