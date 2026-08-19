// src/pages/admin/Events.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, CalendarDays, MapPin, ImageIcon } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import ImageUploadField from "./components/ImageUploadField";
import Pagination from "./components/Pagination";

import { SearchInput } from "./components/ListControls";

import {
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetAdminEventsQuery,
} from "../../store/services/events";

import { BASE_URL } from "../../store/api";

const emptyForm = {
  title_latin: "",
  title_cyril: "",
  title_ru: "",
  description_latin: "",
  description_cyril: "",
  description_ru: "",
  location_latin: "",
  location_cyril: "",
  location_ru: "",
  event_date: "",
  event_time: "",
  is_public: true,
};

const LANGS = [
  { key: "latin", label: "Lotin" },
  { key: "cyril", label: "Kirill" },
  { key: "ru", label: "Rus" },
];

export default function Events() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [upcoming, setUpcoming] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeLang, setActiveLang] = useState("latin");

  const { data, isLoading, isFetching, error } = useGetAdminEventsQuery({
    page,
    limit: 10,
    search,
    upcoming,
    is_public: "",
  });

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const items = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const isSaving = isCreating || isUpdating;

  const handleTogglePublic = async (item) => {
    try {
      await updateEvent({
        id: item.id,
        is_public: !item.is_public,
      }).unwrap();
      toast.success(!item.is_public ? "Tadbir faollashtirildi" : "Tadbir yashirildi");
    } catch (err) {
      toast.error(err?.data?.message || "Status o‘zgarmadi");
    }
  };

  // ===== OPEN EDIT – vaqtni to‘g‘ri ajratish =====
  const openEdit = (item) => {
    setEditing(item);
    let time = "";
    if (item.event_date) {
      const dateObj = new Date(item.event_date);
      if (!isNaN(dateObj)) {
        time = dateObj.toTimeString().slice(0, 5);
      }
    }
    setForm({
      ...emptyForm,
      ...item,
      event_time: time,
    });
    setFile(null);
    setErrors({});
    setActiveLang("latin");
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFile(null);
    setErrors({});
    setActiveLang("latin");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ===== SUBMIT – faqat o‘zgargan maydonlar =====
  const submitHandler = async (e) => {
    e.preventDefault();

    let payload = {};

    if (editing) {
      // O'zgargan maydonlarni aniqlash
      const changed = {};
      const initial = { ...emptyForm, ...editing };

      Object.keys(form).forEach((key) => {
        if (key === 'event_time') {
          const oldTime = initial.event_date
            ? new Date(initial.event_date).toTimeString().slice(0, 5)
            : '';
          if (form[key] !== oldTime && form.event_date) {
            const dateObj = new Date(`${form.event_date}T${form.event_time}:00`);
            if (!isNaN(dateObj)) {
              changed.event_date = dateObj.toISOString();
            }
          }
        } else if (key === 'event_date') {
          const oldDate = initial.event_date || '';
          if (form[key] !== oldDate && form[key] && form.event_time) {
            const dateObj = new Date(`${form[key]}T${form.event_time}:00`);
            if (!isNaN(dateObj)) {
              changed.event_date = dateObj.toISOString();
            }
          } else if (form[key] !== oldDate && form[key]) {
            changed.event_date = form[key];
          }
        } else if (key !== 'event_time' && form[key] !== initial[key]) {
          changed[key] = form[key];
        }
      });

      if (file) changed.cover_image = file;
      payload = changed;

      if (Object.keys(payload).length === 0) {
        toast.error("Hech qanday o'zgarish kiritilmagan");
        return;
      }
    } else {
      // Yangi yaratish
      let eventDate = form.event_date;
      if (form.event_date && form.event_time) {
        const dateObj = new Date(`${form.event_date}T${form.event_time}:00`);
        if (!isNaN(dateObj)) {
          eventDate = dateObj.toISOString();
        }
      }
      payload = {
        ...form,
        event_date: eventDate,
        cover_image: file ?? undefined,
        is_public: Boolean(form.is_public),
      };
    }

    try {
      if (editing) {
        await updateEvent({ id: editing.id, ...payload }).unwrap();
        toast.success("Tadbir yangilandi");
      } else {
        await createEvent(payload).unwrap();
        toast.success("Tadbir qo‘shildi");
      }
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || "Xatolik yuz berdi");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget.id).unwrap();
      toast.success("Tadbir o‘chirildi");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "O‘chirishda xatolik");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Tadbirlar"
        description="O‘tkaziladigan va o‘tgan tadbirlarni boshqaring."
        actionLabel="Tadbir qo‘shish"
        onAction={openCreate}
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Tadbir qidirish..."
        />

       
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-blue-700" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 px-6 py-10 text-center text-red-600">
          Tadbirlarni yuklashda xatolik.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ImageIcon className="mx-auto mb-3 text-slate-300" size={32} />
          <p className="text-sm text-slate-500">Tadbirlar mavjud emas.</p>
        </div>
      ) : (
        <div
          className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-48 overflow-hidden bg-slate-100">
                {item.cover_image ? (
                  <img
                    src={
                      item.cover_image.startsWith("http")
                        ? item.cover_image
                        : `${BASE_URL}${item.cover_image}`
                    }
                    alt={item.title_latin}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Rasm mavjud emas
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                    {item.title_latin}
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleTogglePublic(item)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      item.is_public
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {item.is_public ? "Faol" : "Nofaol"}
                  </button>
                </div>

                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} />
                    {item.event_date
                      ? new Date(item.event_date).toLocaleDateString("uz-UZ")
                      : "-"}
                  </div>
                  {item.location_latin && (
                    <div className="flex items-center gap-2">
                      <MapPin size={15} />
                      {item.location_latin}
                    </div>
                  )}
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

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Tadbirni tahrirlash" : "Yangi tadbir"}
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
            <div
              key={lang.key}
              className={activeLang === lang.key ? "space-y-4" : "hidden"}
            >
              <FormField
                label={`Nomi (${lang.label})`}
                value={form[`title_${lang.key}`]}
                onChange={(e) =>
                  handleFieldChange(`title_${lang.key}`, e.target.value)
                }
              />
              <FormField
                as="textarea"
                rows={4}
                label={`Tavsif (${lang.label})`}
                value={form[`description_${lang.key}`]}
                onChange={(e) =>
                  handleFieldChange(`description_${lang.key}`, e.target.value)
                }
              />
            </div>
          ))}

          <FormField
            label="Manzil"
            value={form.location_latin}
            onChange={(e) => handleFieldChange("location_latin", e.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              type="date"
              label="Tadbir sanasi"
              value={form.event_date}
              onChange={(e) => handleFieldChange("event_date", e.target.value)}
            />
            <FormField
              type="time"
              label="Boshlanish vaqti"
              value={form.event_time}
              onChange={(e) => handleFieldChange("event_time", e.target.value)}
            />
          </div>

          <ImageUploadField
            label="Muqova rasmi"
            value={file}
            existingUrl={editing?.cover_image}
            onChange={setFile}
            maxSizeMb={5}
          />
          {file && (
            <p className="text-xs text-slate-500">Tanlangan fayl: {file.name}</p>
          )}
          {editing?.cover_image && !file && (
            <p className="text-xs text-slate-400">Joriy rasm mavjud</p>
          )}

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => handleFieldChange("is_public", e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Saytda ko‘rsatish
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
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
        title="Tadbirni o‘chirish"
        description={`"${deleteTarget?.title_latin || ""}" tadbirini o‘chirmoqchimisiz?`}
      />
    </div>
  );
}