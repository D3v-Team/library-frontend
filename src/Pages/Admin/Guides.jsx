import { useState } from "react";
import toast from "react-hot-toast";
import { BookMarked, ExternalLink, FileText } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import AdminEmptyState from "./components/AdminEmptyState";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import FileUploadField from "./components/FileUploadField";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";
import { AdminErrorState, AdminTable, LangDots, RowActions, TableSkeleton } from "./components/AdminUI";

import {
  useCreateGuideMutation,
  useDeleteGuideMutation,
  useGetAdminGuidesQuery,
  useUpdateGuideMutation,
} from "../../store/services/guides.api";
import { BASE_URL } from "../../store/api";
import apiError from "../../lib/apiError";

/**
 * Qo'llanmalar — admin boshqaruvi (backenddagi /guides moduli).
 *
 * Nom va tavsif uch tilda, fayl faqat PDF. Saytda /guides sahifasida
 * (Kitoblar menyusi ostida) ko'rinadi. CreateGuideDto: nom uchala
 * tilda va fayl majburiy; tavsif ixtiyoriy.
 */
const LANGS = [
  { key: "latin", label: "Lotin" },
  { key: "cyril", label: "Kirill" },
  { key: "ru", label: "Rus" },
];

const TEXT_FIELDS = [
  "name_latin", "name_cyril", "name_ru",
  "description_latin", "description_cyril", "description_ru",
];
const REQUIRED = ["name_latin", "name_cyril", "name_ru"];

const emptyForm = Object.fromEntries(TEXT_FIELDS.map((f) => [f, ""]));

const fileUrl = (guide) => {
  const path = guide?.file_url || guide?.file_path || guide?.file;
  if (!path || typeof path !== "string") return null;
  return path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function Guides() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeLang, setActiveLang] = useState("latin");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useGetAdminGuidesQuery({ page, limit: 20, search });
  const [createGuide, { isLoading: isCreating }] = useCreateGuideMutation();
  const [updateGuide, { isLoading: isUpdating }] = useUpdateGuideMutation();
  const [deleteGuide, { isLoading: isDeleting }] = useDeleteGuideMutation();

  const items = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setErrors({});
    setActiveLang("latin");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm(Object.fromEntries(TEXT_FIELDS.map((f) => [f, item[f] ?? ""])));
    setFile(null);
    setErrors({});
    setActiveLang("latin");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const change = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const nextErrors = {};
    REQUIRED.forEach((f) => {
      if (!String(form[f]).trim()) nextErrors[f] = "Nomni kiriting";
    });
    if (!editing && !file) nextErrors.file = "PDF fayl tanlanmagan";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      // Xato turgan til tabiga o'tamiz
      const missing = REQUIRED.find((f) => nextErrors[f]);
      if (missing) setActiveLang(missing.replace("name_", ""));
      toast.error(nextErrors.file && !missing ? nextErrors.file : "Nomni uchala tilda kiriting");
      return;
    }

    try {
      if (editing) {
        // Faqat o'zgargan maydonlar
        const changed = Object.fromEntries(
          TEXT_FIELDS.filter((f) => form[f] !== (editing[f] ?? "")).map((f) => [f, form[f]]),
        );
        if (file) changed.file = file;

        if (Object.keys(changed).length === 0) {
          toast.error("Hech qanday o'zgarish kiritilmagan");
          return;
        }
        await updateGuide({ id: editing.id, ...changed }).unwrap();
        toast.success("Qo‘llanma yangilandi");
      } else {
        await createGuide({ ...form, file }).unwrap();
        toast.success("Qo‘llanma qo‘shildi");
      }
      closeModal();
    } catch (err) {
      toast.error(apiError(err, "Saqlashda xatolik yuz berdi"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGuide(deleteTarget.id).unwrap();
      toast.success("Qo‘llanma o‘chirildi");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O‘chirishda xatolik"));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Qo‘llanmalar"
        description="PDF formatdagi qo‘llanmalarni boshqaring. Saytda «Kitoblar» menyusi ostida chiqadi."
        actionLabel="Qo‘llanma qo‘shish"
        onAction={openCreate}
      />

      <div className="mb-5">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Qo‘llanma qidirish..."
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : error ? (
        <AdminErrorState title="Qo‘llanmalarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          title={search ? "Qidiruv bo‘yicha topilmadi" : "Qo‘llanmalar hali qo‘shilmagan"}
          icon={BookMarked}
        />
      ) : (
        <AdminTable
          rows={items}
          isFetching={isFetching}
          columns={[
            {
              key: "name",
              header: "Qo‘llanma",
              cell: (item) => {
                const href = fileUrl(item);
                return (
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <FileText size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-medium text-slate-900">{item.name_latin || "Nomsiz"}</p>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                        >
                          <ExternalLink size={11} className="shrink-0" />
                          <span className="truncate">{item.file_name || "PDF ni ochish"}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-red-500">Fayl yo‘q</span>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              key: "description",
              header: "Tavsif",
              hideBelow: "lg",
              cell: (item) =>
                item.description_latin ? (
                  <p className="line-clamp-2 max-w-md text-sm text-slate-500">{item.description_latin}</p>
                ) : (
                  <span className="text-xs italic text-slate-400">Kiritilmagan</span>
                ),
            },
            {
              key: "langs",
              header: "Tillar",
              hideBelow: "md",
              cell: (item) => <LangDots record={item} field="name" />,
            },
            {
              key: "date",
              header: "Sana",
              hideBelow: "sm",
              className: "whitespace-nowrap tabular-nums text-slate-500",
              cell: (item) => (item.created_at ? new Date(item.created_at).toLocaleDateString("ru-RU") : "—"),
            },
            {
              key: "actions",
              header: <span className="sr-only">Amallar</span>,
              align: "right",
              cell: (item) => <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />,
            },
          ]}
        />
      )}

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} total={data?.meta?.total} disabled={isFetching} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Qo‘llanmani tahrirlash" : "Yangi qo‘llanma"} size="lg">
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
                label={`Nomi (${lang.label})`}
                required
                value={form[`name_${lang.key}`]}
                onChange={(e) => change(`name_${lang.key}`, e.target.value)}
                error={errors[`name_${lang.key}`]}
              />
              <FormField
                as="textarea"
                rows={4}
                label={`Tavsif (${lang.label})`}
                value={form[`description_${lang.key}`]}
                onChange={(e) => change(`description_${lang.key}`, e.target.value)}
              />
            </div>
          ))}

          <div>
            <FileUploadField
              label={editing ? "PDF faylni almashtirish" : "PDF fayl"}
              allowedExtensions={["pdf"]}
              maxSizeMb={20}
              onUpload={(f) => {
                setFile(f);
                setErrors((prev) => ({ ...prev, file: undefined }));
              }}
            />
            {file ? (
              <p className="mt-2 text-xs text-slate-500">Tanlangan fayl: {file.name}</p>
            ) : editing && fileUrl(editing) ? (
              <p className="mt-2 text-xs text-slate-400">
                Joriy fayl: {editing.file_name || "PDF"} — yangisini tanlamasangiz o‘zgarmaydi
              </p>
            ) : null}
            {errors.file && <p className="mt-2 text-xs text-red-600">{errors.file}</p>}
          </div>

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
        title="Qo‘llanmani o‘chirish"
        description={`"${deleteTarget?.name_latin || ""}" butunlay o‘chiriladi.`}
      />
    </div>
  );
}
