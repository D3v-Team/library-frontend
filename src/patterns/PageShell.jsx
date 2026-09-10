import cx from "../lib/cx";
import Breadcrumbs from "./Breadcrumbs";
import GirihSurface from "../ui/GirihSurface";
import Rule from "../ui/Rule";

/**
 * Ichki sahifalarning yagona karkasi.
 *
 * Audit topilmasi: hozir har sahifa o'z sarlavhasini o'zi ixtiro
 * qiladi — kimi `text-3xl`, kimi `text-4xl`, kimi `text-2xl`;
 * yuqori padding `pt-10`, `pt-16`, `pt-24` bo'lib ketgan; ba'zi
 * sahifada breadcrumb bor, ko'pida yo'q.
 *
 * Tuzilma:
 *   siyoh sarlavha lentasi (girih naqsh bilan)
 *     breadcrumb → eyebrow → h1 → tilla chiziq → lid → meta
 *   ixtiyoriy filtr paneli (yopishqoq)
 *   kontent
 *
 * Sarlavha lentasi "boylik retsepti" ning signatura sirt qoidasini
 * avtomatik bajaradi: har ichki sahifada kamida bitta to'q sirt
 * bo'ladi va sahifa quruq boshlanmaydi.
 */
export default function PageShell({
  breadcrumbs,
  eyebrow,
  title,
  lede,
  meta,
  filters,
  actions,
  children,
  className,
}) {
  return (
    <div className={className}>
      {/* Lenta ataylab ixcham: ilgari `pt-14 pb-14` + `mb-7` breadcrumb
          + `gap-3.5` bilan u tadbir sahifasida 285px, ya'ni ekranning
          40% ini egallardi. Foydalanuvchi kontentga yetguncha
          breadcrumb, eyebrow, sarlavha va meta'ni o'tishi kerak edi. */}
      <GirihSurface as="header" parallax className="pb-8 pt-7 sm:pb-10 sm:pt-9">
        <div className="mx-auto w-full max-w-container px-gut">
          {breadcrumbs?.length ? (
            <Breadcrumbs items={breadcrumbs} onInk className="mb-4" />
          ) : null}

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3">
              {eyebrow && (
                <span className="font-sans text-eyebrow font-semibold uppercase text-gold">
                  {eyebrow}
                </span>
              )}

              <h1 className="max-w-measure text-h1 font-semibold text-on-ink">
                {title}
              </h1>

              <Rule width="short" />

              {lede && (
                <p className="max-w-measure font-sans text-[0.95rem] leading-relaxed text-on-ink/70">
                  {lede}
                </p>
              )}

              {/* Kontekst raqamlari — "Fondda 4 312 kitob · 128 muallif".
                  Bu sahifaning o'z o'lchamini aytadi va quruqlikni
                  yo'qotadi (boylik retsepti, 3-qoida). */}
              {meta && (
                <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.76rem] text-on-ink/60 tabular">
                  {meta}
                </dl>
              )}
            </div>

            {actions && <div className="flex shrink-0 flex-wrap gap-2.5">{actions}</div>}
          </div>
        </div>
      </GirihSurface>

      {filters && (
        <div
          className={cx(
            "sticky top-0 z-20 border-b border-line",
            "bg-page/90 backdrop-blur supports-[backdrop-filter]:bg-page/80",
          )}
        >
          <div className="mx-auto w-full max-w-container px-gut py-3.5">{filters}</div>
        </div>
      )}

      <div className="mx-auto w-full max-w-container px-gut py-8 sm:py-11">
        {children}
      </div>
    </div>
  );
}

/** Sarlavha lentasidagi bitta raqam: PageShell `meta` ichida ishlatiladi */
export function PageMeta({ label, value }) {
  if (value == null || value === "") return null;

  return (
    <div className="flex items-baseline gap-2">
      {/* /45 emas: o'lchandi, u 12px da 4.12:1 kontrast berardi va
          WCAG AA 4.5:1 talab qiladi — yorliqlar ko'zga tushmasdi. */}
      <dt className="text-on-ink/60">{label}</dt>
      <dd className="font-medium text-on-ink/85">{value}</dd>
    </div>
  );
}
