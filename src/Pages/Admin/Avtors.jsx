// src/pages/admin/Avtors.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2, User, Eye, Upload } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";
import AdminEmptyState from "./components/AdminEmptyState";
import { AdminErrorState, AdminTable, LangDots, RowActions, TableSkeleton } from "./components/AdminUI";
import { isIndexAuthor } from "../Authors/authorHelpers";
import { required, minLength, isValidDate, validateForm } from "./utils/validators";
import { BASE_URL } from "../../store/api";

import {
  useGetAuthorsQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
  useGetAuthorImagesQuery,
  useUploadAuthorImagesMutation,
  useDeleteAuthorImageMutation,
  useSetMainAuthorImageMutation,
} from "../../store/services/avtors.api";
import apiError from "../../lib/apiError";

const LANGS = [
  { key: "latin", label: "Lotin" },
  { key: "cyril", label: "Kirill" },
  { key: "ru", label: "Rus" },
];

const emptyForm = {
  full_name_latin: "",
  full_name_cyril: "",
  full_name_ru: "",
  biography_latin: "",
  biography_cyril: "",
  biography_ru: "",
  nationality_latin: "",
  nationality_cyril: "",
  nationality_ru: "",
  birth_date: "",
  death_date: "",
};

// CreateAuthorDto / UpdateAuthorDto maydonlari — faqat shular yuboriladi
const AUTHOR_FIELDS = Object.keys(emptyForm);

const toAuthorForm = (author) =>
  Object.fromEntries(
    AUTHOR_FIELDS.map((f) => {
      const v = author?.[f] ?? "";
      // Sana maydonlari <input type="date"> uchun YYYY-MM-DD
      return [f, f.endsWith("_date") && v ? String(v).slice(0, 10) : v];
    }),
  );

// ===== FORM VALIDATION SCHEMA – 3 TIL MAJBURIY =====
const formSchema = [
  { field: "full_name_latin", validators: [(v) => required(v, "Ism (lotin) to‘ldirilmagan"), (v) => minLength(v, 2, "Ism (lotin) kamida 2 belgi bo‘lishi kerak")] },
  { field: "full_name_cyril", validators: [(v) => required(v, "Ism (kirill) to‘ldirilmagan")] },
  { field: "full_name_ru", validators: [(v) => required(v, "Ism (rus) to‘ldirilmagan")] },
  { field: "biography_latin", validators: [] }, // ixtiyoriy
  { field: "biography_cyril", validators: [] },
  { field: "biography_ru", validators: [] },
  { field: "nationality_latin", validators: [] },
  { field: "nationality_cyril", validators: [] },
  { field: "nationality_ru", validators: [] },
  // Tug'ilgan sana majburiyligi faqat YARATISHDA (handleSubmit ga qarang)
  { field: "birth_date", validators: [isValidDate] },
  { field: "death_date", validators: [isValidDate] },
];

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

