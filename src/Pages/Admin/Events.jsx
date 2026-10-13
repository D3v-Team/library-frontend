// src/pages/admin/Events.jsx
import { useState } from "react";
import { AdminErrorState, CardGridSkeleton, RowActions, StatusToggle } from "./components/AdminUI";
import toast from "react-hot-toast";
import { CalendarDays, MapPin, Images } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import ImageUploadField from "./components/ImageUploadField";
import { ImageGalleryManager, MultiImagePicker } from "./components/MultiImageField";
import Pagination from "./components/Pagination";

import { SearchInput } from "./components/ListControls";
import AdminEmptyState from "./components/AdminEmptyState";

import {
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetAdminEventsQuery,
  useGetAdminEventByIdQuery,
  useUploadEventImagesMutation,
  useSetMainEventImageMutation,
  useDeleteEventImageMutation,
} from "../../store/services/events";

import { BASE_URL } from "../../store/api";
import apiError from "../../lib/apiError";

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

// UpdateEventsDto / CreateEventsDto dagi matnli maydonlar — faqat shular yuboriladi
const TEXT_FIELDS = [
  "title_latin", "title_cyril", "title_ru",
  "description_latin", "description_cyril", "description_ru",
  "location_latin", "location_cyril", "location_ru",
];

const pad2 = (n) => String(n).padStart(2, "0");

/* Server ISO sanasi ("2026-09-15T06:00:00.000Z") -> <input type="date"> va
   <input type="time"> qiymatlari, MAHALLIY vaqtda. Ilgari ISO qatori
   to'g'ridan-to'g'ri date maydoniga tushardi: maydon bo'sh ko'rinar,
   faqat vaqt o'zgartirilsa esa hech narsa saqlanmasdi. */
function splitDate(iso) {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
}

