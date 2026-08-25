// API'dan kelgan HTML kontentni render qilishdan oldin tozalaydi.
//
// Sahifa matnlari (`/pages/:slug` → content_latin / content_cyril / content_ru)
// admin panelda yoziladi va public sahifalarda dangerouslySetInnerHTML bilan
// render qilinadi. Agar admin hisobi buzilsa yoki backend tekshiruvi yetarli
// bo'lmasa, o'sha maydonga <script> yoki onerror=... joylash mumkin edi.
// Shu sababli render oldidan doim shu funksiyadan o'tkazamiz.

import DOMPurify from "dompurify";

// Kontent muharririda ishlatiladigan teglar — matn formatlash, ro'yxatlar,
// jadvallar, havolalar va rasmlar. <script>, <iframe>, <object>, <form>,
// <style> va hodisa atributlari ruxsat etilmagan.
const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "span",
  "div",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "ul",
  "ol",
  "li",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "img",
  "figure",
  "figcaption",
];

const ALLOWED_ATTR = [
  "href",
  "title",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "colspan",
  "rowspan",
  "class",
];

// href/src uchun faqat http(s), mailto, tel va nisbiy manzillar.
// javascript: va data: sxemalari shu bilan bloklanadi.
const ALLOWED_URI_REGEXP = /^(?:https?:|mailto:|tel:|[/#]|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i;

let hookRegistered = false;

function registerHooks() {
  if (hookRegistered) return;

  // Kontent ichidagi target="_blank" havolalar uchun rel majburiy —
  // aks holda yangi oyna window.opener orqali sahifani boshqara oladi.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  hookRegistered = true;
}

/**
 * API'dan kelgan HTML matnni xavfsiz HTML'ga aylantiradi.
 * Natija to'g'ridan-to'g'ri dangerouslySetInnerHTML ga berilishi mumkin.
 */
export function sanitizeHtml(html) {
  if (!html) return "";

  registerHooks();

  return DOMPurify.sanitize(String(html), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["style", "srcset", "formaction", "onerror", "onload", "onclick"],
    ALLOW_DATA_ATTR: false,
  });
}
