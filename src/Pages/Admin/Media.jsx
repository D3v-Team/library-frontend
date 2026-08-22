// src/pages/admin/Media/index.jsx
import { useState, useCallback } from "react";
import {
  FolderOpen,
  Image,
  Pencil,
  Trash2,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

import AdminPageHeader from "../Admin/components/AdminPageHeader.jsx";
import Modal from "../Admin/components/Modal.jsx";
import ConfirmDialog from "../Admin/components/ConfirmDialog.jsx";
import FormField from "../Admin/components/FormField";
import ImageUploadField from "../Admin/components/ImageUploadField";
import Pagination from "../Admin/components/Pagination";
import {
  SearchInput,
  FilterSelect,
} from "../Admin/components/ListControls.jsx";
import { BASE_URL } from "../../store/api";

import {
  useGetMediaAlbumsQuery,
  useCreateMediaAlbumMutation,
  useUpdateMediaAlbumMutation,
  useDeleteMediaAlbumMutation,
  useToggleMediaPublicMutation,
  useAddMediaItemMutation, // <- TO'G'RI NOM
} from "../../store/services/media";

// ================= CONSTANTS =================
const MEDIA_TYPES = [
  { value: "PHOTO", label: "Foto" },
  { value: "VIDEO", label: "Video" },
  { value: "PRESENTATION", label: "Taqdimot" },
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const emptyForm = {
  title_latin: "",
  title_cyril: "",
  title_ru: "",
  type: "PHOTO",
  cover_image: null,
  is_public: true,
};

// ================= HELPERS =================
const getInitialForm = (item) => ({
  title_latin: item.title_latin ?? "",
  title_cyril: item.title_cyril ?? "",
  title_ru: item.title_ru ?? "",
  type: item.type ?? "PHOTO",
  cover_image: null,
  is_public: item.is_public ?? true,
});

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

// ================= VALIDATION FUNCTIONS =================

// PHOTO uchun - faqat fayl
const validatePhotoUpload = (files) => {
  if (!files || files.length === 0) {
    return "Kamida bitta rasm tanlang";
  }

  for (const file of files) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return `"${file.name}" - faqat JPG, PNG yoki WEBP format ruxsat etiladi`;
    }
    if (file.size > 5 * 1024 * 1024) {
      return `"${file.name}" - fayl hajmi 5MB dan oshmasligi kerak`;
    }
  }
  return null;
};

// VIDEO uchun - faqat URL
const validateVideoUpload = (url) => {
  if (!url || !url.trim()) {
    return "Video havola kiriting";
  }
  try {
    new URL(url);
    return null;
  } catch {
    return "Xato havola formati";
  }
};

// PRESENTATION uchun - file YOKI URL
const validatePresentationUpload = (file, url) => {
  if (!file && !url) {
    return "Taqdimot fayli yoki havolasi kerak";
  }
  if (file && url) {
    return "Faqat bitta usulni tanlang (fayl YOKI URL)";
  }
  if (file) {
    const allowedTypes = [".pdf", ".ppt", ".pptx", ".doc", ".docx"];
    const fileExt = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      return "Faqat PDF, PPT, PPTX, DOC, DOCX formatlar ruxsat etiladi";
    }
    if (file.size > 20 * 1024 * 1024) {
      return "Fayl hajmi 20MB dan oshmasligi kerak";
    }
    return null;
  }
  if (url) {
    try {
      new URL(url);
      return null;
    } catch {
      return "Xato havola formati";
    }
  }
  return null;
};

