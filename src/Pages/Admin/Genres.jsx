import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../Admin/components/Modal";
import FormField from "../Admin/components/FormField";
import ConfirmDialog from "../Admin/components/ConfirmDialog";
import Pagination from "../Admin/components/Pagination";

import {
  useGetGenresQuery,
  useCreateGenreMutation,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} from "../../store/services/genres";
import AdminPageHeader from "./components/AdminPageHeader";
import AdminEmptyState from "./components/AdminEmptyState";
import { SearchInput } from "./components/ListControls";
import { AdminErrorState, AdminTable, RowActions, TableSkeleton } from "./components/AdminUI";
import apiError from "../../lib/apiError";

export default function Genres() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const limit = 20;

  const { data, isLoading, isFetching, error, refetch } = useGetGenresQuery({
    page,
    limit,
    search,
  });

  const [createGenre, { isLoading: createLoading }] = useCreateGenreMutation();

  const [updateGenre, { isLoading: updateLoading }] = useUpdateGenreMutation();

  const [deleteGenre, { isLoading: deleteLoading }] = useDeleteGenreMutation();

  const genres = data?.data || [];

  const meta = data?.meta || {};

  const [modalOpen, setModalOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState(null);

  const [form, setForm] = useState({
    name_latin: "",
    name_cyril: "",
    name_ru: "",
  });

  const [errors, setErrors] = useState({});

  const openCreate = () => {
    setSelectedGenre(null);

    setForm({
      name_latin: "",
      name_cyril: "",
      name_ru: "",
    });

    setErrors({});

    setModalOpen(true);
  };

  const openEdit = (genre) => {
    setSelectedGenre(genre);

    setForm({
      name_latin: genre.name_latin || "",

      name_cyril: genre.name_cyril || "",

      name_ru: genre.name_ru || "",
    });

    setErrors({});

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);

    setSelectedGenre(null);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    const error = {};

    if (!form.name_latin.trim()) {
      error.name_latin = "Lotin nomi majburiy";
    }

    if (!form.name_cyril.trim()) {
      error.name_cyril = "Kirill nomi majburiy";
    }

    if (!form.name_ru.trim()) {
      error.name_ru = "Rus nomi majburiy";
    }

    setErrors(error);

    return Object.keys(error).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (selectedGenre) {
        await updateGenre({
          id: selectedGenre.id,
          data: form,
        }).unwrap();
      } else {
        await createGenre(form).unwrap();
      }

      closeModal();
    } catch (error) {
      toast.error(apiError(error, "Saqlashda xatolik yuz berdi"));
    }
  };

  const openDelete = (genre) => {
    setSelectedGenre(genre);

    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedGenre) return;

    try {
      await deleteGenre(selectedGenre.id).unwrap();

      setDeleteOpen(false);

      setSelectedGenre(null);
    } catch (error) {
      toast.error(apiError(error, "O'chirishda xatolik yuz berdi"));
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <section className="space-y-6">
      {/* HEADER */}

   <AdminPageHeader
  title="Janrlar"
  description="Kitob janrlarini boshqarish"
  actionLabel="Janr qo'shish"
  onAction={openCreate}
/>
      <SearchInput value={search} onChange={setSearch} placeholder="Janr qidirish..." />

      {/* Jadval: janr — uch tildagi nom, boshqa hech narsa. Ilgari h-56
          kartochkalar edi va har qayta yuklanishda (isFetching) kontent
          skeletonga almashib, sahifa sakrardi. */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : error ? (
        <AdminErrorState title="Janrlarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : genres.length === 0 ? (
        <AdminEmptyState title={search ? "Qidiruv bo‘yicha janr topilmadi" : "Janrlar topilmadi"} icon={BookOpen} />
      ) : (
        <AdminTable
          rows={genres}
          isFetching={isFetching}
          onRowClick={openEdit}
          columns={[
            {
              key: "latin",
              header: "Lotin",
              cell: (g) => (
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{g.name_latin || "—"}</p>
                  {/* Mobil: qolgan tillar shu yerda */}
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {[g.name_cyril, g.name_ru].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ),
            },
            { key: "cyril", header: "Kirill", hideBelow: "md", cell: (g) => g.name_cyril || <span className="text-slate-300">—</span> },
            { key: "ru", header: "Rus", hideBelow: "md", cell: (g) => g.name_ru || <span className="text-slate-300">—</span> },
            {
              key: "actions",
              header: <span className="sr-only">Amallar</span>,
              align: "right",
              cell: (g) => <RowActions onEdit={() => openEdit(g)} onDelete={() => openDelete(g)} />,
            },
          ]}
        />
      )}

      {/* PAGINATION */}

      {meta.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onChange={setPage}
          total={meta.total}
          disabled={isFetching}
        />
      )}

      {/* CREATE / EDIT MODAL */}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={selectedGenre ? "Janrni tahrirlash" : "Yangi janr qo'shish"}
        description="
        Kitob janri ma'lumotlarini kiriting
        "
      >
        <div className="space-y-4">
          <FormField
            label="Lotin nomi"
            required
            name="name_latin"
            value={form.name_latin}
            onChange={handleChange}
            error={errors.name_latin}
          />

          <FormField
            label="Kirill nomi"
            required
            name="name_cyril"
            value={form.name_cyril}
            onChange={handleChange}
            error={errors.name_cyril}
          />

          <FormField
            label="Rus nomi"
            required
            name="name_ru"
            value={form.name_ru}
            onChange={handleChange}
            error={errors.name_ru}
          />

          <div
            className="
            flex
            justify-end
            gap-3
            pt-4
            "
          >
            <button
              type="button"
              onClick={closeModal}
              className="
              rounded-lg
              border
              border-slate-200
              px-4
              py-2.5
              text-sm
              text-slate-600
              hover:bg-slate-50
              "
            >
              Bekor qilish
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={createLoading || updateLoading}
              className="
              rounded-lg
              border
              px-5
              py-2.5
              text-sm
              font-medium
              text-black
              transition
        hover:bg-slate-50
              disabled:opacity-50
              "
            >
              {createLoading || updateLoading
                ? "Saqlanmoqda..."
                : selectedGenre
                  ? "Yangilash"
                  : "Saqlash"}
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRM */}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        description={`${selectedGenre?.name_latin || ""}
          janrini o'chirmoqchimisiz?`}
      />
    </section>
  );
}
