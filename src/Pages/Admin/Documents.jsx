import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, FileText } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import FileUploadField from "./components/FileUploadField";
import Pagination from "./components/Pagination";
import {
  SearchInput,
  StatusBadge,
  FilterSelect,
} from "./components/ListControls";

import { required, minLength, validateForm } from "./utils/validators";

import {
  useGetAdminDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useToggleDocumentPublicMutation,
} from "../../store/services/documents.api";

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

const formSchema = [
  {
    field: "title_latin",
    validators: [
      (v) => required(v, "Sarlavha (lotin)"),

      (v) => minLength(v, 3, "Sarlavha kamida 3 ta belgi"),
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

  const { data, isLoading, isFetching, error } = useGetAdminDocumentsQuery({
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
      ...form,

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
      toast.error(err?.data?.message || "Saqlashda xatolik");
    }
  };

  const handleTogglePublic = async (item) => {
    try {
      await togglePublic({
        id: item.id,
        is_public: !item.is_public,
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Holatni o‘zgartirib bo‘lmadi");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDocument(deleteTarget.id).unwrap();

      toast.success("Hujjat o‘chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "O‘chirishda xatolik");
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

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="
                h-52
                animate-pulse
                rounded-2xl
                bg-blue-700
              "
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="
          rounded-xl
          border
          border-red-200
          bg-red-50
          px-6
          py-12
          text-center
          text-red-600
        "
        >
          Hujjatlarni yuklashda xatolik.
        </div>
      ) : items.length === 0 ? (
        <div
          className="
          rounded-2xl
          border
          border-dashed
          border-slate-300
          bg-white
          px-6
          py-16
          text-center
        "
        >
          <FileText className="mx-auto mb-3 text-slate-300" size={32} />

          <p className="text-sm text-slate-500">
            Hozircha hujjatlar mavjud emas.
          </p>
        </div>
      ) : (
        <div
          className={`
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
            ${isFetching ? "opacity-60" : ""}
          `}
        >
          {items.map((item) => (
            <article
              key={item.id}
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <div
                className="
                flex
                items-start
                justify-between
              "
              >
                <div
                  className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                  text-slate-600
                "
                >
                  <FileText size={22} />
                </div>

                <button type="button" onClick={() => handleTogglePublic(item)}>
                  <StatusBadge
                    active={item.is_public}
                    activeLabel="Faol"
                    inactiveLabel="Nofaol"
                  />
                </button>
              </div>
              <h3
                className="
                  mt-5
                  line-clamp-2
                  text-lg
                  font-semibold
                  text-slate-900
                "
              >
                {item.title_latin}
              </h3>

              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    rounded-full
                    bg-slate-100
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-slate-600
                  "
                >
                  {categoryLabel(item.category)}
                </span>

                <span
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("uz-UZ")
                    : "—"}
                </span>
              </div>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-end
                  gap-2
                  border-t
                  border-slate-100
                  pt-4
                "
              >
                <button
                  type="button"
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
                    transition
                    hover:bg-slate-50
                    hover:text-slate-900
                  "
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-red-200
                    text-red-500
                    transition
                    hover:bg-red-50
                  "
                >
                  <Trash2 size={16} />
                </button>
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
              "
            >
              Bekor qilish
            </button>

            <button
              disabled={isSaving}
              className="
                rounded-lg
                bg-slate-900
                px-5
                py-2.5
                text-sm
                font-medium
                text-black
                disabled:opacity-50
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
