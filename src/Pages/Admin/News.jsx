import { useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, ImageIcon, Newspaper } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import AdminEmptyState from "./components/AdminEmptyState";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import ImageUploadField from "./components/ImageUploadField";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";
import {
  AdminErrorState,
  CardGridSkeleton,
  LangDots,
  RowActions,
  StatusToggle,
} from "./components/AdminUI";

import {
  useCreateNewsMutation,
  useDeleteNewsMutation,
  useGetAdminNewsQuery,
  useUpdateNewsMutation,
} from "../../store/services/news.api";
import { BASE_URL } from "../../store/api";
import apiError from "../../lib/apiError";

/**
 * Yangiliklar — admin boshqaruvi (backenddagi /news moduli).
 *
 * E'lonlar bilan bir xil tuzilma: sarlavha va matn uch tilda, muqova,
 * chop etish holati. Ro'yxat GET /news/admin — yashirinlari ham ko'rinadi.
 */
const LANGS = [
  { key: "latin", label: "Lotin" },
  { key: "cyril", label: "Kirill" },
  { key: "ru", label: "Rus" },
];

// CreateNewsDto / UpdateNewsDto matnli maydonlari
const TEXT_FIELDS = [
  "title_latin", "title_cyril", "title_ru",
  "content_latin", "content_cyril", "content_ru",
];

const emptyForm = {
  ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, ""])),
  is_public: true,
};

const imageUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

const plain = (html) => String(html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export default function News() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [activeLang, setActiveLang] = useState("latin");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useGetAdminNewsQuery({ page, limit: 12, search });
  const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();
  const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();
  const [deleteNews, { isLoading: isDeleting }] = useDeleteNewsMutation();

  const items = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setActiveLang("latin");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, item[f] ?? ""])),
      is_public: item.is_public ?? true,
    });
    setFile(null);
    setActiveLang("latin");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // CreateNewsDto: sarlavha va matn uchala tilda majburiy
    if (!editing) {
      const missing = TEXT_FIELDS.find((f) => !String(form[f]).trim());
      if (missing) {
        const lang = LANGS.find((l) => missing.endsWith(l.key));
        if (lang) setActiveLang(lang.key);
        toast.error("Sarlavha va matnni uchala tilda kiriting");
        return;
      }
    }

    try {
      if (editing) {
        // Faqat o'zgargan maydonlar
        const changed = Object.fromEntries(
          TEXT_FIELDS.filter((f) => form[f] !== (editing[f] ?? "")).map((f) => [f, form[f]]),
        );
        if (Boolean(form.is_public) !== Boolean(editing.is_public)) changed.is_public = Boolean(form.is_public);
        if (file) changed.cover_image = file;

        if (Object.keys(changed).length === 0) {
          toast.error("Hech qanday o'zgarish kiritilmagan");
          return;
        }
        await updateNews({ id: editing.id, ...changed }).unwrap();
        toast.success("Yangilik yangilandi");
      } else {
        await createNews({ ...form, cover_image: file ?? undefined }).unwrap();
        toast.success("Yangilik qo‘shildi");
      }
      closeModal();
    } catch (err) {
      toast.error(apiError(err, "Saqlashda xatolik yuz berdi"));
    }
  };

  const handleToggle = async (item) => {
    setPendingId(item.id);
    try {
      await updateNews({ id: item.id, is_public: !item.is_public }).unwrap();
    } catch (err) {
      toast.error(apiError(err, "Holatni o‘zgartirib bo‘lmadi"));
    } finally {
      setPendingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNews(deleteTarget.id).unwrap();
      toast.success("Yangilik o‘chirildi");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O‘chirishda xatolik"));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Yangiliklar"
        description="Kutubxona yangiliklarini boshqaring."
        actionLabel="Yangilik qo‘shish"
        onAction={openCreate}
      />

      <div className="mb-5">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Yangilik qidirish..."
        />
      </div>

      {isLoading ? (
        <CardGridSkeleton count={6} media="16/9" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" />
      ) : error ? (
        <AdminErrorState title="Yangiliklarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : items.length === 0 ? (
        <AdminEmptyState title={search ? "Qidiruv bo‘yicha topilmadi" : "Yangiliklar hali qo‘shilmagan"} icon={Newspaper} />
      ) : (
        <div className={`grid gap-5 transition-opacity md:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
          {items.map((item) => {
            const cover = imageUrl(item.cover_image);
            const preview = plain(item.content_latin);
            return (
              <article
                key={item.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video shrink-0 overflow-hidden bg-slate-100">
                  {cover ? (
                    <img
                      src={cover}
                      alt={item.title_latin || ""}
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover ${item.is_public ? "" : "opacity-50 grayscale"}`}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <ImageIcon />
                    </span>
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
                    checked={item.is_public}
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

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={data?.meta?.total} disabled={isFetching} />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Yangilikni tahrirlash" : "Yangi yangilik"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {LANGS.map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setActiveLang(lang.key)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  activeLang === lang.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
                required={!editing}
                value={form[`title_${lang.key}`]}
                onChange={(e) => change(`title_${lang.key}`, e.target.value)}
              />
              <FormField
                as="textarea"
                rows={6}
                label={`Matn (${lang.label})`}
                required={!editing}
                value={form[`content_${lang.key}`]}
                onChange={(e) => change(`content_${lang.key}`, e.target.value)}
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
              onChange={(e) => change("is_public", e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Saytda ko‘rsatish
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
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
        title="Yangilikni o‘chirish"
        description={`"${deleteTarget?.title_latin || ""}" butunlay o‘chiriladi.`}
      />
    </div>
  );
}
