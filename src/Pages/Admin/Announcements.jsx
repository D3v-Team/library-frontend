// AdminAnnouncements.jsx
import { useState } from "react";
import { AdminErrorState, CardGridSkeleton, LangDots, RowActions, StatusToggle } from "./components/AdminUI";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ImageIcon,
  Megaphone,
} from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import ImageUploadField from "./components/ImageUploadField";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";
import AdminEmptyState from "./components/AdminEmptyState";

import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useToggleAnnouncementPublishMutation,
} from "../../store/services/announcements.api";

import { BASE_URL } from "../../store/api";
import apiError from "../../lib/apiError";

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
  const [pendingId, setPendingId] = useState(null);

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
    } catch (err) {
      const backendError = apiError(err);
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
    } catch (err) {
      toast.error(apiError(err, "O'chirishda xatolik"));
    }
  };

  const handleToggle = async (item) => {
    setPendingId(item.id);
    try {
      await togglePublish({
        id: item.id,
        is_public: item.is_public !== true,
      }).unwrap();
    } catch (err) {
      toast.error(apiError(err, "Holatni o'zgartirib bo'lmadi"));
    } finally {
      setPendingId(null);
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

      {/* Backend cheklovi: GET /announcements faqat chop etilganlarni beradi */}
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Yashirilgan e&apos;lonlar sahifa yangilangandan keyin ro&apos;yxatda ko&apos;rinmaydi —
        backendda admin uchun barcha e&apos;lonlar ro&apos;yxati hali yo&apos;q. E&apos;lonni yashirishdan
        oldin shuni hisobga oling.
      </div>

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
        <CardGridSkeleton count={6} media="16/9" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" />
      ) : error ? (
        <AdminErrorState title="E'lonlarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : items.length === 0 ? (
        <AdminEmptyState title="E'lonlar topilmadi" icon={Megaphone} />
      ) : (
        <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
          {items.map((item) => {
            // Matn HTML bo'lishi mumkin — kartochkada faqat toza matn
            const preview = String(item.content_latin ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
            return (
              /* Kartochkalar bir qatorda BIR XIL balandlikda: grid elementni
                 cho'zadi (h-full), matn qismlari qat'iy balandlikda kesiladi,
                 pastki panel esa `mt-auto` bilan doim eng pastda. Ilgari matn
                 uzun-qisqaligiga qarab kartochkalar har xil bo'yda edi. */
              <article
                key={item.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Rasm absolyut: flex ustunida aspect-ratio qutisi rasmning asl
                    balandligiga qarab cho'zilib ketmasin */}
                <div className="relative aspect-video shrink-0 overflow-hidden bg-slate-100">
                  {item.cover_image ? (
                    <img
                      src={item.cover_image.startsWith("http") ? item.cover_image : `${BASE_URL}${item.cover_image}`}
                      alt={item.title_latin || ""}
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover ${item.is_public ? "" : "opacity-50 grayscale"}`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <ImageIcon />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-slate-900">
                    {item.title_latin || "Sarlavhasiz"}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-slate-500">
                    {preview || <span className="italic text-slate-400">Matn kiritilmagan</span>}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {item.created_at ? new Date(item.created_at).toLocaleDateString("ru-RU") : "—"}
                    </span>
                    <LangDots record={item} field="title" />
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                  <StatusToggle
                    checked={item.is_public === true}
                    onLabel="Ko‘rinadi"
                    pending={pendingId === item.id}
                    onChange={() => handleToggle(item)}
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