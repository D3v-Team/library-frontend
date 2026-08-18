import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, GalleryHorizontalEnd } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import ImageUploadField from "./components/ImageUploadField";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";
import {
  required,
  isValidUrl,
  isValidNumber,
  validateForm,
} from "./utils/validators";

import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerActiveMutation,
} from "../../store/services/banners.api";
import { BASE_URL } from "../../store/api";

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

const formSchema = [
  {
    field: "title_latin",
    validators: [(v) => required(v, "Sarlavha (lotin)")],
  },
  { field: "link_url", validators: [isValidUrl] },
  { field: "order", validators: [isValidNumber] },
];

export default function Banners() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [activeLang, setActiveLang] = useState("latin");
  const [imageFile, setImageFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, error } = useGetBannersQuery({
    page,
    limit: 10,
    search,
  });

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
  const [toggleActive] = useToggleBannerActiveMutation();

  const items = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
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

    const payload = { ...form, image_file: imageFile ?? undefined };

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
      toast.error(err?.data?.message || "Saqlashda xatolik yuz berdi");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await toggleActive({ id: item.id, is_active: !item.is_active }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Holatni o‘zgartirib bo‘lmadi");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget.id).unwrap();
      toast.success("Banner o‘chirildi");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "O‘chirishda xatolik yuz berdi");
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

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Sarlavha bo‘yicha qidirish..."
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-blue-700"
              />
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-sm text-red-600">
            Bannerlarni yuklashda xatolik yuz berdi.
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <GalleryHorizontalEnd
              className="mx-auto mb-3 text-slate-300"
              size={28}
            />
            <p className="text-sm text-slate-500">
              {search
                ? "Hech narsa topilmadi."
                : "Hozircha bannerlar mavjud emas."}
            </p>
          </div>
        ) : (
          <div
            className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            <div
              className={`
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-3
gap-5
transition-opacity
${isFetching ? "opacity-60" : "opacity-100"}
`}
            >
              {items
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((item) => (
                  <div
                    key={item.id}
                    className="
group
overflow-hidden
rounded-2xl
border
border-slate-200
bg-white
shadow-sm
transition-all
duration-200
hover:-translate-y-1
hover:border-green-200
hover:shadow-lg
"
                  >
                    <div
                      className="
relative
h-44
bg-slate-100
"
                    >
                      {item.image_url ? (
                        <img
                          src={`${BASE_URL}${item.image_url}`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="
flex
h-full
items-center
justify-center
text-slate-400
"
                        >
                          Rasm yo‘q
                        </div>
                      )}
                    </div>

                    <div
                      className="
p-5
"
                    >
                      <div
                        className="
flex
items-start
justify-between
gap-3
"
                      >
                        <h3
                          className="
line-clamp-2
font-semibold
text-slate-900
group-hover:text-green-700
transition-colors
"
                        >
                          {item.title_latin}
                        </h3>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`
rounded-full
border
px-3
py-1
text-xs
font-medium

${
  item.is_active
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-slate-100 text-slate-500 border-slate-200"
}

`}
                        >
                          {item.is_active ? "Faol" : "Nofaol"}
                        </button>
                      </div>

                      <p
                        className="
mt-3
text-sm
text-slate-500
truncate
"
                      >
                        {item.link_url || "Havola yo‘q"}
                      </p>

                      <div
                        className="
mt-4
flex
items-center
justify-between
border-t
border-slate-100
pt-4
"
                      >
                        <span
                          className="
text-xs
text-slate-500
"
                        >
                          Tartib: {item.order}
                        </span>

                        <div
                          className="
flex
gap-2
"
                        >
                          <button
                            onClick={() => openEdit(item)}
                            className="
flex
h-9
w-9
items-center
justify-center
rounded-lg
border
border-slate-200
text-slate-500
hover:bg-green-50
hover:text-green-700
hover:border-green-200
transition
"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="
flex
h-9
w-9
items-center
justify-center
rounded-lg
border
border-red-100
text-red-500
hover:bg-red-50
transition
"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="px-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

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
              className={activeLang === lang.key ? "" : "hidden"}
            >
              <FormField
                label={`Sarlavha (${lang.label})`}
                required={lang.key === "latin"}
                value={form[`title_${lang.key}`]}
                onChange={(e) =>
                  handleFieldChange(`title_${lang.key}`, e.target.value)
                }
                error={lang.key === "latin" ? errors.title_latin : undefined}
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
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-black hover:bg-slate-800 disabled:opacity-50"
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
