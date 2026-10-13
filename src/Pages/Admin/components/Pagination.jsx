import WindowedPagination from "../../../patterns/Pagination";

/**
 * Admin paginatsiyasi.
 *
 * Ilgari faqat "‹ ›" tugmalari edi — 2 000 muallif (175+ sahifa) uchun
 * kerakli sahifaga borib bo'lmasdi. Endi saytdagi oynali paginatsiya:
 * 1 … [joriy atrofi] … oxirgi, ustiga jami natijalar soni.
 *
 * Eski API saqlanadi: `page`, `totalPages`, `onChange`; ixtiyoriy
 * `total` (jami yozuvlar) va `disabled` (yuklanayotganda).
 */
export default function Pagination({ page, totalPages, onChange, total, disabled }) {
  if (!totalPages || totalPages <= 1) {
    return total != null && total > 0 ? (
      <p className="px-1 py-4 text-xs text-slate-500">Jami: {total} ta</p>
    ) : null;
  }

  return (
    <div className="flex flex-col items-center gap-3 border-t border-slate-100 px-1 py-4 sm:flex-row sm:justify-between">
      <p className="text-xs text-slate-500">
        {page}-sahifa / {totalPages}
        {total != null && <span className="ml-2 text-slate-400">· jami {total} ta</span>}
      </p>

      <WindowedPagination
        page={page}
        totalPages={totalPages}
        onChange={onChange}
        disabled={disabled}
        size="sm"
        labels={{ nav: "Sahifalar", prev: "Oldingi sahifa", next: "Keyingi sahifa" }}
      />
    </div>
  );
}
