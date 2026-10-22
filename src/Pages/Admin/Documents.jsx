import { useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, FileText } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import FileUploadField from "./components/FileUploadField";
import Pagination from "./components/Pagination";
import {
  SearchInput,
  FilterSelect,
} from "./components/ListControls";
import AdminEmptyState from "./components/AdminEmptyState";
import { AdminErrorState, AdminTable, RowActions, StatusToggle, TableSkeleton } from "./components/AdminUI";
import { BASE_URL } from "../../store/api";

import { required, minLength, validateForm } from "./utils/validators";

import {
  useGetAdminDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useToggleDocumentPublicMutation,
} from "../../store/services/documents.api";
import apiError from "../../lib/apiError";

const LANGS = [
  {
    key: "latin",
    label: "Lotin",
  },
  {
    key: "cyril",
    label: "Kirill",
  },
  {
    key: "ru",
    label: "Rus",
  },
];

const CATEGORIES = [
  {
    value: "LAW",
    label: "Qonun",
  },
  {
    value: "DECISION",
    label: "Qaror",
  },
  {
    value: "ORDER",
    label: "Buyruq",
  },
  {
    value: "REPORT",
    label: "Hisobot",
  },
];

const DOCUMENT_FILE_EXTENSIONS = ["pdf", "doc", "docx"];

const categoryLabel = (value) =>
  CATEGORIES.find((item) => item.value === value)?.label || value;

const emptyForm = {
  title_latin: "",
  title_cyril: "",
  title_ru: "",

  category: "LAW",

  is_public: true,
};

// UpdateDocumentsDto maydonlari (fayl alohida). Ilgari `...item` dan
// tuzilgan forma butunlay ketardi: file_url, file_name, file_size, id,
// vaqt maydonlari ham multipart maydon bo'lib yuborilardi.
const DOCUMENT_FIELDS = Object.keys(emptyForm);

const formSchema = [
  {
    field: "title_latin",
    validators: [
      (v) => required(v, "Sarlavha (lotin)"),

      (v) => minLength(v, 3, "Sarlavha"),
    ],
  },

  {
    field: "category",
    validators: [(v) => required(v, "Kategoriya")],
  },
];

