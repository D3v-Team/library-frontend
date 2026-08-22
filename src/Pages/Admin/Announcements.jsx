// AdminAnnouncements.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  CalendarDays,
  ImageIcon,
} from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import ImageUploadField from "./components/ImageUploadField";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";

import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useToggleAnnouncementPublishMutation,
} from "../../store/services/announcements.api";

import { BASE_URL } from "../../store/api";

const emptyForm = {
  title_latin: "",
  title_cyril: "",
  title_ru: "",
  content_latin: "",
  content_cyril: "",
  content_ru: "",
  cover_image: null,
  is_public: true,
};

const LANGS = [
  { key: "latin", label: "Lotin" },
  { key: "cyril", label: "Kirill" },
  { key: "ru", label: "Rus" },
];

export default function Announcements() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [file, setFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeLang, setActiveLang] = useState("latin");
  const [errors, setErrors] = useState({});

  const { data, isLoading, isFetching, error, refetch } = useGetAnnouncementsQuery({
    page,
    limit: 10,
    search,
  });

  const [createAnnouncement, { isLoading: isCreating }] =
    useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] =
    useUpdateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] =
    useDeleteAnnouncementMutation();
  const [togglePublish] = useToggleAnnouncementPublishMutation();

  const items = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFile(null);
    setActiveLang("latin");
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...emptyForm, ...item });
    setFile(null);
    setActiveLang("latin");
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setErrors({});
  };

  const changeField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    let payload = {};

    if (editing) {
      // ---- EDIT MODE: faqat o‘zgargan maydonlarni yuborish ----
      const changed = {};
      const initial = editing;

      // Barcha maydonlarni tekshiramiz
      Object.keys(form).forEach((key) => {
        if (key === 'cover_image') {
          // Rasm alohida tekshiriladi
          if (file !== null && file !== undefined) {
            changed.cover_image = file;
          }
          return;
        }
        // Qiymat o‘zgargan bo‘lsa qo‘shamiz
        if (form[key] !== initial[key]) {
          changed[key] = form[key];
        }
      });

      payload = changed;

      // Agar hech narsa o‘zgarmagan bo‘lsa, xatolik chiqaramiz
      if (Object.keys(payload).length === 0) {
        toast.error("Hech qanday o‘zgarish kiritilmagan");
        return;
      }
    } else {
      // ---- CREATE MODE: barcha maydonlarni yuborish ----
      // Majburiy maydonlarni tekshirish
      const requiredFields = ['title_latin', 'title_cyril', 'title_ru', 'content_latin', 'content_cyril', 'content_ru'];
      const missing = requiredFields.filter(field => !form[field]?.trim());
      if (missing.length > 0) {
        const fieldLabels = {
          title_latin: "Lotin sarlavha",
          title_cyril: "Kirill sarlavha",
          title_ru: "Rus sarlavha",
          content_latin: "Lotin tavsif",
          content_cyril: "Kirill tavsif",
          content_ru: "Rus tavsif",
        };
        toast.error(`Quyidagi maydonlar to‘ldirilishi shart: ${missing.map(f => fieldLabels[f] || f).join(', ')}`);
        return;
      }

      payload = {
        ...form,
        cover_image: file ?? undefined,
        is_public: Boolean(form.is_public),
      };
    }

    try {
      if (editing) {
        await updateAnnouncement({
          id: editing.id,
          ...payload,
        }).unwrap();
        toast.success("E'lon yangilandi");
      } else {
        await createAnnouncement(payload).unwrap();
        toast.success("E'lon qo'shildi");
      }
      closeModal();
      refetch();
    } catch (err) {
      const backendError = err?.data?.message;
      if (typeof backendError === 'string') {
        toast.error(backendError);
      } else if (err?.data?.errors) {
        // Agar backend maydon bo‘yicha xatoliklar yuborsa
        const errorObj = err.data.errors;
        const errorMessages = Object.values(errorObj).flat().join(' ');
        toast.error(errorMessages || "Xatolik yuz berdi");
      } else {
        toast.error("Saqlashda xatolik yuz berdi");
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAnnouncement(deleteTarget.id).unwrap();
      toast.success("E'lon o'chirildi");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "O'chirishda xatolik");
    }
  };

  const handleToggle = async (item) => {
    try {
      await togglePublish({
        id: item.id,
        is_public: item.is_public !== true,
      }).unwrap();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Holatni o'zgartirib bo'lmadi");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="E'lonlar"
        description="Kutubxona e'lonlarini boshqaring."
        actionLabel="E'lon qo'shish"
        onAction={openCreate}
      />

      <div className="mb-5">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="E'lon qidirish..."
        />
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-300 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 px-6 py-10 text-center text-red-600">
          E'lonlarni yuklashda xatolik.
        </div>
      ) : (
        <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-44 bg-slate-100">
                {item.cover_image ? (
                  <img
                    src={item.cover_image.startsWith("http") ? item.cover_image : `${BASE_URL}${item.cover_image}`}
                    alt={item.title_latin}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <ImageIcon />
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                    {item.title_latin}
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      item.is_public === true
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.is_public === true ? "Faol" : "Yopiq"}
                  </button>
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                  {item.content_latin}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} />
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("uz-UZ")
                    : "-"}
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "E'lonni tahrirlash" : "Yangi e'lon"}
        size="lg"
      >
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {LANGS.map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setActiveLang(lang.key)}
                className={`flex-1 rounded-md py-2 text-sm font-medium ${
                  activeLang === lang.key
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-500"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {LANGS.map((lang) => (
            <div key={lang.key} className={activeLang === lang.key ? "space-y-4" : "hidden"}>
              <FormField
                label={`Sarlavha (${lang.label})`}
                value={form[`title_${lang.key}`]}
                onChange={(e) => changeField(`title_${lang.key}`, e.target.value)}
                error={errors[`title_${lang.key}`]}
              />

              <FormField
                as="textarea"
                rows={4}
                label={`Tavsif (${lang.label})`}
                value={form[`content_${lang.key}`]}
                onChange={(e) => changeField(`content_${lang.key}`, e.target.value)}
                error={errors[`content_${lang.key}`]}
              />
            </div>
          ))}

          <ImageUploadField
            label="Muqova rasmi"
            value={file}
            existingUrl={editing?.cover_image}
            onChange={setFile}
            maxSizeMb={5}
          />

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => changeField("is_public", e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Saytda ko'rsatish
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="rounded-lg border border-slate-200 px-5 hover:bg-slate-50 py-2.5 text-sm text-slate-600"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium text-black hover:bg-slate-50 disabled:opacity-50"
            >
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="E'lonni o'chirish"
        description={`"${deleteTarget?.title_latin || ""}" e'lonini o'chirmoqchimisiz?`}
      />
    </div>
  );
}