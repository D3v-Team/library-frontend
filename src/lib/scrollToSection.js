import { prefersReducedMotion } from "./useReducedMotion";

/**
 * Sahifa ichidagi blok boshiga scroll — yopishqoq panellar ostida qolmasdan.
 *
 * `scrollIntoView` + `scroll-margin` yetmaydi: sayt header i va katalog
 * filtr paneli ikkalasi ham `sticky top-0`, filtr paneli esa mobilda
 * uch qatorga yoyilib ~200px bo'ladi. Shuning uchun o'sha paytda
 * ekran tepasiga yopishib turgan elementlarning pastki chegarasi
 * o'lchanadi va blok shundan pastga joylanadi.
 */
export default function scrollToSection(el, { gap = 16, onlyIfAbove = false } = {}) {
  if (!el) return;

  const stuckBottom = Math.max(
    0,
    ...[...document.querySelectorAll(".sticky, .fixed")]
      .filter((node) => {
        const style = getComputedStyle(node);
        if (style.position !== "sticky" && style.position !== "fixed") return false;
        const rect = node.getBoundingClientRect();
        // Faqat tepaga yopishganlari (to'liq ekranli overlay emas)
        return rect.top <= 1 && rect.height < window.innerHeight / 2;
      })
      .map((node) => node.getBoundingClientRect().bottom),
  );

  const top = el.getBoundingClientRect().top;
  if (onlyIfAbove && top >= stuckBottom) return;

  window.scrollTo({
    top: top + window.scrollY - stuckBottom - gap,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}
