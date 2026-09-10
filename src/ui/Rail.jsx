import { ChevronLeft, ChevronRight } from "lucide-react";

import cx from "../lib/cx";
import useRail from "../lib/useRail";

/**
 * Naqsh 8 — rels.
 *
 * Marquee ning o'rnini bosadi. Farqi: kontent o'z-o'zidan
 * qimirlamaydi. Foydalanuvchi strelka, drag, g'ildirak, swipe yoki
 * ← → bilan boshqaradi.
 *
 * Nega bu muhim: cheksiz aylanuvchi lentada odam sarlavhani o'qib
 * tugatishga ulgurmaydi va kursorni obyektga olib borgunicha u
 * siljib ketadi. Bosish kerak bo'lgan kontent qimirlamasligi kerak.
 *
 * Chetlarga tushib qolgan tugma bosilmaydi — shuning uchun strelkalar
 * o'chirilgan holatda ham joyida qoladi (layout sakramaydi).
 */
export default function Rail({
  label,
  controls = true,
  className,
  railClassName,
  children,
}) {
  const { ref, canPrev, canNext, prev, next, onKeyDown } = useRail();

  return (
    <div className={cx("relative", className)}>
      <div
        ref={ref}
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={cx("u-rail pb-1", railClassName)}
      >
        {children}
      </div>

      {controls && (
        <div className="mt-4 flex items-center gap-2">
          <RailButton
            onClick={prev}
            disabled={!canPrev}
            label="Orqaga"
            icon={<ChevronLeft size={16} strokeWidth={1.9} />}
          />
          <RailButton
            onClick={next}
            disabled={!canNext}
            label="Oldinga"
            icon={<ChevronRight size={16} strokeWidth={1.9} />}
          />
        </div>
      )}
    </div>
  );
}

function RailButton({ onClick, disabled, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cx(
        "inline-flex h-10 w-10 items-center justify-center rounded-field border",
        "transition-colors duration-1 ease-out-soft",
        disabled
          ? "cursor-default border-line-soft text-fg-faint opacity-45"
          : "border-line text-fg-muted hover:border-gold hover:text-fg",
      )}
    >
      {icon}
    </button>
  );
}
