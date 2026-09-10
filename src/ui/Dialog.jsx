import { useCallback, useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

import cx from "../lib/cx";
import { prefersReducedMotion } from "../lib/useReducedMotion";

/**
 * Modal oyna.
 *
 * Audit topilmasi: hozirgi modallar (kitob buyurtmasi, murojaat) shunchaki
 * `fixed inset-0` div — fokus tuzoqqa olinmaydi, `aria-modal` yo'q,
 * ochilganda fokus ichkariga o'tmaydi va yopilganda chaqirgan tugmaga
 * qaytmaydi. Klaviatura foydalanuvchisi modal ortidagi sahifa bo'ylab
 * Tab bosib "yo'qolib qoladi".
 *
 * Bu yerda hammasi bir joyda: Esc, tashqariga bosish, scroll bloki,
 * fokus tuzog'i va fokusni qaytarish.
 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  icon,
  size = "md",
  children,
  footer,
}) {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  /* Ochilish/yopilish holati.
     `mounted` — element DOM da turadimi. Yopilganda u darhol
     olib tashlanmaydi: chiqish animatsiyasi tugashini kutadi.

     Ikkinchi kadr (`requestAnimationFrame`) KERAK EMAS — harakat
     CSS animatsiyasi bilan berilgan va boshlang'ich holatni o'z
     keyframe idan oladi (motion.css dagi izohga qarang). Shuning
     uchun `data-open` birinchi renderda darhol "true" bo'ladi. */
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }

    if (prefersReducedMotion()) {
      setMounted(false);
      return undefined;
    }

    // 200ms — motion.css dagi chiqish davomiyligi (--d-2)
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [open]);

  /* Fokus `mounted` ga bog'langan, `open` ga emas.
     Sabab: `open` true bo'lgan renderda panel hali DOM da yo'q
     (`mounted` keyingi renderda yoqiladi), ya'ni `open` ga bog'lasak
     panelRef bo'sh bo'lib, fokus modalga umuman o'tmaydi. */
  useEffect(() => {
    if (!mounted) return;
    returnFocusRef.current = document.activeElement;

    // Fokusni panel ichidagi birinchi elementga o'tkazamiz
    const panel = panelRef.current;
    const first = panel?.querySelector(
      'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])',
    );
    (first || panel)?.focus?.();

    return () => {
      // Yopilganda fokus chaqirgan tugmaga qaytadi
      returnFocusRef.current?.focus?.();
    };
  }, [mounted]);

  /* Sahifa scrolli bloklanadi — `mounted` bo'ylab, ya'ni chiqish
     animatsiyasi tugaguncha. `open` ga bog'lansa, panel hali
     siljib turganda scroll ochilib, sahifa sakrab ketardi. */
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }

      // Fokus tuzog'i: Tab panel ichida aylanadi
      if (e.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes?.length) return;

      const list = Array.from(nodes).filter((n) => n.offsetParent !== null);
      if (!list.length) return;

      const first = list[0];
      const last = list[list.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!mounted) return null;

  return (
    <div
      data-open={open ? "true" : "false"}
      className="u-dialog-veil fixed inset-0 z-[60] flex items-end justify-center bg-ink-deep/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        // Faqat fondning o'ziga bosilganda yopiladi (panel ichidan emas)
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        data-open={open ? "true" : "false"}
        className={cx(
          "u-dialog-panel flex max-h-[92dvh] w-full flex-col overflow-hidden bg-paper-2 shadow-s2",
          "rounded-t-panel sm:rounded-panel border border-line",
          size === "lg" ? "sm:max-w-2xl" : size === "sm" ? "sm:max-w-md" : "sm:max-w-lg",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-ink text-gold">
                {icon}
              </span>
            )}
            <div>
              {title && (
                <h2 id={titleId} className="text-h3 font-semibold text-fg">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-1 font-sans text-[0.82rem] text-fg-muted">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-field text-fg-faint transition-colors duration-1 ease-out-soft hover:bg-paper-3 hover:text-fg"
          >
            <X size={18} strokeWidth={1.9} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="border-t border-line-soft bg-paper-3/60 px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
