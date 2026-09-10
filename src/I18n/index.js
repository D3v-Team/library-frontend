// src/i18n/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import uz from "./locales/uz.json";
import ru from "./locales/ru.json";
import cyrl from "./locales/cyrl.json";

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  cyrl: { translation: cyrl },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "uz",

    // Brauzer "en-GB", "uz-UZ" kabi region bilan til kodini qaytaradi.
    // Bu uchtasi bo'lmasa i18n.language shundayligicha qolib ketadi va
    // komponentlardagi i18n.language === "uz" solishtirishlari hech qachon
    // bajarilmaydi (headerda ham "EN-GB" chiqadi).
    supportedLngs: ["uz", "ru", "cyrl"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",

    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],

      // "uz-UZ" / "en-GB" kabi region qo'shimchasini kesib tashlaydi.
      // supportedLngs bilan birga: uz-UZ -> uz, en-GB -> en -> (qo'llab-
      // quvvatlanmaydi) -> fallback uz. Shu bilan i18n.language doim
      // "uz" | "ru" | "cyrl" dan biri bo'ladi.
      convertDetectedLanguage: (lng) => lng.split("-")[0],
    },
  });

// <html lang> ni tanlangan tilga sinxronlaydi.
// Bu ekran o'qish dasturlari uchun (to'g'ri talaffuz), brauzerning
// tire bilan bo'lish qoidalari va SEO uchun kerak.
// Audit topilmasi: index.html da lang doim "en" edi.
const HTML_LANG = {
  uz: "uz",
  ru: "ru",
  cyrl: "uz-Cyrl",
};

function syncHtmlLang(lng) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = HTML_LANG[lng] || "uz";
}

syncHtmlLang(i18n.language);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;