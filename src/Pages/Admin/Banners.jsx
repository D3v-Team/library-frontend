// src/pages/admin/Banners.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, GalleryHorizontalEnd, Info } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import ImageUploadField from "./components/ImageUploadField";
import AdminEmptyState from "./components/AdminEmptyState";
import {
  AdminErrorState,
  CardGridSkeleton,
  LangDots,
  RowActions,
  StatusToggle,
} from "./components/AdminUI";
import {
  required,
  isValidUrl,
  isValidNumber,
  validateForm,
} from "./utils/validators";

import {
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerActiveMutation,
} from "../../store/services/banners.api";
import { BASE_URL } from "../../store/api";
import apiError from "../../lib/apiError";

const LANGS = [
  { key: "latin", label: "Lotin" },
  { key: "cyril", label: "Kirill" },
  { key: "ru", label: "Rus" },
];

const emptyForm = {
  title_latin: "",
  title_cyril: "",
  title_ru: "",
  link_url: "",
  order: 1,
  is_active: true,
};

// UpdateBannerDto maydonlari (image_file alohida)
const BANNER_FIELDS = Object.keys(emptyForm).filter((f) => f !== "image_file");

// ===== FORM SCHEMA – 3 TIL UCHUN VALIDATSIYA =====
const formSchema = [
  {
    field: "title_latin",
    validators: [(v) => required(v, "Sarlavha (lotin)")],
  },
  {
    field: "title_cyril",
    validators: [(v) => required(v, "Sarlavha (kirill)")],
  },
  {
    field: "title_ru",
    validators: [(v) => required(v, "Sarlavha (rus)")],
  },
  { field: "link_url", validators: [isValidUrl] },
  { field: "order", validators: [isValidNumber] },
];

// Saytdagi hero shuncha bannerni oladi (HeroBand.jsx: limit 10)
const HERO_LIMIT = 10;

