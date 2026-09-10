/**
 * Foydalanuvchi harakatni kamaytirishni so'raganini bildiradi.
 *
 * CSS darajasida global o'chirgich design/base.css da bor, lekin
 * JS ham buni bilishi kerak: IntersectionObserver va rels
 * animatsiyalari umuman ishga tushmasligi kerak, "0ms davomiylik
 * bilan ishlashi" emas.
 */

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Hook dan tashqarida ham kerak bo'ladi (masalan, scrollTo behavior) */
export function prefersReducedMotion() {
  try {
    return window.matchMedia(QUERY).matches;
  } catch {
    return false;
  }
}

export default function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    let mq;
    const onChange = (e) => setReduced(e.matches);

    try {
      mq = window.matchMedia(QUERY);
      mq.addEventListener("change", onChange);
    } catch {
      return undefined;
    }

    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
