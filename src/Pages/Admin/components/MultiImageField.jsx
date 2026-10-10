import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Star, Trash2, Upload, X } from "lucide-react";

import { formatFileSize, validateImageFile } from "../utils/validators";
import { BASE_URL } from "../../../store/api";

/**
 * Ko'p rasm (tadbirlar uchun, 10 tagacha).
 *
 * Ikki rejim:
 *   · `MultiImagePicker`  — yangi yozuv: fayllar formada yig'iladi va
 *     saqlashda bir so'rov bilan ketadi (CreateEventsDto.images)
 *   · `ImageGalleryManager` — mavjud yozuv: har amal darhol serverga
 *     (yuklash / asosiy qilish / o'chirish), BookDetail dagi kabi
 */
export const MAX_IMAGES = 10;

const toUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

/** Tanlangan fayllarni tekshiradi va bo'sh joy soniga qirqadi */
function acceptFiles(fileList, slots, maxSizeMb) {
  const files = Array.from(fileList ?? []);
  const valid = [];

  for (const file of files) {
    const error = validateImageFile(file, maxSizeMb);
    if (error) {
      toast.error(`${file.name}: ${error}`);
      continue;
    }
    valid.push(file);
  }

  if (valid.length > slots) {
    toast.error(`Ko‘pi bilan ${MAX_IMAGES} ta rasm. ${valid.length - slots} tasi qo‘shilmadi.`);
  }

  return valid.slice(0, Math.max(0, slots));
}

function DropZone({ onFiles, disabled, slots, maxSizeMb, busyLabel }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const full = slots <= 0;

  return (
    <>
      <button
        type="button"
        disabled={disabled || full}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !full) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled && !full) onFiles(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isDragging
            ? "border-green-500 bg-green-50"
            : "border-slate-200 hover:border-green-300 hover:bg-slate-50"
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
          {isDragging ? <Upload size={18} /> : <ImagePlus size={18} />}
        </div>
        <p className="text-sm font-medium text-slate-700">
          {busyLabel ||
            (full
              ? `Limitga yetildi — ${MAX_IMAGES} ta rasm`
              : "Rasmlarni tanlang yoki tashlang (bir nechtasini birdan)")}
        </p>
        <p className="text-xs text-slate-400">
          JPG, PNG, WEBP · har biri {maxSizeMb} MB gacha · yana {Math.max(0, slots)} ta qo‘shish mumkin
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}

function Counter({ count }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        count >= MAX_IMAGES ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {count} / {MAX_IMAGES}
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function MultiImagePicker({ label = "Tadbir rasmlari", value = [], onChange, maxSizeMb = 5 }) {
  const previews = useMemo(() => value.map((file) => URL.createObjectURL(file)), [value]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const add = (fileList) => {
    const next = acceptFiles(fileList, MAX_IMAGES - value.length, maxSizeMb);
    if (next.length) onChange([...value, ...next]);
  };

  const remove = (index) => onChange(value.filter((_, i) => i !== index));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <Counter count={value.length} />
      </div>

      <DropZone onFiles={add} slots={MAX_IMAGES - value.length} maxSizeMb={maxSizeMb} />

      {value.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {value.map((file, i) => (
            <li key={`${file.name}-${file.lastModified}-${i}`} className="group relative">
              <img
                src={previews[i]}
                alt=""
                className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
              />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  1-rasm
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`${file.name} ni olib tashlash`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-white/95 text-slate-500 shadow-sm transition hover:text-red-600"
              >
                <X size={13} />
              </button>
              <p className="mt-1 truncate text-[11px] text-slate-400" title={file.name}>
                {formatFileSize(file.size)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-xs text-slate-400">
        Muqova tanlanmasa, birinchi rasm muqova bo‘ladi.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function ImageGalleryManager({
  label = "Tadbir rasmlari",
  images = [],
  isLoading = false,
  onUpload,
  onSetMain,
  onDelete,
  maxSizeMb = 5,
}) {
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const sorted = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const slots = MAX_IMAGES - sorted.length;

  const add = async (fileList) => {
    const files = acceptFiles(fileList, slots, maxSizeMb);
    if (!files.length) return;

    setUploading(true);
    try {
      await onUpload(files);
      toast.success(`${files.length} ta rasm yuklandi`);
    } catch {
      // xabarni chaqiruvchi ko'rsatadi
    } finally {
      setUploading(false);
    }
  };

  const run = async (id, fn) => {
    setBusyId(id);
    try {
      await fn();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <Counter count={sorted.length} />
      </div>

      <DropZone
        onFiles={add}
        disabled={uploading}
        slots={slots}
        maxSizeMb={maxSizeMb}
        busyLabel={uploading ? "Rasmlar yuklanmoqda..." : null}
      />

      {isLoading ? (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {sorted.map((img) => {
            const busy = busyId === img.id;
            return (
              <li key={img.id} className={`group relative ${busy ? "opacity-50" : ""}`}>
                <img
                  src={toUrl(img.url || img.image_url || img.path)}
                  alt=""
                  className={`aspect-square w-full rounded-lg object-cover ${
                    img.is_main ? "ring-2 ring-slate-900 ring-offset-1" : "border border-slate-200"
                  }`}
                />

                {img.is_main && (
                  <span className="absolute left-1 top-1 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Muqova
                  </span>
                )}

                <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-lg bg-black/45 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  {!img.is_main && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(img.id, () => onSetMain(img.id))}
                      title="Muqova qilish"
                      aria-label="Muqova qilish"
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-700 hover:text-amber-600"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(img.id, () => onDelete(img.id))}
                    title="O‘chirish"
                    aria-label="O‘chirish"
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-slate-400">Hozircha qo‘shimcha rasm yo‘q.</p>
      )}
    </div>
  );
}
