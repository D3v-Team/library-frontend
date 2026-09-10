import cx from "../lib/cx";

/**
 * Holat va kategoriya nishoni.
 *
 * Diqqat — opasitet qiymatlari 5 ga karrali (`/10`, `/35`, `/40`).
 * Sababi tailwind.preset.js izohida: shkaladan tashqari qiymat
 * (`/12`) jim-jitlik bilan CSS ga tushmaydi.
 *
 * Rang MA'NO tashiydi, bezak emas:
 *   neutral — kategoriya, janr (ma'no yo'q)
 *   gold    — ajratilgan, tanlangan
 *   olive   — mavjud, muvaffaqiyat, "elektron nusxa bor"
 *   clay    — band, tugagan, xato
 *   lapis   — ma'lumot, yangi
 */
const TONES = {
  neutral: "border-line bg-paper-3 text-fg-muted",
  gold: "border-gold/40 bg-gold/10 text-gold-dim",
  olive: "border-olive/35 bg-olive/10 text-olive",
  clay: "border-clay/35 bg-clay/10 text-clay",
  lapis: "border-accent/35 bg-accent/10 text-accent",
};

export default function Badge({ tone = "neutral", className, children, ...rest }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-field border px-2 py-1",
        "font-sans text-[0.68rem] font-semibold uppercase tracking-[0.08em]",
        TONES[tone] || TONES.neutral,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
