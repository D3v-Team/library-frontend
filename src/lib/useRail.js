/**
 * Naqsh 8 — rels inertsiyasi.
 *
 * Cheksiz marquee o'rnini shu oladi: gorizontal ro'yxat foydalanuvchi
 * BOSHQARADI — strelka, drag, g'ildirak, klaviatura, swipe. Kontent
 * o'z-o'zidan qimirlamaydi, ya'ni o'qib turgan odam matnni yo'qotmaydi.
 *
 * Ko'rinishi design/motion.css dagi `.u-rail` da (scroll-snap).
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "./useReducedMotion";

export default function useRail() {
  const ref = useRef(null);
  const [state, setState] = useState({ canPrev: false, canNext: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // 2px — subpiksel yig'indisiga bag'rikenglik, aks holda oxirigacha
    // surilgan relsda "keyingi" tugmasi yonib turadi
    const maxScroll = el.scrollWidth - el.clientWidth;
    setState({
      canPrev: el.scrollLeft > 2,
      canNext: el.scrollLeft < maxScroll - 2,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    measure();
    el.addEventListener("scroll", measure, { passive: true });

    // Kontent keyin kelsa (API javobi) yoki oyna o'lchami o'zgarsa
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
      for (const child of el.children) ro.observe(child);
    }

    return () => {
      el.removeEventListener("scroll", measure);
      ro?.disconnect();
    };
  }, [measure]);

  /** Bir "sahifa" siljish — birinchi elementning kengligi bo'yicha */
  const scrollByStep = useCallback((dir) => {
    const el = ref.current;
    if (!el) return;

    const first = el.firstElementChild;
    const step = first
      ? first.getBoundingClientRect().width + 16
      : el.clientWidth * 0.8;

    el.scrollBy({
      left: dir * step,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  const prev = useCallback(() => scrollByStep(-1), [scrollByStep]);
  const next = useCallback(() => scrollByStep(1), [scrollByStep]);

  /** Rels fokusda bo'lganda ← → ishlaydi */
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    },
    [prev, next],
  );

  return { ref, ...state, prev, next, onKeyDown, remeasure: measure };
}