export default function Avtors() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [activeLang, setActiveLang] = useState("latin");

  // Image states
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Jadval — 25 tadan (ilgari 12 ta katta kartochka: 2 000+ muallif = 175 sahifa)
  const { data, isLoading, isFetching, error, refetch } = useGetAuthorsQuery({
    page,
    limit: 25,
    search,
  });

  const [createAuthor, { isLoading: isCreating }] = useCreateAuthorMutation();
  const [updateAuthor, { isLoading: isUpdating }] = useUpdateAuthorMutation();
  const [deleteAuthor, { isLoading: isDeleting }] = useDeleteAuthorMutation();

  // Image hooks
  const { data: imagesData } = useGetAuthorImagesQuery(
    editingAuthor?.id,
    { skip: !editingAuthor }
  );
  const [uploadImages] = useUploadAuthorImagesMutation();
  const [deleteImage] = useDeleteAuthorImageMutation();
  const [setMainImage] = useSetMainAuthorImageMutation();

  const authors = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const total = data?.meta?.total;
  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditingAuthor(null);
    setForm(emptyForm);
    setErrors({});
    setActiveLang("latin");
    setNewImageFiles([]);
    setModalOpen(true);
  };

  const openEdit = (author) => {
    setEditingAuthor(author);
    // Faqat DTO maydonlari; Excel mualliflaridagi null lar bo'sh qatorga
    setForm(toAuthorForm(author));
    setErrors({});
    setActiveLang("latin");
    setNewImageFiles([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAuthor(null);
    setNewImageFiles([]);
    setIsUploading(false);
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles((prev) => [...prev, ...files]);
  };

  const removeImageFile = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ===== RASM YUKLASH FUNKSIYASI =====
  const uploadAuthorImages = async (authorId) => {
    if (newImageFiles.length === 0) return;
    setIsUploading(true);
    try {
      // Backend "files" array kutilganligi uchun shu nomda yuboriladi
      await uploadImages({ authorId, files: newImageFiles }).unwrap();
      toast.success(`${newImageFiles.length} ta rasm yuklandi`);
      setNewImageFiles([]);
    } catch (err) {
      // Xatolikni o‘zbekcha ko‘rsatish
      const msg = apiError(err, "Rasm yuklashda xatolik yuz berdi");
      toast.error(msg);
      // Xatolikni yuqoriga uzatamiz, shunda handleSubmit catch qismi ishlaydi
      throw new Error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImage({ authorId: editingAuthor.id, imageId }).unwrap();
      toast.success("Rasm o'chirildi");
    } catch (err) {
      toast.error(apiError(err, "Rasmni o'chirishda xatolik"));
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await setMainImage({ authorId: editingAuthor.id, imageId }).unwrap();
      toast.success("Asosiy rasm belgilandi");
    } catch (err) {
      toast.error(apiError(err, "Amalni bajarib bo'lmadi"));
    }
  };

  // ===== FORM SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // 1. Validatsiya. Tug'ilgan sana faqat yangi muallifda majburiy:
    // Excel importidan kelgan ~2 000 muallifda u yo'q — tahrirlashda talab
    // qilinsa, ularni tahrirlab bo'lmasdi (to'qima sana kiritmasdan).
    const validationErrors = validateForm(form, formSchema);
    if (!editingAuthor && !form.birth_date) {
      validationErrors.birth_date = "Tug'ilgan sana kiriting";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Formada xatolar bor, tekshirib chiqing.");
      return;
    }

    try {
      let authorId;

      if (editingAuthor) {
        // UPDATE
        // Faqat o'zgargan DTO maydonlari (ilgari id, images, created_at ham ketardi)
        const initial = toAuthorForm(editingAuthor);
        const changed = Object.fromEntries(
          AUTHOR_FIELDS.filter((f) => form[f] !== initial[f]).map((f) => [f, form[f] === "" ? null : form[f]]),
        );
        if (Object.keys(changed).length > 0) {
          await updateAuthor({ id: editingAuthor.id, data: changed }).unwrap();
        }
        authorId = editingAuthor.id;
        toast.success("Muallif ma'lumotlari yangilandi");
      } else {
        // CREATE
        const created = await createAuthor(
          Object.fromEntries(AUTHOR_FIELDS.filter((f) => form[f] !== "").map((f) => [f, form[f]])),
        ).unwrap();
        // Backend javob tuzilishiga qarab id ni olish
        authorId = created.id || created?.data?.id || created?.id;
        if (!authorId) {
          toast.error("Muallif yaratildi, lekin identifikator olib bo'lmadi");
          return;
        }
        toast.success("Muallif qo'shildi");
      }

      // 2. Agar rasm tanlangan bo‘lsa, yuklaymiz
      if (newImageFiles.length > 0 && authorId) {
        await uploadAuthorImages(authorId);
      }

      // 3. Modalni yopish — ro'yxat kesh teglari orqali o'zi yangilanadi
      closeModal();
    } catch (err) {
      // Xatolikni o‘zbekcha ko‘rsatish
      const message = apiError(err, "Saqlashda xatolik yuz berdi");
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAuthor(deleteTarget.id).unwrap();
      toast.success("Muallif o'chirildi");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O'chirishda xatolik yuz berdi"));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Mualliflar"
        description="Kutubxona fondidagi mualliflarni boshqaring."
        actionLabel="Muallif qo'shish"
        onAction={openCreate}
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Ism bo'yicha qidirish..."
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} cols={5} thumb />
      ) : error ? (
        <AdminErrorState title="Mualliflarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : authors.length === 0 ? (
        <AdminEmptyState title={search ? "Qidiruv bo‘yicha muallif topilmadi" : "Mualliflar topilmadi"} icon={User} />
      ) : (
        <AdminTable
          rows={authors}
          isFetching={isFetching}
          onRowClick={openEdit}
          columns={[
            {
              key: "name",
              header: "Muallif",
              cell: (author) => {
                const mainImage = getImageUrl(author.images?.find((img) => img.is_main)?.url);
                return (
                  <div className="flex min-w-0 items-center gap-3">
                    {mainImage ? (
                      <img src={mainImage} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <User size={16} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {author.full_name_latin || "Ism kiritilmagan"}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <LangDots record={author} field="full_name" />
                        {/* Mobil: millat shu yerda */}
                        {author.nationality_latin && (
                          <span className="truncate text-xs text-slate-400 md:hidden">{author.nationality_latin}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              },
            },
            {
              key: "nationality",
              header: "Millati",
              hideBelow: "md",
              cell: (a) => a.nationality_latin || <span className="text-slate-300">—</span>,
            },
            {
              key: "years",
              header: "Yillar",
              hideBelow: "md",
              className: "whitespace-nowrap tabular-nums text-slate-500",
              cell: (a) =>
                a.birth_date
                  ? `${String(a.birth_date).slice(0, 4)}${a.death_date ? ` – ${String(a.death_date).slice(0, 4)}` : ""}`
                  : <span className="text-slate-300">—</span>,
            },
            {
              key: "kind",
              header: "Turi",
              hideBelow: "lg",
              cell: (a) =>
                isIndexAuthor(a) ? (
                  <span
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                    title="Excel importidan — faqat ism. Saytda «Mualliflar ko‘rsatkichi» da turadi"
                  >
                    Excel · faqat ism
                  </span>
                ) : (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">Profil</span>
                ),
            },
            {
              key: "actions",
              header: <span className="sr-only">Amallar</span>,
              align: "right",
              cell: (a) => <RowActions onEdit={() => openEdit(a)} onDelete={() => setDeleteTarget(a)} />,
            },
          ]}
        />
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} disabled={isFetching} />

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingAuthor ? "Muallifni tahrirlash" : "Yangi muallif"}
        description="Ism, tavsif va millatni har uch tilda kiriting."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language tabs */}
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {LANGS.map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setActiveLang(lang.key)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  activeLang === lang.key
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
              className={activeLang === lang.key ? "space-y-4" : "hidden"}
            >
              <FormField
                label={`Ism-familiya (${lang.label})`}
                required={true}
                value={form[`full_name_${lang.key}`]}
                onChange={(e) => handleFieldChange(`full_name_${lang.key}`, e.target.value)}
                error={errors[`full_name_${lang.key}`]}
                placeholder="Masalan: Abdulla Qodiriy"
              />

              <FormField
                as="textarea"
                rows={4}
                label={`Tarjimai hol (${lang.label})`}
                value={form[`biography_${lang.key}`]}
                onChange={(e) => handleFieldChange(`biography_${lang.key}`, e.target.value)}
                error={errors[`biography_${lang.key}`]}
              />

              <FormField
                label={`Millati (${lang.label})`}
                value={form[`nationality_${lang.key}`]}
                onChange={(e) => handleFieldChange(`nationality_${lang.key}`, e.target.value)}
                error={errors[`nationality_${lang.key}`]}
              />
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              type="date"
              label="Tug'ilgan sana"
              required
              value={form.birth_date}
              onChange={(e) => handleFieldChange("birth_date", e.target.value)}
              error={errors.birth_date}
            />
            <FormField
              type="date"
              label="Vafot sanasi"
              value={form.death_date}
              onChange={(e) => handleFieldChange("death_date", e.target.value)}
              error={errors.death_date}
            />
          </div>

          {/* Image upload section */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="mb-3 text-sm font-medium text-slate-900">Rasmlar</h4>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Upload size={16} className="inline mr-2" />
                Rasm tanlash
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400">
                {newImageFiles.length} ta rasm tanlangan
              </span>
            </div>

            {newImageFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {newImageFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageFile(index)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editingAuthor && imagesData?.data?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-slate-400">Mavjud rasmlar:</p>
                <div className="flex flex-wrap gap-3">
                  {imagesData.data.map((img) => {
                    const imgUrl = getImageUrl(img.url);
                    return (
                      <div key={img.id} className="group relative">
                        <img
                          src={imgUrl}
                          alt=""
                          className={`h-16 w-16 rounded-lg object-cover ${
                            img.is_main ? "ring-2 ring-slate-900" : ""
                          }`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          {!img.is_main && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(img.id)}
                              title="Asosiy qilish"
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-700"
                            >
                              <Eye size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            title="O'chirish"
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isUploading && (
              <p className="mt-2 text-xs text-slate-400">Rasmlar yuklanmoqda...</p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving || isUploading}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="rounded-lg border border px-5 py-2.5 text-sm font-medium text-black hover:bg-slate-50 disabled:opacity-50"
            >
              {isSaving || isUploading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Muallifni o'chirish"
        description={`"${deleteTarget?.full_name_latin || ""}" muallifini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`}
      />
    </div>
  );
}