/**
 * PESHTOQ — mavzu (yorug' / tungi) boshqaruvi.
 *
 * Uch holat bor, ikkitasi emas:
 *   "system" — hech narsa belgilanmaydi, brauzer sozlamasi ishlaydi
 *   "light"  — <html data-theme="light">
 *   "dark"   — <html data-theme="dark">
 *
 * Ranglar CSS tokenlari darajasida almashadi (src/design/tokens.css),
 * shuning uchun bu yerda hech qanday rang yo'q — faqat atribut.
 *
 * Diqqat: "system" holati ham atribut qo'yadi (data-theme="system").
 * Tokenlar tizim sozlamasini ataylab shu atribut bo'lgandagina
 * kuzatadi — nega bunday qilingani tokens.css izohida yozilgan.
 *
 * Sahifa yuklanishida atribut index.html dagi kichik skript orqali
 * React dan OLDIN qo'yiladi, aks holda birinchi kadrda yorug' rejim
 * ko'rinib ketadi ("mavzu miltillashi").
 */

import { useCallback, useEffect, useState } from "react";

export const THEME_KEY = "peshtoq-theme";

const isTheme = (v) => v === "light" || v === "dark";

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return isTheme(v) ? v : "system";
  } catch {
    // Maxfiy oyna yoki bloklangan localStorage — tizim sozlamasiga qaytamiz
    return "system";
  }
}

export function prefersDark() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

/** Tanlovni <html> ga yozadi va saqlaydi. */
export function applyTheme(theme) {
  const root = document.documentElement;

  // "system" ham atribut qo'yadi — tokens.css tizim sozlamasini
  // faqat data-theme="system" bo'lganda kuzatadi (sababi tokens.css da).
  root.setAttribute("data-theme", isTheme(theme) ? theme : "system");

  try {
    if (isTheme(theme)) localStorage.setItem(THEME_KEY, theme);
    else localStorage.removeItem(THEME_KEY);
  } catch {
    // Saqlash imkoni bo'lmasa — mavzu shu sessiyada ishlaydi, xato bermaydi
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [systemDark, setSystemDark] = useState(prefersDark);

  // Tizim sozlamasi o'zgarsa, "system" holatida bo'lsak — kuzatib turamiz
  useEffect(() => {
    let mq;
    const onChange = (e) => setSystemDark(e.matches);

    try {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", onChange);
    } catch {
      return undefined;
    }

    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next) => {
    applyTheme(next);
    setThemeState(isTheme(next) ? next : "system");
  }, []);

  const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // Uch holat aylanasi emas, oddiy almashtirish: foydalanuvchi
  // ko'rgan narsasining teskarisini oladi.
  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return { theme, resolved, setTheme, toggle };
}
