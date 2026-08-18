// Small, dependency-free validation helpers shared by every admin CRUD
// form. Each returns an error string, or null when the value is valid.

export function required(value, label = "Bu maydon") {
  if (value === undefined || value === null) return `${label} to‘ldirilishi shart`;
  if (typeof value === "string" && !value.trim()) {
    return `${label} to‘ldirilishi shart`;
  }
  return null;
}

export function minLength(value, min, label = "Bu maydon") {
  if (!value) return null; // let required() handle emptiness
  if (String(value).trim().length < min) {
    return `${label} kamida ${min} ta belgidan iborat bo‘lishi kerak`;
  }
  return null;
}

export function isValidDate(value) {
  if (!value) return null;
  // Expecting the native <input type="date"> format: YYYY-MM-DD
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDatePattern.test(value)) return "Sana formati noto‘g‘ri";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sana formati noto‘g‘ri";
  return null;
}

export function isValidUrl(value) {
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return "Havola (URL) formati noto‘g‘ri";
  }
}

export function isValidNumber(value) {
  if (value === "" || value === undefined || value === null) return null;
  if (Number.isNaN(Number(value))) return "Faqat raqam kiritish mumkin";
  return null;
}

// Runs a list of {field, validators: [...]} definitions against a form
// object and returns { fieldName: "error message" } for every failing
// field. An empty object means the form is valid.
export function validateForm(values, schema) {
  const errors = {};

  schema.forEach(({ field, validators }) => {
    for (const validate of validators) {
      const message = validate(values[field]);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  });

  return errors;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export function validateImageFile(file, maxSizeMb = 5) {
  if (!file) return null;

  const extension = file.name.split(".").pop()?.toLowerCase();
  const typeAllowed = !file.type || ALLOWED_IMAGE_TYPES.includes(file.type);
  const extensionAllowed = ALLOWED_IMAGE_EXTENSIONS.includes(extension);

  if (!typeAllowed || !extensionAllowed) {
    return "Faqat JPG, JPEG, PNG yoki WEBP formatdagi rasmlar yuklash mumkin.";
  }

  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return `Rasm hajmi ${maxSizeMb} MB dan oshmasligi kerak.`;
  }

  return null;
}

// Document uploads (book files) — PDF/DOC/DOCX/XLS/XLSX/PPT/PPTX only.
// Checked by both MIME type and extension, since some browsers/OS
// combinations report an empty or generic MIME type for office files.
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
];

export const BLOCKED_DOCUMENT_EXTENSIONS = [
  "exe",
  "zip",
  "rar",
  "7z",
  "apk",
  "js",
  "html",
  "htm",
  "bat",
  "cmd",
  "sh",
  "msi",
  "dll",
];

const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export function validateDocumentFile(
  file,
  maxSizeMb = 5,
  allowedExtensions = ALLOWED_DOCUMENT_EXTENSIONS,
) {
  if (!file) return null;

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (BLOCKED_DOCUMENT_EXTENSIONS.includes(extension)) {
    return `"${extension}" formatidagi fayllarni yuklash taqiqlangan.`;
  }

  const extensionAllowed = allowedExtensions.includes(extension);
  const mimeAllowed =
    !file.type || ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type);

  if (!extensionAllowed || !mimeAllowed) {
    return `Faqat ${allowedExtensions.join(", ").toUpperCase()} formatdagi fayllar yuklash mumkin.`;
  }

  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return `Fayl hajmi ${maxSizeMb}MB dan oshmasligi kerak.`;
  }

  return null;
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
