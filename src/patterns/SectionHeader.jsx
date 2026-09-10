import cx from "../lib/cx";
import GirihStar from "../design/motifs/GirihStar";
import Rule from "../ui/Rule";

/**
 * Bo'lim sarlavhasi.
 *
 * Audit topilmasi: shu blok saytda 8+ marta qo'lda ko'chirilgan —
 * `<span className="h-7 w-1 rounded-full bg-blue-700" />` + h2.
 * Ko'chirilganda har biri o'zgargan: rang `bg-blue-700`,
 * `bg-slate-900`, `bg-slate-300` bo'lib ketgan; ba'zisida lid bor,
 * ba'zisida yo'q; "hammasi" havolasi har xil joyda.
 *
 * Bu yerda bitta tuzilma:
 *   eyebrow (girih + kichik yozuv) → sarlavha → tilla chiziq → lid
 * O'ng tomonda ixtiyoriy harakat (masalan "Barchasi").
 *
 * `onInk` — signatura sirt ustida ishlatilganda ranglar teskari.
 */
export default function SectionHeader({
  eyebrow,
  title,
  lede,
  action,
  as: Heading = "h2",
  align = "start",
  onInk = false,
  className,
}) {
  const centered = align === "center";

  return (
    <div
      className={cx(
        "flex flex-col gap-4",
        !centered && action && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cx("flex flex-col gap-3", centered && "items-center text-center")}>
        {eyebrow && (
          <span
            className={cx(
              "inline-flex items-center gap-2 font-sans text-eyebrow font-semibold uppercase",
              onInk ? "text-gold" : "text-gold-dim",
            )}
          >
            <GirihStar size={11} />
            {eyebrow}
          </span>
        )}

        <Heading
          className={cx(
            "text-h2 font-semibold",
            onInk ? "text-on-ink" : "text-fg",
          )}
        >
          {title}
        </Heading>

        {/* Chiziq lid bo'lsa uning ustida, bo'lmasa sarlavha ostida */}
        <Rule width="short" className={centered && "mx-auto"} />

        {lede && (
          <p
            className={cx(
              "max-w-measure font-sans text-[0.92rem] leading-relaxed",
              onInk ? "text-on-ink/70" : "text-fg-muted",
            )}
          >
            {lede}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
