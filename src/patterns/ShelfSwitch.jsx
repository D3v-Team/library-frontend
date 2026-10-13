import { useRef } from "react";

import cx from "../lib/cx";
import { useLocalized } from "../lib/useLocalized";

/**
 * Bo'lim tortmalari — katalog qutisining tortmalari.
 * Kitoblar (katalog / kartoteka) va mualliflar (profil / ko'rsatkich)
 * sahifalarida bir xil.
 *
 * Kutubxonadagi kartoteka shkafi metafora: har tortma old yuzida
 * yorliq (nom + son) va pastda tutqich. Ochiq tortma — siyoh rangda.
 *
 * Nima uchun tablar: ilgari kartoteka katalog gridi OSTIDA turardi,
 * ya'ni 3 qator muqovadan keyin u ekrandan ancha pastda qolib
 * ketardi va ko'pchilik uni ko'rmasdi ham. Endi ikkala bo'lim tepada
 * yonma-yon, sonlari bilan — qidiruv natijasi qaysi tortmada
 * ekani darhol ko'rinadi.
 *
 * ARIA tablist: ← → bilan tortmalar orasida yuriladi.
 *
 *   shelves — [{ key, icon, title, hint }]
 *   counts  — { [key]: son }
 */
export default function ShelfSwitch({ shelves, value, onChange, counts, loading, panelId, label }) {
  const { formatNumber } = useLocalized();
  const refs = useRef({});

  const onKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const index = shelves.findIndex((s) => s.key === value);
    const step = e.key === "ArrowRight" ? 1 : -1;
    const next = shelves[(index + step + shelves.length) % shelves.length].key;
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="grid grid-cols-2 gap-3 sm:max-w-2xl sm:gap-4"
      onKeyDown={onKeyDown}
    >
      {shelves.map(({ key, icon: Icon, title, hint }) => {
        const active = value === key;
        const count = counts[key];

        return (
          <button
            key={key}
            ref={(node) => {
              refs.current[key] = node;
            }}
            type="button"
            role="tab"
            id={`shelf-tab-${key}`}
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(key)}
            className={cx(
              "group relative flex items-center gap-3 overflow-hidden rounded-card border px-3.5 pb-5 pt-3.5 text-left sm:gap-4 sm:px-5",
              "transition-colors duration-2 ease-out-soft",
              active
                ? "border-ink bg-ink text-on-ink shadow-s1"
                : "border-line bg-paper-2 text-fg hover:border-gold/40 hover:bg-paper-3",
            )}
          >
            <span
              className={cx(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-field transition-colors duration-2 ease-out-soft sm:h-11 sm:w-11",
                active ? "bg-on-ink/10 text-gold" : "bg-paper-3 text-gold-dim group-hover:bg-page",
              )}
            >
              <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-[0.98rem] font-semibold leading-tight sm:text-[1.05rem]">
                  {title}
                </span>
                <span
                  className={cx(
                    "font-mono text-[0.78rem] tabular",
                    active ? "text-gold" : "text-fg-faint",
                  )}
                >
                  {loading || count == null ? "—" : formatNumber(count)}
                </span>
              </span>
              <span
                className={cx(
                  "mt-0.5 hidden truncate font-sans text-[0.76rem] sm:block",
                  active ? "text-on-ink/60" : "text-fg-muted",
                )}
              >
                {hint}
              </span>
            </span>

            {/* Tortma tutqichi — mis rangli kichik planka */}
            <span
              aria-hidden="true"
              className={cx(
                "absolute bottom-2 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full transition-colors duration-2 ease-out-soft",
                active ? "bg-gold" : "bg-line group-hover:bg-gold/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