// ================= MAIN COMPONENT =================
export default function Media() {
  // ================= STATE =================
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Upload modal state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [presentationUrl, setPresentationUrl] = useState("");
  const [presentationFile, setPresentationFile] = useState(null);
  const [uploadError, setUploadError] = useState("");

  // ================= API HOOKS =================
  const { data, isLoading, error, refetch } = useGetMediaAlbumsQuery({
    page,
    search,
    type,
    limit: 10,
  });

  const [createMediaAlbum, { isLoading: isCreating }] =
    useCreateMediaAlbumMutation();
  const [updateMediaAlbum, { isLoading: isUpdating }] =
    useUpdateMediaAlbumMutation();
  const [deleteMediaAlbum, { isLoading: isDeleting }] =
    useDeleteMediaAlbumMutation();
  const [toggleMediaPublic, { isLoading: isToggling }] =
    useToggleMediaPublicMutation();
  // ===== TO'G'RI: useAddMediaItemMutation =====
  const [addMediaItem, { isLoading: isAddingItem }] = useAddMediaItemMutation();

  // ================= DERIVED DATA =================
  const albums = data?.records ?? data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? data?.totalPages ?? 1;

  // ================= RESET UPLOAD FORM =================
  const resetUploadForm = useCallback(() => {
    setSelectedFiles([]);
    setVideoUrl("");
    setPresentationUrl("");
    setPresentationFile(null);
    setUploadError("");
  }, []);

  // ================= HANDLERS =================
  const openCreate = useCallback(() => {
    setEditItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditItem(item);
    setForm(getInitialForm(item));
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditItem(null);
    setForm(emptyForm);
  }, []);

  const changeField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleTypeChange = useCallback((value) => {
    setForm((prev) => ({
      ...prev,
      type: value,
      cover_image: null,
    }));
  }, []);

  const submitHandler = useCallback(
    async (e) => {
      e.preventDefault();

      if (!form.title_latin.trim()) {
        toast.error("Lotincha nom kiritish majburiy");
        return;
      }

      try {
        if (editItem) {
          const initialForm = getInitialForm(editItem);
          const changedFields = {};
          Object.keys(form).forEach((key) => {
            if (form[key] !== initialForm[key]) {
              changedFields[key] = form[key];
            }
          });

          if (Object.keys(changedFields).length === 0) {
            toast.error("Hech qanday o'zgarish kiritilmagan");
            return;
          }

          await updateMediaAlbum({
            id: editItem.id,
            ...changedFields,
          }).unwrap();
          toast.success("Media albomi yangilandi");
        } else {
          await createMediaAlbum(form).unwrap();
          toast.success("Media albomi yaratildi");
        }

        closeModal();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Xatolik yuz berdi");
      }
    },
    [form, editItem, createMediaAlbum, updateMediaAlbum, closeModal, refetch],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await deleteMediaAlbum(deleteTarget.id).unwrap();
      toast.success("Media albomi o'chirildi");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error("O'chirishda xatolik yuz berdi");
    }
  }, [deleteTarget, deleteMediaAlbum, refetch]);

  const handleTogglePublic = useCallback(
    async (item) => {
      try {
        await toggleMediaPublic({
          id: item.id,
          is_public: !item.is_public,
        }).unwrap();
        toast.success("Holat yangilandi");
        refetch();
      } catch (err) {
        toast.error("Holatni o'zgartirishda xatolik");
      }
    },
    [toggleMediaPublic, refetch],
  );

  // ===== TUZATILGAN handleFileSelect =====
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach((file) => {
      // validatePhotoUpload dan foydalanamiz
      const validationError = validatePhotoUpload([file]);
      if (validationError) {
        toast.error(validationError);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      setUploadError("");
    }
  }, []);

  

// Media.jsx - handleUploadSubmit (TO'LIQ)