function joinDate(date, time) {
  if (!date) return null;
  const d = new Date(`${date}T${time || "00:00"}:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

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
  const [images, setImages] = useState([]);
  const [pendingId, setPendingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeLang, setActiveLang] = useState("latin");

  const { data, isLoading, isFetching, error, refetch } = useGetAdminEventsQuery({
    page,
    limit: 10,
    search,
    upcoming,
    is_public: "",
  });

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  // Tahrirlashda rasmlar serverdan jonli o'qiladi: yuklash/o'chirishdan
  // keyin tag invalidatsiyasi bilan darhol yangilanadi
  // `currentData` — boshqa tadbirga o'tilganda oldingisining rasmlari
  // bir lahza ham ko'rinmasin (`data` eski natijani ushlab turadi)
  const { currentData: editingData, isFetching: isEditingFetching } = useGetAdminEventByIdQuery(
    editing?.id,
    { skip: !editing?.id },
  );
  const editingEvent = editingData?.data ?? editingData ?? editing;
  const [uploadEventImages] = useUploadEventImagesMutation();
  const [setMainEventImage] = useSetMainEventImageMutation();
  const [deleteEventImage] = useDeleteEventImageMutation();

  const handleUploadImages = async (files) => {
    try {
      await uploadEventImages({ id: editing.id, files }).unwrap();
    } catch (err) {
      toast.error(apiError(err, "Rasmlarni yuklashda xatolik"));
      throw err;
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await setMainEventImage({ id: editing.id, imageId }).unwrap();
      toast.success("Muqova o‘zgartirildi");
    } catch (err) {
      toast.error(apiError(err, "Muqovani o‘zgartirib bo‘lmadi"));
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteEventImage({ id: editing.id, imageId }).unwrap();
      toast.success("Rasm o‘chirildi");
    } catch (err) {
      toast.error(apiError(err, "Rasmni o‘chirishda xatolik"));
    }
  };

  const items = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const isSaving = isCreating || isUpdating;

  const handleTogglePublic = async (item) => {
    setPendingId(item.id);
    try {
      await updateEvent({
        id: item.id,
        is_public: !item.is_public,
      }).unwrap();
      toast.success(!item.is_public ? "Tadbir faollashtirildi" : "Tadbir yashirildi");
    } catch (err) {
      toast.error(apiError(err, "Status o‘zgarmadi"));
    } finally {
      setPendingId(null);
    }
  };

  // ===== OPEN EDIT – vaqtni to‘g‘ri ajratish =====
  const openEdit = (item) => {
    setEditing(item);
    const { date, time } = splitDate(item.event_date);
    setForm({
      ...emptyForm,
      ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, item[f] ?? ""])),
      event_date: date,
      event_time: time,
      is_public: item.is_public ?? true,
    });
    setFile(null);
    setImages([]);
    setErrors({});
    setActiveLang("latin");
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFile(null);
    setImages([]);
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

    const eventDate = joinDate(form.event_date, form.event_time);
    if (!eventDate) {
      toast.error("Tadbir sanasini kiriting");
      return;
    }

    let payload = {};

    if (editing) {
      // Faqat o'zgargan DTO maydonlari
      const changed = {};

      TEXT_FIELDS.forEach((f) => {
        if ((form[f] ?? "") !== (editing[f] ?? "")) changed[f] = form[f];
      });

      const oldDate = editing.event_date ? new Date(editing.event_date).toISOString() : null;
      if (eventDate !== oldDate) changed.event_date = eventDate;

      if (Boolean(form.is_public) !== Boolean(editing.is_public)) {
        changed.is_public = Boolean(form.is_public);
      }

      if (file) changed.cover_image = file;
      payload = changed;

      if (Object.keys(payload).length === 0) {
        toast.error("Hech qanday o'zgarish kiritilmagan");
        return;
      }
    } else {
      // CreateEventsDto: nom uch tilda majburiy
      if (!form.title_latin || !form.title_cyril || !form.title_ru) {
        toast.error("Tadbir nomini uchala tilda kiriting");
        return;
      }

      payload = {
        ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, form[f]])),
        event_date: eventDate,
        cover_image: file ?? undefined,
        images: images.length ? images : undefined,
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
      toast.error(apiError(err, "Xatolik yuz berdi"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget.id).unwrap();
      toast.success("Tadbir o‘chirildi");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O‘chirishda xatolik"));
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
        <CardGridSkeleton count={6} media="16/9" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" />
      ) : error ? (
        <AdminErrorState title="Tadbirlarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : items.length === 0 ? (
        <AdminEmptyState title="Tadbirlar topilmadi" icon={CalendarDays} />
      ) : (
        <div
          className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {items.map((item) => {
            const d = item.event_date ? new Date(item.event_date) : null;
            const valid = d && !Number.isNaN(d.getTime());
            const isPast = valid && d < new Date();
            return (
              /* Bir qatordagi kartochkalar bir xil balandlikda: matn qismlari
                 qat'iy balandlikda kesiladi, pastki panel `mt-auto` bilan pastda */
              <article
                key={item.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video shrink-0 overflow-hidden bg-slate-100">
                  {item.cover_image ? (
                    <img
                      src={item.cover_image.startsWith("http") ? item.cover_image : `${BASE_URL}${item.cover_image}`}
                      alt={item.title_latin || ""}
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover ${item.is_public ? "" : "opacity-50 grayscale"}`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">Rasm mavjud emas</div>
                  )}

                  {valid && (
                    <span
                      className={`absolute left-2 top-2 rounded-md px-2 py-1 text-xs font-medium ${
                        isPast ? "bg-white/90 text-slate-600" : "bg-green-600 text-white"
                      }`}
                    >
                      {isPast ? "O‘tgan" : "Kelayotgan"}
                    </span>
                  )}

                  {item.images?.length > 0 && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <Images size={12} />
                      {item.images.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-slate-900">
                    {item.title_latin || "Sarlavhasiz"}
                  </h3>

                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={15} className="shrink-0" />
                    {valid
                      ? `${d.toLocaleDateString("ru-RU")} · ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
                      : "—"}
                  </p>
                  <p className="flex min-h-[1.25rem] items-center gap-2 text-sm text-slate-500">
                    <MapPin size={15} className="shrink-0" />
                    <span className="truncate">{item.location_latin || <span className="text-slate-300">Joy ko‘rsatilmagan</span>}</span>
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                  <StatusToggle
                    checked={item.is_public}
                    onLabel="Ko‘rinadi"
                    pending={pendingId === item.id}
                    onChange={() => handleTogglePublic(item)}
                  />
                  <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} total={data?.meta?.total} disabled={isFetching} />
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
            existingUrl={editingEvent?.cover_image}
            onChange={setFile}
            maxSizeMb={5}
          />
          {file && (
            <p className="text-xs text-slate-500">Tanlangan fayl: {file.name}</p>
          )}
          {editing?.cover_image && !file && (
            <p className="text-xs text-slate-400">Joriy rasm mavjud</p>
          )}

          {editing ? (
            <ImageGalleryManager
              images={editingEvent?.images ?? []}
              isLoading={isEditingFetching && !editingData}
              onUpload={handleUploadImages}
              onSetMain={handleSetMainImage}
              onDelete={handleDeleteImage}
            />
          ) : (
            <MultiImagePicker value={images} onChange={setImages} />
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
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Tadbirni o‘chirish"
        description={`"${deleteTarget?.title_latin || ""}" tadbirini o‘chirmoqchimisiz?`}
      />
    </div>
  );
}