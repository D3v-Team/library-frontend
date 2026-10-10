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

// Nashr yili: faqat 4 xonali yil, kelajak emas.
export function isValidYear(value) {
  if (!value) return null;
  if (!/^\d{4}$/.test(String(value))) return "Yilni 4 ta raqam bilan kiriting (masalan, 1926)";
  const year = Number(value);
  if (year < 1000 || year > new Date().getFullYear()) {
    return `Yil 1000 va ${new Date().getFullYear()} oralig‘ida bo‘lishi kerak`;
  }
  return null;
}

// Havola faqat http(s) bo'lishi mumkin. javascript:, data:, vbscript: kabi
// sxemalar admin kiritgan havola sifatida saqlanib, keyin public sahifada
// bosilganda kod bajarilishiga olib keladi — shuning uchun allowlist.
export const ALLOWED_URL_PROTOCOLS = ["http:", "https:"];

export function isValidUrl(value) {
  if (!value) return null; // bo'sh bo'lsa required() hal qiladi

  const trimmed = String(value).trim();

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "Havola (URL) formati noto‘g‘ri. Masalan: https://example.uz";
  }

  if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
    return "Faqat http:// yoki https:// bilan boshlanadigan havolalar ruxsat etilgan";
  }

  return null;
}

export function isValidEmail(value) {
  if (!value) return null; // bo'sh bo'lsa required() hal qiladi
  const trimmed = String(value).trim();
  // Ataylab qat'iy emas: RFC ga to'liq mos regex amalda foyda bermaydi,
  // asosiy maqsad — xato yozilgan manzilni (bo'sh joy, @ yo'q, nuqta yo'q)
  // serverga yuborishdan oldin tutish.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return "Elektron pochta formati noto‘g‘ri. Masalan: nom@domen.uz";
  }
  return null;
}

export function isValidPhone(value) {
  if (!value) return null;
  const digits = String(value).replace(/[^\d]/g, "");
  if (digits.length < 9) {
    return "Telefon raqam to‘liq emas. Masalan: +998901234567";
  }
  return null;
}

/** Kenglik/uzunlik chegaralari — xarita koordinatalari uchun */
export function isValidLatitude(value) {
  if (value === "" || value === undefined || value === null) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return "Faqat raqam kiritish mumkin";
  if (n < -90 || n > 90) return "Kenglik -90 va 90 orasida bo‘lishi kerak";
  return null;
}

export function isValidLongitude(value) {
  if (value === "" || value === undefined || value === null) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return "Faqat raqam kiritish mumkin";
  if (n < -180 || n > 180) return "Uzunlik -180 va 180 orasida bo‘lishi kerak";
  return null;
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
