import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, Link as LinkIcon, ExternalLink } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import Pagination from "./components/Pagination";

import { SearchInput } from "./components/ListControls";

import {
  useGetAllUsefulLinksQuery,
  useCreateUsefulLinkMutation,
  useUpdateUsefulLinkMutation,
  useDeleteUsefulLinkMutation,
} from "../../store/services/links";


const emptyForm = {
  title_latin: "",
  title_cyril: "",
  title_ru: "",

  url: "",
  icon: "",

  order: 0,
  is_active: true,
};

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

export default function Links() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [activeLang, setActiveLang] = useState("latin");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, error } = useGetAllUsefulLinksQuery({
    page,
    limit: 10,
    search,
  });
  

  const [createUsefulLink, { isLoading: isCreating }] =
    useCreateUsefulLinkMutation();

  const [updateUsefulLink, { isLoading: isUpdating }] =
    useUpdateUsefulLinkMutation();

  const [deleteUsefulLink, { isLoading: isDeleting }] =
    useDeleteUsefulLinkMutation();

  const items = data?.data ?? [];

  const totalPages = data?.meta?.totalPages ?? 1;

  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...emptyForm,
    });

    setActiveLang("latin");

    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);

    setForm({
      ...emptyForm,
      ...item,
    });

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
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await updateUsefulLink({
          id: editing.id,
          ...form,
        }).unwrap();

        toast.success("Link yangilandi");
      } else {
        await createUsefulLink(form).unwrap();

        toast.success("Link qo‘shildi");
      }

      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || "Xatolik yuz berdi");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteUsefulLink(deleteTarget.id).unwrap();

      toast.success("Link o‘chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "O‘chirishda xatolik");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await updateUsefulLink({
        id: item.id,
        is_active: !item.is_active,
      }).unwrap();

      toast.success(
        item.is_active ? "Link nofaol qilindi" : "Link faol qilindi",
      );
    } catch (err) {
      toast.error(err?.data?.message || "Holatni o‘zgartirib bo‘lmadi");
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

      <div className="mb-5">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);

            setPage(1);
          }}
          placeholder="Link qidirish..."
        />
      </div>
      {isLoading ? (
        <div
          className="
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-3
        "
        >
          {Array.from({
            length: 6,
          }).map((_, i) => (
            <div
              key={i}
              className="
                  h-44
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
            bg-red-50
            px-6
            py-12
            text-center
            text-red-600
          "
        >
          Linklarni yuklashda xatolik.
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
          <LinkIcon className="mx-auto mb-3 text-slate-300" size={32} />

          <p className="text-sm text-slate-500">Linklar mavjud emas.</p>
        </div>
      ) : (
        <div
          className={`
            grid
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
                    gap-3
                  "
              >
                <div
                  className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-700
                    "
                >
                  <LinkIcon size={22} />
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  className={`
    rounded-full
    px-3
    py-1
    text-xs
    font-medium

    ${
      item.is_active
        ? "bg-green-100 text-green-700"
        : "bg-slate-100 text-slate-500"
    }
  `}
                >
                  {item.is_active ? "Faol" : "Nofaol"}
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

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    truncate
                    text-sm
                    text-blue-700
                    hover:underline
                  "
              >
                {item.url}

                <ExternalLink size={14} />
              </a>
              <span>{item.icon}</span>

              <div
                className="
                    mt-5
                    flex
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
                      hover:bg-slate-50
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
                value={form[`title_${lang.key}`] || ""}
                onChange={(e) =>
                  changeField(`title_${lang.key}`, e.target.value)
                }
              />
            </div>
          ))}

          <FormField
            label="URL"
            value={form.url}
            onChange={(e) => changeField("url", e.target.value)}
          />

          <FormField
            label="Icon"
            value={form.icon}
            onChange={(e) => changeField("icon", e.target.value)}
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
        title="Linkni o‘chirish"
        description={`
          "${deleteTarget?.title_latin || ""}"
          linkini o‘chirmoqchimisiz?
        `}
      />
    </div>
  );
}