export default function Banners() {
  const [pendingId, setPendingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [activeLang, setActiveLang] = useState("latin");
  const [imageFile, setImageFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);


  // /banners/all — nofaol bannerlar ham. Ommaviy /banners faqat faollarini
  // beradi: nofaol qilingan banner admindan yo'qolib, qayta yoqib bo'lmasdi.
  //
  // Bannerlar oz (hero slaydlari) — hammasi bitta so'rovda, qidiruv va
  // paginatsiyasiz. Ilgari 10 talik sahifa ichida klientda saralanardi,
  // ya'ni tartib sahifalar orasida noto'g'ri edi.
  const { data, isLoading, isFetching, error, refetch } = useGetAllBannersQuery({
    page: 1,
    limit: 50,
  });

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
  const [toggleActive] = useToggleBannerActiveMutation();

  const items = [...(data?.data ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const activeCount = items.filter((b) => b.is_active).length;
  // Bir xil tartib raqami — saytda qaysi biri oldin chiqishi noaniq
  const orderCounts = items.reduce((m, b) => m.set(b.order, (m.get(b.order) ?? 0) + 1), new Map());
  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setActiveLang("latin");
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...emptyForm, ...item });
    setErrors({});
    setActiveLang("latin");
    setImageFile(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const validationErrors = validateForm(form, formSchema);
    if (!editing && !imageFile) {
      validationErrors.image_file = "Banner uchun rasm tanlang";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Formada xatolar bor, tekshirib chiqing.");
      return;
    }

    // Faqat UpdateBannerDto / CreateBannerDto maydonlari. Ilgari `...item`
    // dan tuzilgan forma butunlay ketardi: image_url, id, created_at,
    // updated_at ham multipart maydon bo'lib yuborilardi.
    const payload = {
      ...Object.fromEntries(BANNER_FIELDS.map((f) => [f, form[f]])),
      image_file: imageFile,
    };

    try {
      if (editing) {
        await updateBanner({ id: editing.id, ...payload }).unwrap();
        toast.success("Banner yangilandi");
      } else {
        await createBanner(payload).unwrap();
        toast.success("Banner qo‘shildi");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(apiError(err, "Saqlashda xatolik yuz berdi"));
    }
  };

  const handleToggleActive = async (item) => {
    setPendingId(item.id);
    try {
      await toggleActive({ id: item.id, is_active: !item.is_active }).unwrap();
    } catch (err) {
      toast.error(apiError(err, "Holatni o‘zgartirib bo‘lmadi"));
    } finally {
      setPendingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget.id).unwrap();
      toast.success("Banner o‘chirildi");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O‘chirishda xatolik yuz berdi"));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Bannerlar"
        description="Bosh sahifadagi banner (hero) slaydlarini boshqaring."
        actionLabel="Banner qo‘shish"
        onAction={openCreate}
      />

      {activeCount > HERO_LIMIT && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            {activeCount} ta banner faol, lekin saytda faqat tartib bo‘yicha birinchi {HERO_LIMIT} tasi ko‘rinadi.
          </p>
        </div>
      )}

      {isLoading ? (
        <CardGridSkeleton
          count={6}
          media="4/5"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        />
      ) : error ? (
        <AdminErrorState title="Bannerlarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : items.length === 0 ? (
        <AdminEmptyState title="Bannerlar hali qo‘shilmagan" icon={GalleryHorizontalEnd} />
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* 4:5 — saytdagi hero peshtoqi shu nisbatda ko'rsatadi */}
              <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-slate-100">
                {item.image_url ? (
                  <img
                    src={`${BASE_URL}${item.image_url}`}
                    alt={item.title_latin || "Banner rasmi"}
                    loading="lazy"
                    className={`absolute inset-0 h-full w-full object-cover transition ${item.is_active ? "" : "opacity-50 grayscale"}`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">Rasm yo‘q</div>
                )}

                {orderCounts.get(item.order) > 1 ? (
                  <span
                    className="absolute left-3 top-3 rounded-md bg-amber-400 px-2 py-1 text-xs font-semibold text-amber-950"
                    title="Bu tartib raqami boshqa bannerda ham bor — saytda qaysi biri oldin chiqishi noaniq"
                  >
                    #{item.order ?? "—"} · takror
                  </span>
                ) : (
                  <span
                    className="absolute left-3 top-3 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                    title="Saytdagi tartib raqami"
                  >
                    #{item.order ?? "—"}
                  </span>
                )}

                {!item.is_active && (
                  <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-600">
                    Yashirin
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 font-semibold text-slate-900">
                  {item.title_latin || "Sarlavhasiz"}
                </h3>
                <LangDots record={item} field="title" />

                {item.link_url ? (
                  <a
                    href={item.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-w-0 items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
                  >
                    <ExternalLink size={13} className="shrink-0" />
                    <span className="truncate">{item.link_url}</span>
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">Havola yo‘q</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                <StatusToggle
                  onLabel="Ko‘rinadi"
                  checked={item.is_active}
                  pending={pendingId === item.id}
                  onChange={() => handleToggleActive(item)}
                />
                <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Bannerni tahrirlash" : "Yangi banner"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {LANGS.map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setActiveLang(lang.key)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${activeLang === lang.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {LANGS.map((lang) => (
            <div
              key={lang.key}
              className={activeLang === lang.key ? "" : "hidden"}
            >
              <FormField
                label={`Sarlavha (${lang.label})`}
                required
                value={form[`title_${lang.key}`]}
                onChange={(e) =>
                  handleFieldChange(`title_${lang.key}`, e.target.value)
                }
                error={errors[`title_${lang.key}`]}
              />
            </div>
          ))}

          <ImageUploadField
            value={imageFile}
            existingUrl={editing?.image_url}
            onChange={setImageFile}
            onRemove={() => {
              setImageFile(null);
              setEditing((prev) => ({
                ...prev,
                image_url: null,
              }));
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Havola (URL)"
              placeholder="https://example.com"
              value={form.link_url}
              onChange={(e) => handleFieldChange("link_url", e.target.value)}
              error={errors.link_url}
            />
            <FormField
              type="number"
              label="Tartib raqami"
              value={form.order}
              onChange={(e) => handleFieldChange("order", e.target.value)}
              error={errors.order}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleFieldChange("is_active", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Faol (saytda ko‘rinadi)
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Bannerni o‘chirish"
        description={`"${deleteTarget?.title_latin || ""}" bannerini o‘chirmoqchimisiz?`}
      />
    </div>
  );
}
