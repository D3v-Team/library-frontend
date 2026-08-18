import { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

import { formatFileSize, validateImageFile } from "../utils/validators";
import { BASE_URL } from "../../../store/api";

export default function ImageUploadField({
  label = "Rasm",

  value,

  existingUrl,

  onChange,

  onRemove,

  maxSizeMb = 5,

  error,

  isUploading = false,
}) {
  const inputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [isRemoved, setIsRemoved] = useState(false);

 useEffect(() => {
  if (isRemoved) {
    setPreviewUrl(null);
    return;
  }

  if (value) {
    const url = URL.createObjectURL(value);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }

  if (existingUrl) {
    setPreviewUrl(existingUrl);
    return;
  }

  setPreviewUrl(null);

}, [value, existingUrl, isRemoved]);

  const getImageUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("blob:")) {
      return url;
    }

    if (url.startsWith("http")) {
      return url;
    }

    return `${BASE_URL}${url}`;
  };

 const handleFile = (file) => {
  if (!file) return;

  const validationError = validateImageFile(file, maxSizeMb);

  if (validationError) {
    toast.error(validationError);
    return;
  }

  setIsRemoved(false);

  onChange(file);
};

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];

    handleFile(file);

    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    handleFile(file);
  };

  const handleRemove = () => {
  setIsRemoved(true);

  onChange(null);

  onRemove?.();
};

  return (
    <div>
      {label && (
        <label
          className="
            mb-1.5
            block
            text-sm
            font-medium
            text-slate-700
            "
        >
          {label}
        </label>
      )}

      {previewUrl ? (
        <div
          className="
            flex
            items-center
            gap-4
            rounded-xl
            border
            border-slate-200
            bg-white
            p-3
            "
        >
          <img
            src={getImageUrl(previewUrl)}
            alt="Preview"
            className="
              h-16
              w-16
              shrink-0
              rounded-lg
              object-cover
              "
          />

          <div className="min-w-0 flex-1">
            <p
              className="
                truncate
                text-sm
                font-medium
                text-slate-800
                "
            >
              {value ? value.name : "Mavjud rasm"}
            </p>

            {value && (
              <p
                className="
                    text-xs
                    text-slate-400
                    "
              >
                {formatFileSize(value.size)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-red-50
              hover:text-red-600
              disabled:opacity-50
              "
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();

            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            flex
            w-full
            flex-col
            items-center
            justify-center
            gap-2
            rounded-xl
            border-2
            border-dashed
            px-4
            py-8
            text-center
            transition
            disabled:cursor-not-allowed
            disabled:opacity-60

            ${
              isDragging
                ? "border-green-500 bg-green-50"
                : "border-slate-200 hover:border-green-300 hover:bg-slate-50"
            }
            `}
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-green-50
              text-green-600
              "
          >
            {isDragging ? <Upload size={18} /> : <ImageIcon size={18} />}
          </div>

          <p
            className="
              text-sm
              font-medium
              text-slate-700
              "
          >
            {isUploading ? "Rasm yuklanmoqda..." : "Rasmni tanlang yoki tashlang"}
          </p>

          <p
            className="
              text-xs
              text-slate-400
              "
          >
            JPG, JPEG, PNG, WEBP · maksimal {maxSizeMb} MB
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        disabled={isUploading}
        className="hidden"
      />

      {error && (
        <p
          className="
            mt-1.5
            text-xs
            text-red-600
            "
        >
          {error}
        </p>
      )}
    </div>
  );
}
