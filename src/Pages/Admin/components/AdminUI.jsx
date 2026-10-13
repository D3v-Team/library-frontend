import { AlertTriangle, Eye, Loader2, Pencil, RotateCcw, Trash2 } from "lucide-react";

import cx from "../../../lib/cx";
import Skeleton from "../../../ui/Skeleton";

/**
 * Admin panelining umumiy qurilish bloklari.
 *
 * Audit topilmalari: har sahifa yuklanish holatini `bg-blue-700
 * animate-pulse` bloklari bilan o'zi chizardi (preset da blue-700 —
 * accent rang, ya'ni to'q ko'k-yashil plitalar), shakli ham haqiqiy
 * kontentga o'xshamasdi; holat kalitlari bosiladigan tugmaga emas,
 * nishonga o'xshardi; tahrirlash/o'chirish tugmalarida `aria-label`
 * yo'q edi va har sahifada boshqacha o'lchamda edi. Hammasi shu yerda.
 */

/* ------------------------------------------------------------------ */
/* Skeletonlar — kontent SHAKLIDA, sahifa yuklanganda sakramasin      */
/* ------------------------------------------------------------------ */

const MEDIA_RATIO = {
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-video",
  "3/2": "aspect-[3/2]",
};

/** Bitta kartochka: ixtiyoriy rasm maydoni + 2 qator matn + pastki panel */
export function CardSkeleton({ media = "16/9" }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-hidden="true">
      {media !== "none" && (
        <Skeleton className={cx("w-full", MEDIA_RATIO[media] ?? MEDIA_RATIO["16/9"])} rounded="none" />
      )}
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <Skeleton className="h-5 w-24" rounded="full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

/** Kartochkalar to'ri */
export function CardGridSkeleton({ count = 6, media = "16/9", className }) {
  return (
    <div className={className} aria-busy="true" aria-label="Yuklanmoqda">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} media={media} />
      ))}
    </div>
  );
}

/** Jadval: sarlavha qatori + `rows` ta qator, birinchi ustun ixtiyoriy rasm bilan */
export function TableSkeleton({ rows = 8, cols = 4, thumb = false }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-busy="true" aria-label="Yuklanmoqda">
      <div className="flex gap-6 border-b border-slate-200 bg-slate-50 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={cx("h-3", i === 0 ? "w-40" : "w-20")} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-6 border-b border-slate-100 px-4 py-3 last:border-b-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {thumb && <Skeleton className="h-12 w-9 shrink-0" />}
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
          {Array.from({ length: Math.max(0, cols - 2) }).map((_, c) => (
            <Skeleton key={c} className="hidden h-3 w-16 md:block" />
          ))}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Jadval                                                              */
/* ------------------------------------------------------------------ */

const HIDE_BELOW = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

/**
 * Ixcham ma'lumotlar jadvali — ko'p yozuvli, matnli ma'lumot uchun
 * (mualliflar, kitoblar, janrlar, hujjatlar...).
 *
 *   columns: [{ key, header, cell: (row) => node, className, hideBelow: "sm"|"md"|"lg", align }]
 *
 * Kichik ekranda `hideBelow` ustunlari yashirinadi — gorizontal scroll
 * o'rniga asosiy ustun o'zida qo'shimcha ma'lumotni ko'rsatadi.
 * `isFetching` da (sahifa almashishi, qidiruv) jadval xiralashadi va
 * tepada ingichka yuklanish chizig'i chiqadi.
 */
export function AdminTable({ columns, rows, rowKey = (r) => r.id, isFetching = false, onRowClick }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {isFetching && (
        <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-slate-900/40" />
      )}
      <div className="overflow-x-auto">
        <table className={cx("w-full text-left text-sm transition-opacity", isFetching && "opacity-60")}>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cx(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
                    col.align === "right" && "text-right",
                    HIDE_BELOW[col.hideBelow],
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cx(
                  "border-b border-slate-100 align-middle transition-colors last:border-b-0 hover:bg-slate-50",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cx(
                      "px-4 py-3 text-slate-700",
                      col.align === "right" && "text-right",
                      HIDE_BELOW[col.hideBelow],
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Holat kaliti                                                        */
/* ------------------------------------------------------------------ */

/**
 * Yozuvli kalit (switch). Ilgari "Faol/Nofaol" nishonni bosish kerak edi —
 * bosilishini hech narsa bildirmasdi, kutish holati ham yo'q edi.
 */
export function StatusToggle({
  checked,
  onChange,
  onLabel = "Saytda ko‘rinadi",
  offLabel = "Yashirin",
  pending = false,
  disabled = false,
  compact = false,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      disabled={disabled || pending}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
      className="group inline-flex items-center gap-2 rounded-full text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={cx(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-green-600" : "bg-slate-300",
        )}
      >
        <span
          className={cx(
            "absolute left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform",
            checked && "translate-x-4",
          )}
        >
          {pending && <Loader2 size={10} className="animate-spin text-slate-500" />}
        </span>
      </span>
      {!compact && (
        <span className={cx("whitespace-nowrap", checked ? "text-green-700" : "text-slate-500")}>
          {checked ? onLabel : offLabel}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Qator amallari                                                      */
/* ------------------------------------------------------------------ */

const actionBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-50";

/** Ko'rish / tahrirlash / o'chirish — bir xil o'lcham, yozuv va hover */
export function RowActions({ onView, onEdit, onDelete, viewLabel = "Ko‘rish", editLabel = "Tahrirlash", deleteLabel = "O‘chirish", disabled }) {
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };
  return (
    <div className="flex items-center justify-end gap-2">
      {onView && (
        <button type="button" onClick={stop(onView)} aria-label={viewLabel} title={viewLabel} disabled={disabled}
          className={cx(actionBtn, "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
          <Eye size={16} />
        </button>
      )}
      {onEdit && (
        <button type="button" onClick={stop(onEdit)} aria-label={editLabel} title={editLabel} disabled={disabled}
          className={cx(actionBtn, "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
          <Pencil size={16} />
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={stop(onDelete)} aria-label={deleteLabel} title={deleteLabel} disabled={disabled}
          className={cx(actionBtn, "border-red-200 text-red-500 hover:bg-red-50")}>
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Xato holati                                                         */
/* ------------------------------------------------------------------ */

export function AdminErrorState({ title = "Ma’lumotlarni yuklashda xatolik", onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <AlertTriangle size={24} className="text-red-500" />
      <p className="text-sm font-medium text-red-700">{title}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          <RotateCcw size={14} />
          Qayta urinish
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tillar to'liqligi                                                   */
/* ------------------------------------------------------------------ */

/** Lotin / Kirill / Rus — qaysi tarjima to'ldirilganini ko'rsatadi */
export function LangDots({ record, field }) {
  const langs = [
    { key: "latin", label: "Lotin" },
    { key: "cyril", label: "Kirill" },
    { key: "ru", label: "Rus" },
  ];
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Tarjimalar">
      {langs.map((l) => {
        const filled = Boolean(String(record?.[`${field}_${l.key}`] ?? "").trim());
        return (
          <span
            key={l.key}
            title={`${l.label}: ${filled ? "to‘ldirilgan" : "yo‘q"}`}
            className={cx(
              "rounded px-1 py-px text-[10px] font-semibold uppercase leading-4",
              filled ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-400 line-through",
            )}
          >
            {l.key === "latin" ? "lat" : l.key === "cyril" ? "кир" : "ру"}
          </span>
        );
      })}
    </span>
  );
}