export default function Documents() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState();

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [errors, setErrors] = useState({});

  const [activeLang, setActiveLang] = useState("latin");

  const [file, setFile] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [pendingId, setPendingId] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useGetAdminDocumentsQuery({
    page,
    limit: 10,
    search,
    category: categoryFilter,
  });

  const [createDocument, { isLoading: isCreating }] =
    useCreateDocumentMutation();

  const [updateDocument, { isLoading: isUpdating }] =
    useUpdateDocumentMutation();

  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();

  const [togglePublic] = useToggleDocumentPublicMutation();

  const items = data?.data ?? [];

  

  const totalPages = data?.meta?.totalPages ?? 1;

  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...emptyForm,
    });

    setErrors({});

    setActiveLang("latin");

    setFile(null);

    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);

    setForm({
      ...emptyForm,
      ...item,
    });

    setErrors({});

    setActiveLang("latin");

    setFile(null);

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    const validationErrors = validateForm(form, formSchema);

    if (!editing && !file) {
      validationErrors.file = "Hujjat fayli tanlanmagan";
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);

      toast.error("Formada xatolar bor");

      return;
    }

    const payload = {
      ...Object.fromEntries(DOCUMENT_FIELDS.map((f) => [f, form[f]])),

      file: file ?? undefined,
    };

    try {
      if (editing) {
        await updateDocument({
          id: editing.id,
          ...payload,
        }).unwrap();

        toast.success("Hujjat yangilandi");
      } else {
       await createDocument(payload).unwrap();

        toast.success("Hujjat qo‘shildi");
      }

      setModalOpen(false);
    } catch (err) {
      toast.error(apiError(err, "Saqlashda xatolik"));
    }
  };

  const handleTogglePublic = async (item) => {
    setPendingId(item.id);
    try {
      await togglePublic({
        id: item.id,
        is_public: !item.is_public,
      }).unwrap();
    } catch (err) {
      toast.error(apiError(err, "Holatni o‘zgartirib bo‘lmadi"));
    } finally {
      setPendingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDocument(deleteTarget.id).unwrap();

      toast.success("Hujjat o‘chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O‘chirishda xatolik"));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Hujjatlar"
        description="Rasmiy hujjatlarni boshqaring."
        actionLabel="Hujjat qo‘shish"
        onAction={openCreate}
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Sarlavha bo‘yicha qidirish..."
        />

        <FilterSelect
          value={categoryFilter}
          onChange={(value) => {
            setCategoryFilter(value);
            setPage(1);
          }}
          options={CATEGORIES}
          placeholder="Barcha kategoriyalar"
        />
      </div>

      {/* Jadval: hujjat — nom, kategoriya, sana, fayl. Ilgari matnli
          kartochkalarda fayl nomi ham, uni ochish yo'li ham yo'q edi. */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : error ? (
        <AdminErrorState title="Hujjatlarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : items.length === 0 ? (
        <AdminEmptyState title="Hujjatlar topilmadi" icon={FileText} />
      ) : (
        <AdminTable
          rows={items}
          isFetching={isFetching}
          columns={[
            {
              key: "title",
              header: "Hujjat",
              cell: (item) => (
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-medium text-slate-900">{item.title_latin || "Nomsiz"}</p>
                    {item.file_url ? (
                      <a
                        href={`${BASE_URL}${item.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex max-w-full items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                      >
                        <ExternalLink size={11} className="shrink-0" />
                        <span className="truncate">{item.file_name || "Faylni ochish"}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-red-500">Fayl yo‘q</span>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "category",
              header: "Kategoriya",
              hideBelow: "sm",
              cell: (item) => (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {categoryLabel(item.category)}
                </span>
              ),
            },
            {
              key: "date",
              header: "Sana",
              hideBelow: "md",
              className: "whitespace-nowrap tabular-nums text-slate-500",
              cell: (item) => (item.created_at ? new Date(item.created_at).toLocaleDateString("ru-RU") : "—"),
            },
            {
              key: "public",
              header: "Saytda",
              hideBelow: "sm",
              cell: (item) => (
                <StatusToggle
                  checked={item.is_public}
                  onLabel="Ko‘rinadi"
                  pending={pendingId === item.id}
                  onChange={() => handleTogglePublic(item)}
                />
              ),
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

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Hujjatni tahrirlash" : "Yangi hujjat"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="
              flex
              gap-1
              rounded-lg
              bg-slate-100
              p-1
            "
          >
            {LANGS.map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setActiveLang(lang.key)}
                className={`
                  flex-1
                  rounded-md
                  py-2
                  text-sm
                  font-medium
                  ${
                    activeLang === lang.key
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-500"
                  }
                `}
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

          <FormField
            as="select"
            label="Kategoriya"
            value={form.category}
            onChange={(e) => handleFieldChange("category", e.target.value)}
            error={errors.category}
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </FormField>

          <FileUploadField
            label="Hujjat fayli"
            allowedExtensions={DOCUMENT_FILE_EXTENSIONS}
            maxSizeMb={5}
            onUpload={setFile}
          />

          {file && (
            <p
              className="
              text-xs
              text-slate-500
            "
            >
              Tanlangan fayl: {file.name}
            </p>
          )}

          <label
            className="
              flex
              items-center
              gap-3
              text-sm
              font-medium
              text-slate-700
            "
          >
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => handleFieldChange("is_public", e.target.checked)}
            />
            Saytda ko‘rsatish
          </label>

          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              border-slate-100
              pt-5
            "
          >
            <button
              type="button"
              onClick={closeModal}
              className="
                rounded-lg
                border
                border-slate-200
                px-5
                py-2.5
                text-sm
                text-slate-600
                hover:bg-slate-50
              "
            >
              Bekor qilish
            </button>

            <button
              disabled={isSaving}
              className="
                rounded-lg
                border
                px-5
                py-2.5
                text-sm
                font-medium
                text-black
                disabled:opacity-50
                hover:bg-slate-50
              "
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
        title="Hujjatni o‘chirish"
        description={`"${deleteTarget?.title_latin || ""}" hujjatini o‘chirmoqchimisiz?`}
      />
    </div>
  );
}
