import { Pencil, Trash2 } from "lucide-react";

/**
 * Static UI placeholder — the rows below are hard-coded sample content
 * purely to show the intended table shape. There is no API call and no
 * real data source here; wiring this up is future backend work.
 */
export default function AdminTablePlaceholder({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 font-semibold text-slate-600"
                >
                  {col}
                </th>
              ))}
              <th className="px-5 py-3 text-right font-semibold text-slate-600">
                Amallar
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="transition-colors duration-150 hover:bg-slate-50"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-5 py-4 text-slate-700">
                    {cell}
                  </td>
                ))}

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      aria-label="Tahrirlash"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      aria-label="O‘chirish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors duration-150 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-400">
        Namunaviy qatorlar — backend ulanganda haqiqiy ma'lumotlar shu yerda
        chiqadi.
      </div>
    </div>
  );
}
