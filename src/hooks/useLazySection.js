// src/hooks/useLazySection.js
// Section viewport ga 600px yaqinlashganda render qiladi.
// Bir marta true bo'lsa qayta false bo'lmaydi — unmount bo'lmaydi.

import { useEffect, useRef, useState } from "react";

/**
 * @param {string} [rootMargin="0px 0px 600px 0px"]
 *   Qancha oldin trigger qilinsin (pastdan 600px viewport oldidan)
 */
export function useLazySection(rootMargin = "0px 0px 600px 0px") {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Agar allaqachon ko'ringan bo'lsa observer kerak emas
    if (visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // bir marta trigger — disconnect
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return { ref, visible };
}
