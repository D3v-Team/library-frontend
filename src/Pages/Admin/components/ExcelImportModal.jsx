import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, FileSpreadsheet, Upload, X, AlertTriangle } from "lucide-react";

import Modal from "./Modal";
import { formatFileSize, validateDocumentFile } from "../utils/validators";
import { useImportBooksExcelMutation } from "../../../store/services/books.api";
import apiError from "../../../lib/apiError";

/**
 * Kitoblarni Excel (.xlsx) dan ommaviy yuklash.
 *
 * Backend (POST /books/import-excel) faqat matnli ustunlarni oladi —
 * rasm va janr yo'q. Bunday kitoblar saytda katalog kartochkalariga
 * emas, "Fond ro'yxati" jadvaliga chiqadi.
 *
 * Fayl tanlanishi bilan yuborilmaydi: admin avval nomi/hajmini ko'radi,
 * keyin "Import qilish" ni bosadi — noto'g'ri fayl tasodifan ketmasin.
 */
const COLUMNS = [
  { key: "name_latin", label: "Kitob nomi (lotin)", example: "O'tkan kunlar" },
  { key: "name_cyril", label: "Kitob nomi (kirill)", example: "Ўткан кунлар" },
  { key: "name_ru", label: "Kitob nomi (rus)", example: "Минувшие дни" },
  { key: "author_name", label: "Muallif", example: "Abdulla Qodiriy" },
  { key: "quantity", label: "Nusxa soni", example: "3" },
];

const MAX_SIZE_MB = 10;

/** Javob shakli hujjatlashtirilmagan — ma'lum bo'lgan nomlarni qidiramiz */
function summarize(res) {
  const box = res?.data && !Array.isArray(res.data) ? res.data : res ?? {};
  const pickNum = (...keys) => {
    for (const k of keys) {
      const v = box[k];
      if (typeof v === "number") return v;
      if (Array.isArray(v)) return v.length;
    }
    return null;
  };

  return {
    message: typeof box.message === "string" ? box.message : null,
    imported: pickNum("imported", "created", "success", "successCount", "inserted", "count", "books"),
    skipped: pickNum("skipped", "duplicates", "failed", "failedCount"),
    errors: Array.isArray(box.errors) ? box.errors.slice(0, 10) : [],
  };
}

export default function ExcelImportModal({ open, onClose }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState(null);

  const [importExcel, { isLoading }] = useImportBooksExcelMutation();

  const reset = () => {
    setFile(null);
    setResult(null);
    setIsDragging(false);
  };

  const handleClose = () => {
    if (isLoading) return;
    reset();
    onClose();
  };

  const pick = (f) => {
    if (!f) return;
    const error = validateDocumentFile(f, MAX_SIZE_MB, ["xlsx"]);
    if (error) {
      toast.error(error);
      return;
    }
    setResult(null);
    setFile(f);
  };

  const submit = async () => {
    if (!file) return;

    try {
      const res = await importExcel(file).unwrap();
      const summary = summarize(res);
      setResult(summary);
      setFile(null);
      toast.success(
        summary.imported != null
          ? `${summary.imported} ta kitob import qilindi`
          : "Excel fayli muvaffaqiyatli yuklandi",
      );
    } catch (err) {
      toast.error(apiError(err, "Excel faylini import qilishda xatolik"));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Excel orqali kitob yuklash"
      description="Bir nechta kitobni .xlsx fayldan bir martada qo‘shing."
      size="md"
    >
      <div className="space-y-5">
        {/* Ustunlar talabi */}
        <div className="rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <p className="text-sm font-medium text-slate-800">Fayl tuzilishi</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Birinchi qatorga quyidagi ustun nomlarini yozing.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th className="px-4 py-2 font-medium">Ustun</th>
                  <th className="px-4 py-2 font-medium">Ma’nosi</th>
                  <th className="px-4 py-2 font-medium">Namuna</th>
                </tr>
              </thead>
              <tbody>
                {COLUMNS.map((col) => (
                  <tr key={col.key} className="border-t border-slate-100">
                    <td className="px-4 py-2">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">
                        {col.key}
                      </code>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{col.label}</td>
                    <td className="px-4 py-2 text-slate-400">{col.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500">
            Rasm va janr Excel orqali qo‘shilmaydi. Bunday kitoblar saytda
            “Fond ro‘yxati” jadvalida ko‘rinadi.
          </p>
        </div>

        {/* Fayl tanlash */}
        {file ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <FileSpreadsheet size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              disabled={isLoading}
              aria-label="Faylni olib tashlash"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              pick(e.dataTransfer.files?.[0]);
            }}
            className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
              isDragging
                ? "border-green-500 bg-green-50"
                : "border-slate-200 hover:border-green-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700">
              {isDragging ? <Upload size={18} /> : <FileSpreadsheet size={18} />}
            </div>
            <p className="text-sm font-medium text-slate-700">
              Excel faylini tanlang yoki shu yerga tashlang
            </p>
            <p className="text-xs text-slate-400">Faqat .XLSX · maksimal {MAX_SIZE_MB} MB</p>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {/* Natija */}
        {result && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-700" />
              <div className="min-w-0 space-y-1 text-sm">
                <p className="font-medium text-green-800">
                  {result.message || "Import yakunlandi"}
                </p>
                {result.imported != null && (
                  <p className="text-green-700">Qo‘shildi: {result.imported} ta kitob</p>
                )}
                {result.skipped != null && result.skipped > 0 && (
                  <p className="text-amber-700">O‘tkazib yuborildi: {result.skipped} ta qator</p>
                )}
              </div>
            </div>

            {result.errors.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-green-200 pt-3 text-xs text-amber-800">
                {result.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                    <span className="break-words">
                      {typeof err === "string" ? err : err?.message || JSON.stringify(err)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {result ? "Yopish" : "Bekor qilish"}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!file || isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Upload size={15} />
            {isLoading ? "Yuklanmoqda..." : "Import qilish"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
