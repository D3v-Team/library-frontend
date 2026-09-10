import { ChevronLeft, ChevronRight } from "lucide-react";

import cx from "../lib/cx";

/**
 * Oyna paginatsiyasi.
 *
 * Audit topilmasi: hozir katalog BARCHA sahifa raqamlarini chizadi —
 * `Array.from({ length: totalPages })`. 100 sahifa = 100 tugma, ya'ni
 * mobil ekranda paginatsiya kontentdan uzunroq bo'lib ketadi.
 *
 * Bu yerda oyna: birinchi · … · [joriy atrofidagi 3] · … · oxirgi.
 * Tugmalar soni har doim 7 dan oshmaydi.
 */
function windowed(page, total, span = 1) {
  const pages = new Set([1, total]);

  for (let p = page - span; p <= page + span; p += 1) {
    if (p >= 1 && p <= total) pages.add(p);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out = [];

  for (let i = 0; i < sorted.length; i += 1) {
    // Uzilish joyiga "…" qo'yamiz
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("gap");
    out.push(sorted[i]);
  }

  return out;
}

export default function Pagination({ page, totalPages, onChange, disabled, labels }) {
  if (!totalPages || totalPages <= 1) return null;

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
    // Sahifa almashganda tepaga qaytamiz — aks holda foydalanuvchi
    // yangi ro'yxatning o'rtasida qolib ketadi
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cell =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-field border px-3 font-mono text-[0.82rem] tabular transition-colors duration-1 ease-out-soft";

  return (
    <nav aria-label={labels?.nav ?? "Sahifalar"} className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={disabled || page <= 1}
        aria-label={labels?.prev ?? "Oldingi sahifa"}
        className={cx(
          cell,
          page <= 1
            ? "cursor-default border-line-soft text-fg-faint opacity-45"
            : "border-line text-fg-muted hover:border-gold hover:text-fg",
        )}
      >
        <ChevronLeft size={16} strokeWidth={1.9} />
      </button>

      {windowed(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden="true"
            className="px-1 font-mono text-[0.82rem] text-fg-faint"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => go(item)}
            disabled={disabled}
            aria-current={item === page ? "page" : undefined}
            className={cx(
              cell,
              item === page
                ? "border-ink bg-ink text-on-ink"
                : "border-line text-fg-muted hover:border-gold hover:text-fg",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label={labels?.next ?? "Keyingi sahifa"}
        className={cx(
          cell,
          page >= totalPages
            ? "cursor-default border-line-soft text-fg-faint opacity-45"
            : "border-line text-fg-muted hover:border-gold hover:text-fg",
        )}
      >
        <ChevronRight size={16} strokeWidth={1.9} />
      </button>
    </nav>
  );
}
