import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  formatFileSize,
  validateDocumentFile,
} from "../utils/validators";

/**
 * Document (non-image) upload field — drag & drop + browse, client-side
 * type/size validation, and a lightweight progress indicator while the
 * parent's upload mutation is in flight.
 *
 * onUpload(file): should return the in-flight promise from the RTK Query
 *   mutation call so this field can show/hide the progress state and
 *   disable itself for the duration.
 */
export default function FileUploadField({
  label = "Fayl yuklash",
  onUpload,
  maxSizeMb = 5,
  disabled = false,
  allowedExtensions = ALLOWED_DOCUMENT_EXTENSIONS,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const isBusy = disabled || isUploading;

  const runUpload = async (file) => {
    setIsUploading(true);
    setProgress(8);

    // True byte-level progress needs onUploadProgress wired through the
    // axios instance per-request; until that's threaded through, this
    // gives the admin real feedback that something is happening instead
    // of a frozen button.
    const tick = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 200);

    try {
      await onUpload(file);
      setProgress(100);
    } finally {
      clearInterval(tick);
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 300);
    }
  };

  const handleFile = (file) => {
    if (!file || isBusy) return;

    const validationError = validateDocumentFile(file, maxSizeMb, allowedExtensions);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    runUpload(file);
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isBusy) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      )}

      <button
        type="button"
        disabled={isBusy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isBusy) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isDragging
            ? "border-slate-900 bg-slate-50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {isUploading ? <Upload size={18} className="animate-pulse" /> : <FileText size={18} />}
        </div>

        {isUploading ? (
          <div className="w-full max-w-[220px]">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Yuklanmoqda...</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-700">
              Faylni shu yerga tashlang yoki tanlang
            </p>
            <p className="text-xs text-slate-400">
              {allowedExtensions.join(", ").toUpperCase()} · maksimal{" "}
              {maxSizeMb}MB
            </p>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={allowedExtensions.map((ext) => `.${ext}`).join(",")}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}

export function FileListItem({ file, onDelete, onDownload, isDeleting }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <FileText size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          {file.name || file.original_name || "Fayl"}
        </p>
        {file.size ? (
          <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onDownload}
          aria-label="Yuklab olish"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Upload size={14} className="rotate-180" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label="O‘chirish"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
