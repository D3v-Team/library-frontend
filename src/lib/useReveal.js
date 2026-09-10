/**
 * Naqsh 1 — stagger reveal.
 *
 * Bo'lim ko'rinishga kirganda elementlar ketma-ket chiqadi. BIR MARTA:
 * foydalanuvchi yuqoriga qaytganda hech narsa qayta animatsiya
 * qilinmaydi (hozirgi saytdagi eng bezovta qiluvchi xatti-harakat).
 *
 * MUHIM — boshlang'ich holat KO'RINADIGAN bo'ladi.
 * Yashirish HTML da emas, shu hook ichida qo'yiladi. Sababi: agar
 * markupda `opacity: 0` yozilsa va JS yuklanmasa (xato, sekin tarmoq,
 * eski brauzer) — kontent butunlay ko'rinmas bo'lib qoladi. Bunday
 * sahifa qidiruv tizimi uchun ham bo'sh.
 *
 * Yashirish `useLayoutEffect` da, ya'ni birinchi bo'yashdan OLDIN
 * bajariladi — shuning uchun "ko'rindi → yashirindi → chiqdi"
 * miltillashi bo'lmaydi.
 */

import { useEffect, useLayoutEffect, useRef } from "react";

import { prefersReducedMotion } from "./useReducedMotion";

/**
 * @param {object}  opts
 * @param {number}  opts.stagger  Elementlar orasidagi kechikish, ms
 * @param {boolean} opts.group    true → bevosita bolalar navbat bilan chiqadi
 * @param {number}  opts.margin   Ko'rinishga kirish chegarasi, px
 */
export default function useReveal({ stagger = 45, group = true, margin = -80 } = {}) {
  const ref = useRef(null);
  const done = useRef(false);

  // Bo'yashdan oldin yashiramiz — faqat harakat ruxsat etilgan bo'lsa
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || done.current) return;
    if (prefersReducedMotion()) return;
    // IntersectionObserver bo'lmasa yashirmaymiz ham — aks holda
    // kontent abadiy ko'rinmas qolardi
    if (typeof IntersectionObserver === "undefined") return;

    el.setAttribute(group ? "data-reveal-group" : "data-reveal", "pending");

    if (group) {
      Array.from(el.children).forEach((child, i) => {
        child.style.animationDelay = `${i * stagger}ms`;
      });
    }
  }, [group, stagger]);

  useEffect(() => {
    const el = ref.current;
    if (!el || done.current) return;

    const attr = group ? "data-reveal-group" : "data-reveal";

    // Yashirilmagan bo'lsa (reduced motion / IO yo'q) — ish tugadi
    if (el.getAttribute(attr) !== "pending") {
      done.current = true;
      return;
    }

    const revealNow = () => {
      if (done.current) return;
      el.setAttribute(attr, "in");
      done.current = true;
    };

    // Kuzatuvchi hech bo'lmasa bir marta javob berdimi?
    // Sog'lom sahifada IO kuzatish boshlanishi bilan darhol
    // chaqiriladi (isIntersecting: false bo'lsa ham).
    let spoke = false;
    let timer;

    const io = new IntersectionObserver(
      (entries) => {
        spoke = true;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          revealNow();
          io.disconnect();
        }
      },
      { rootMargin: `0px 0px ${margin}px 0px`, threshold: 0.01 },
    );

    io.observe(el);

    /* XAVFSIZLIK TO'RI.
       Sahifa yashirin holatda yuklansa (fonda ochilgan tab, ba'zi
       ichma-ich freym va panel muhitlari) ko'rinish oynasi balandligi
       0 bo'ladi va hech narsa hech narsa bilan kesishmaydi — ya'ni
       IntersectionObserver UMUMAN chaqirilmaydi. Bunday holda
       kontent `opacity: 0` da abadiy qolib ketardi.

       Shuning uchun: kuzatuvchi belgilangan vaqt ichida bir marta
       ham gapirmasa, kontent shartsiz ko'rsatiladi. Animatsiya
       yo'qoladi, kontent esa yo'qolmaydi — to'g'ri almashtirish.

       Bu o'lchab topilgan holat: yashirin panelda `innerHeight === 0`
       va mustaqil IO ham ishga tushmagani tekshirildi. */
    const armFallback = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!spoke) revealNow();
      }, 1500);
    };

    const onVisibility = () => {
      if (!document.hidden) armFallback();
    };

    if (document.hidden) {
      // Hozir yashirin — ko'rinishga chiqqanda hisoblab boshlaymiz
      document.addEventListener("visibilitychange", onVisibility);
    } else {
      armFallback();
    }

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, [group, margin]);

  return ref;
}
