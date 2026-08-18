import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, User, Eye } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import ImageUploadField from "./components/ImageUploadField";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";
import { required, minLength, isValidDate, validateForm } from "./utils/validators";

import {
  useGetAuthorsQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
  useGetAuthorImagesQuery,
  useUploadAuthorImageMutation,
  useDeleteAuthorImageMutation,
  useSetMainAuthorImageMutation,
} from "../../store/services/avtors.api";

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

const formSchema = [
  { field: "full_name_latin", validators: [(v) => required(v, "Ism (lotin)"), (v) => minLength(v, 2, "Ism (lotin)")] },
  { field: "birth_date", validators: [(v) => required(v, "Tug‘ilgan sana"), isValidDate] },
  { field: "death_date", validators: [isValidDate] },
];

export default function Avtors() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [activeLang, setActiveLang] = useState("latin");
  const [newImageFile, setNewImageFile] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, error } = useGetAuthorsQuery({
    page,
    limit: 12,
    search,
  });

  const [createAuthor, { isLoading: isCreating }] = useCreateAuthorMutation();
  const [updateAuthor, { isLoading: isUpdating }] = useUpdateAuthorMutation();
  const [deleteAuthor, { isLoading: isDeleting }] = useDeleteAuthorMutation();

  const { data: imagesData } = useGetAuthorImagesQuery(editingAuthor?.id, {
    skip: !editingAuthor,
  });
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadAuthorImageMutation();
  const [deleteImage] = useDeleteAuthorImageMutation();
  const [setMainImage] = useSetMainAuthorImageMutation();

  const authors = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditingAuthor(null);
    setForm(emptyForm);
    setErrors({});
    setActiveLang("latin");
    setNewImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (author) => {
    setEditingAuthor(author);
    setForm({ ...emptyForm, ...author });
    setErrors({});
    setActiveLang("latin");
    setNewImageFile(null);
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
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Formada xatolar bor, tekshirib chiqing.");
      return;
    }

    try {
      if (editingAuthor) {
        await updateAuthor({ id: editingAuthor.id, data: form }).unwrap();
        toast.success("Muallif ma'lumotlari yangilandi");
      } else {
        const created = await createAuthor(form).unwrap();
        toast.success("Muallif qo‘shildi");

        // If an image was picked during create, upload it right after
        // the author record exists.
        if (newImageFile && created?.id) {
          await uploadImage({ authorId: created.id, file: newImageFile }).unwrap();
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Saqlashda xatolik yuz berdi");
    }
  };

  const handleImagePick = async (file) => {
    setNewImageFile(file);

    // In edit mode the author already exists — upload immediately so
    // the gallery below reflects it right away.
    if (editingAuthor && file) {
      try {
        await uploadImage({ authorId: editingAuthor.id, file }).unwrap();
        toast.success("Rasm yuklandi");
        setNewImageFile(null);
      } catch (err) {
        toast.error(err?.data?.message || "Rasm yuklashda xatolik");
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImage({ authorId: editingAuthor.id, imageId }).unwrap();
      toast.success("Rasm o‘chirildi");
    } catch (err) {
      toast.error(err?.data?.message || "Rasmni o‘chirishda xatolik");
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await setMainImage({ authorId: editingAuthor.id, imageId }).unwrap();
      toast.success("Asosiy rasm belgilandi");
    } catch (err) {
      toast.error(err?.data?.message || "Amalni bajarib bo‘lmadi");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAuthor(deleteTarget.id).unwrap();
      toast.success("Muallif o‘chirildi");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "O‘chirishda xatolik yuz berdi");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Mualliflar"
        description="Kutubxona fondidagi mualliflarni boshqaring."
        actionLabel="Muallif qo‘shish"
        onAction={openCreate}
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Ism bo‘yicha qidirish..."
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
          Mualliflarni yuklashda xatolik yuz berdi. Sahifani yangilab ko‘ring.
        </div>
      ) : authors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <User className="mx-auto mb-3 text-slate-300" size={28} />
          <p className="text-sm text-slate-500">
            {search ? "Hech narsa topilmadi." : "Hozircha mualliflar mavjud emas."}
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {authors.map((author) => (
            <div
              key={author.id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                {author.main_image_url ? (
                  <img
                    src={author.main_image_url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
                    <User size={22} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-slate-900">
                    {author.full_name_latin || "Ism kiritilmagan"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {author.nationality_latin || "Millati ko‘rsatilmagan"}
                  </p>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-500">
                {author.biography_latin || "Tavsif kiritilmagan"}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">
                  {author.birth_date || "—"}
                  {author.death_date ? ` – ${author.death_date}` : ""}
                </span>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(author)}
                    aria-label="Tahrirlash"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(author)}
                    aria-label="O‘chirish"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Create / Edit modal */}
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
                required={lang.key === "latin"}
                value={form[`full_name_${lang.key}`]}
                onChange={(e) => handleFieldChange(`full_name_${lang.key}`, e.target.value)}
                error={lang.key === "latin" ? errors.full_name_latin : undefined}
                placeholder="Abdulla Qodiriy"
              />

              <FormField
                as="textarea"
                rows={4}
                label={`Tarjimai hol (${lang.label})`}
                value={form[`biography_${lang.key}`]}
                onChange={(e) => handleFieldChange(`biography_${lang.key}`, e.target.value)}
              />

              <FormField
                label={`Millati (${lang.label})`}
                value={form[`nationality_${lang.key}`]}
                onChange={(e) => handleFieldChange(`nationality_${lang.key}`, e.target.value)}
              />
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              type="date"
              label="Tug‘ilgan sana"
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

          <ImageUploadField
            label="Rasm qo‘shish"
            value={newImageFile}
            existingUrl={null}
            onChange={handleImagePick}
          />
          {isUploadingImage && (
            <p className="text-xs text-slate-400">Rasm yuklanmoqda...</p>
          )}

          {editingAuthor && imagesData?.data?.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Mavjud rasmlar
              </p>
              <div className="flex flex-wrap gap-3">
                {imagesData.data.map((img) => (
                  <div key={img.id} className="group relative">
                    <img
                      src={img.url}
                      alt=""
                      className={`h-20 w-20 rounded-lg object-cover ${
                        img.is_main ? "ring-2 ring-slate-900" : ""
                      }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      {!img.is_main && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(img.id)}
                          title="Asosiy qilish"
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-700"
                        >
                          <Eye size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        title="O‘chirish"
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              className="rounded-lg border bg-slate-900 px-5 py-2.5 text-sm font-medium text-black hover:bg-slate-800 disabled:opacity-50"
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
        title="Muallifni o‘chirish"
        description={`"${deleteTarget?.full_name_latin || ""}" muallifini o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.`}
      />
    </div>
  );
}
