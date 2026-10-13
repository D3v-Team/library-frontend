import { useState } from "react";
import toast from "react-hot-toast";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import {
  AdminErrorState,
  AdminTable,
  LangDots,
  RowActions,
  StatusToggle,
  TableSkeleton,
} from "./components/AdminUI";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";

import AdminEmptyState from "./components/AdminEmptyState";

import {
  useGetAllUsefulLinksQuery,
  useCreateUsefulLinkMutation,
  useUpdateUsefulLinkMutation,
  useDeleteUsefulLinkMutation,
} from "../../store/services/links";
import { safeHref } from "../../utils/url";
import { required, isValidUrl, validateForm } from "./utils/validators";
import apiError from "../../lib/apiError";


const emptyForm = {
  title_latin: "",
  title_cyril: "",
  title_ru: "",

  url: "",


  order: 0,
  is_active: true,
};

const formSchema = [
  {
    field: "title_latin",
    validators: [(v) => required(v, "Nomi (Lotin)")],
  },
  {
    field: "url",
    validators: [(v) => required(v, "URL"), isValidUrl],
  },
];

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

// UpdateUsefulLinkDto maydonlari — faqat shular yuboriladi (ilgari `...item`
// tufayli id ham ketardi)
const DTO_FIELDS = Object.keys(emptyForm);

export default function Links() {
  const [pendingId, setPendingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [activeLang, setActiveLang] = useState("latin");

  const [errors, setErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Havolalar oz (admin qo'lda kiritadi) — hammasi bitta so'rovda, saytdagi
  // tartibda; qidiruv va paginatsiya kerak emas
  const { data, isLoading, isFetching, error, refetch } = useGetAllUsefulLinksQuery({
    page: 1,
    limit: 100,
  });
  

  const [createUsefulLink, { isLoading: isCreating }] =
    useCreateUsefulLinkMutation();

  const [updateUsefulLink, { isLoading: isUpdating }] =
    useUpdateUsefulLinkMutation();

  const [deleteUsefulLink, { isLoading: isDeleting }] =
    useDeleteUsefulLinkMutation();

  const items = [...(data?.data ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...emptyForm,
    });

    setErrors({});

    setActiveLang("latin");

    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);

    setForm(Object.fromEntries(DTO_FIELDS.map((f) => [f, item[f] ?? emptyForm[f]])));

    setErrors({});

    setActiveLang("latin");

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);

    setEditing(null);
  };

  const changeField = (field, value) => {
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

  const submitHandler = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    const validationErrors = validateForm(form, formSchema);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);

      toast.error("Formada xatolar bor");

      return;
    }

    try {
      if (editing) {
        await updateUsefulLink({
          id: editing.id,
          ...Object.fromEntries(DTO_FIELDS.map((f) => [f, form[f]])),
          order: Number(form.order) || 0,
        }).unwrap();

        toast.success("Link yangilandi");
      } else {
        await createUsefulLink({ ...form, order: Number(form.order) || 0 }).unwrap();

        toast.success("Link qo‘shildi");
      }

      closeModal();
    } catch (err) {
      toast.error(apiError(err, "Xatolik yuz berdi"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteUsefulLink(deleteTarget.id).unwrap();

      toast.success("Link o‘chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O‘chirishda xatolik"));
    }
  };

  const handleToggleActive = async (item) => {
    setPendingId(item.id);
    try {
      await updateUsefulLink({
        id: item.id,
        is_active: !item.is_active,
      }).unwrap();

      toast.success(
        item.is_active ? "Link nofaol qilindi" : "Link faol qilindi",
      );
    } catch (err) {
      toast.error(apiError(err, "Holatni o‘zgartirib bo‘lmadi"));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Foydali linklar"
        description="Saytdagi foydali havolalarni boshqaring."
        actionLabel="Link qo‘shish"
        onAction={openCreate}
      />

      {isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : error ? (
        <AdminErrorState title="Havolalarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : items.length === 0 ? (
        <AdminEmptyState title="Foydali havolalar hali qo‘shilmagan" icon={LinkIcon} />
      ) : (
        <AdminTable
          rows={items}
          isFetching={isFetching}
          onRowClick={openEdit}
          columns={[
            {
              key: "order",
              header: "#",
              className: "w-12 tabular-nums text-slate-400",
              cell: (item) => item.order ?? "—",
            },
            {
              key: "title",
              header: "Havola",
              cell: (item) => (
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{item.title_latin || "Nomsiz"}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <LangDots record={item} field="title" />
                    {/* Mobil: URL shu yerda */}
                    <span className="truncate text-xs text-slate-400 md:hidden">{item.url}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "url",
              header: "URL",
              hideBelow: "md",
              cell: (item) => (
                <a
                  href={safeHref(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex max-w-[18rem] items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
                >
                  <ExternalLink size={13} className="shrink-0" />
                  <span className="truncate">{item.url}</span>
                </a>
              ),
            },
            {
              key: "active",
              header: "Saytda",
              cell: (item) => (
                <StatusToggle
                  checked={item.is_active}
                  onLabel="Ko‘rinadi"
                  pending={pendingId === item.id}
                  onChange={() => handleToggleActive(item)}
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

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Linkni tahrirlash" : "Yangi link"}
        size="lg"
      >
        <form onSubmit={submitHandler} className="space-y-6">
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
              className={activeLang === lang.key ? "space-y-4" : "hidden"}
            >
              <FormField
                label={`Nomi (${lang.label})`}
                required={lang.key === "latin"}
                value={form[`title_${lang.key}`] || ""}
                error={errors[`title_${lang.key}`]}
                onChange={(e) =>
                  changeField(`title_${lang.key}`, e.target.value)
                }
              />
            </div>
          ))}

          <FormField
            label="URL"
            required
            placeholder="https://example.uz"
            value={form.url}
            error={errors.url}
            onChange={(e) => changeField("url", e.target.value)}
          />

          
          <FormField
            type="number"
            label="Tartib raqami"
            value={form.order}
            onChange={(e) => changeField("order", Number(e.target.value))}
          />

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
              checked={form.is_active}
              onChange={(e) => changeField("is_active", e.target.checked)}
            />
            Faol holatda
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
                hover:bg-slate-50
                px-5
                py-2.5
                text-sm
                text-slate-600
              "
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="
                rounded-lg
                border
                hover:bg-slate-50
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
        title="Linkni o‘chirish"
        description={`
          "${deleteTarget?.title_latin || ""}"
          linkini o‘chirmoqchimisiz?
        `}
      />
    </div>
  );
}