const handleUploadSubmit = useCallback(async () => {
  const albumType = uploadTarget?.type || 'PHOTO';
  let validationError = null;

  if (albumType === 'PHOTO') {
    validationError = validatePhotoUpload(selectedFiles);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    
    // Har bir rasmni alohida yuborish (agar ko'p bo'lsa)
    try {
      let successCount = 0;
      for (const file of selectedFiles) {
        await addMediaItem({ 
          albumId: uploadTarget.id, 
          file // <- 'file' (birlik)
        }).unwrap();
        successCount++;
      }
      toast.success(`${successCount} ta rasm muvaffaqiyatli yuklandi`);
      resetUploadForm();
      setUploadTarget(null);
      refetch();
      return;
    } catch (err) {
      toast.error("Rasmlarni yuklashda xatolik yuz berdi");
      return;
    }
  } 
  else if (albumType === 'VIDEO') {
    validationError = validateVideoUpload(videoUrl);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    
    try {
      await addMediaItem({ 
        albumId: uploadTarget.id, 
        video_url: videoUrl // <- 'video_url'
      }).unwrap();
      toast.success("Video muvaffaqiyatli yuklandi");
      resetUploadForm();
      setUploadTarget(null);
      refetch();
      return;
    } catch (err) {
      toast.error("Videoni yuklashda xatolik yuz berdi");
      return;
    }
  } 
  else if (albumType === 'PRESENTATION') {
    validationError = validatePresentationUpload(presentationFile, presentationUrl);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    
    try {
      await addMediaItem({ 
        albumId: uploadTarget.id, 
        ...(presentationFile && { file: presentationFile }),
        ...(presentationUrl && { video_url: presentationUrl })
      }).unwrap();
      toast.success("Taqdimot muvaffaqiyatli yuklandi");
      resetUploadForm();
      setUploadTarget(null);
      refetch();
      return;
    } catch (err) {
      toast.error("Taqdimotni yuklashda xatolik yuz berdi");
      return;
    }
  }
}, [uploadTarget, selectedFiles, videoUrl, presentationFile, presentationUrl, addMediaItem, resetUploadForm, refetch]);

  const closeUploadModal = useCallback(() => {
    resetUploadForm();
    setUploadTarget(null);
  }, [resetUploadForm]);

  // ================= RENDER =================
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media"
        description="Foto, video va taqdimot materiallarini boshqaring."
        actionLabel="Album qo'shish"
        onAction={openCreate}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Media qidirish..."
        />

        <FilterSelect
          value={type}
          onChange={(value) => {
            setType(value);
            setPage(1);
          }}
          options={MEDIA_TYPES}
          placeholder="Barcha turlar"
        />
      </div>

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-2xl bg-blue-700"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
          Media ma'lumotlarini yuklashda xatolik yuz berdi.
        </div>
      )}

      {!isLoading && !error && albums.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <FolderOpen className="mx-auto mb-3 text-slate-400" size={32} />
          <p className="text-sm text-slate-500">Media albomlar mavjud emas.</p>
        </div>
      )}

      {!isLoading && !error && albums.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {albums.map((item) => {
            const imageUrl = getImageUrl(item.cover_image || item.cover_url);

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-44 bg-slate-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.title_latin}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Image size={38} />
                    </div>
                  )}

                  <div className="absolute right-3 top-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.is_public
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.is_public ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
                    {item.title_latin}
                  </h3>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("uz-UZ")
                        : "-"}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Pencil size={15} />
                      Tahrirlash
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublic(item)}
                      disabled={isToggling}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      title={item.is_public ? "Yashirish" : "Ko'rsatish"}
                    >
                      {item.is_public ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      resetUploadForm();
                      setUploadTarget(item);
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium text-black transition-colors hover:bg-slate-50"
                  >
                    <Upload size={15} />
                    Fayl qo'shish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* CREATE/EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editItem ? "Media albomini tahrirlash" : "Media albomi qo'shish"}
        size="lg"
      >
        <form onSubmit={submitHandler} className="space-y-5">
          <FormField
            label="Nomi (Lotin)"
            value={form.title_latin}
            onChange={(e) => changeField("title_latin", e.target.value)}
            required
            placeholder="Masalan: Summer Collection"
          />

          <FormField
            label="Nomi (Kirill)"
            value={form.title_cyril}
            onChange={(e) => changeField("title_cyril", e.target.value)}
            placeholder="Masalan: Ёзги коллекция"
          />

          <FormField
            label="Nomi (Rus)"
            value={form.title_ru}
            onChange={(e) => changeField("title_ru", e.target.value)}
            placeholder="Masalan: Летняя коллекция"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Turi *
            </label>
            <select
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              {MEDIA_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <ImageUploadField
            label="Cover rasm"
            value={form.cover_image}
            onChange={(file) => changeField("cover_image", file)}
            accept="image/*"
          />

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => changeField("is_public", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            Ochiq ko'rsatish
          </label>

          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="w-full rounded-lg border py-3 text-sm font-medium text-black transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </Modal>

      {/* ADD ITEMS MODAL */}
      <Modal
        open={Boolean(uploadTarget)}
        onClose={closeUploadModal}
        title={`Fayl qo'shish - ${uploadTarget?.title_latin || ""}`}
        size="md"
      >
        <div className="space-y-5">
          {/* PHOTO UPLOAD */}
          {uploadTarget?.type === "PHOTO" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Rasm fayllar *
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  required
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                />
                <p className="mt-1 text-xs text-slate-400">
                  JPG, JPEG, PNG, WEBP formatlar. Maksimal 5MB
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Tanlangan fayllar ({selectedFiles.length}):
                  </p>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <span>{file.name}</span>
                      <span className="text-xs text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIDEO UPLOAD */}
          {uploadTarget?.type === "VIDEO" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setUploadError("");
                  }}
                  placeholder="Masalan: https://youtube.com/watch?v=..."
                  required
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
                />
                <p className="mt-1 text-xs text-slate-400">
                  YouTube yoki boshqa video platformalar havolasi
                </p>
              </div>
            </div>
          )}

          {/* PRESENTATION UPLOAD */}
          {uploadTarget?.type === "PRESENTATION" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Taqdimot yuklash usulini tanlang:
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Taqdimot fayli
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPresentationFile(file);
                          setUploadError("");
                        }
                      }}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                    />
                    {presentationFile && (
                      <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                        ✅ {presentationFile.name} (
                        {(presentationFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>

                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 border-t border-slate-200"></div>
                    <span className="text-xs font-medium text-slate-400">
                      YOKI
                    </span>
                    <div className="flex-1 border-t border-slate-200"></div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Taqdimot URL
                    </label>
                    <input
                      type="url"
                      value={presentationUrl}
                      onChange={(e) => {
                        setPresentationUrl(e.target.value);
                        setUploadError("");
                      }}
                      placeholder="Masalan: https://drive.google.com/file/d/..."
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Google Drive, Dropbox yoki boshqa platforma havolasi
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  ⚡ Eslatma: Fayl yoki URL dan faqat bittasini to'ldiring
                </div>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              ❌ {uploadError}
            </div>
          )}

          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={isAddingItem}
            className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium text-black transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} />
            {isAddingItem ? "Yuklanmoqda..." : "Yuklash"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Media albomini o'chirish"
        description={`"${deleteTarget?.title_latin || ""}" albomini va uning barcha fayllarini o'chirmoqchimisiz?`}
      />
    </div>
  );
}
