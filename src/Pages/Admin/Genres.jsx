import { useEffect, useState } from "react";
import { Pencil, Trash2, Search, BookOpen } from "lucide-react";
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

export default function Genres() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const limit = 8;

  const { data, isLoading, isFetching, error } = useGetGenresQuery({
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
      toast.error(error?.data?.message || "Saqlashda xatolik yuz berdi");
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
      toast.error(error?.data?.message || "O'chirishda xatolik yuz berdi");
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
      {/* SEARCH */}

      <div
        className="
        flex
        items-center
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        "
      >
        <Search size={17} className="text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Janr qidirish..."
          className="
          h-11
          w-full
          px-3
          text-sm
          outline-none
          "
        />
      </div>

      {/* CARDS */}

      <div
        className="
        grid
        gap-5
        sm:grid-cols-2
        xl:grid-cols-3
        "
      >
        {isLoading || isFetching ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="
              h-56
              rounded-2xl
              bg-slate-100
              animate-pulse
              "
            />
          ))
        ) : error ? (
          <div
            className="
            col-span-full
            rounded-xl
            bg-red-50
            px-6
            py-10
            text-center
            text-sm
            text-red-600
            "
          >
            Janrlarni yuklashda xatolik yuz berdi.
          </div>
        ) : genres.length === 0 ? (
          <div
            className="
            col-span-full
            rounded-xl
            border
            border-dashed
            border-slate-300
            py-16
            text-center
            text-sm
            text-slate-500
            "
          >
            Janr topilmadi
          </div>
        ) : (
          genres.map((genre) => (
            <div
              key={genre.id}
              className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              transition
              hover:-translate-y-1
              hover:shadow-md
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
                  text-slate-700
                  "
                >
                  <BookOpen size={20} />
                </div>

                <div
                  className="
                  flex
                  gap-2
                  "
                >
                  <button
                    onClick={() => openEdit(genre)}
                    className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-500
                    hover:bg-slate-100
                    "
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => openDelete(genre)}
                    className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-red-500
                    hover:bg-red-50
                    "
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-5">
                <h3
                  className="
                  text-lg
                  font-semibold
                  text-slate-900
                  "
                >
                  {genre.name_latin}
                </h3>

                <div
                  className="
                  mt-4
                  space-y-2
                  text-sm
                  "
                >
                  <div
                    className="
                    flex
                    justify-between
                    rounded-lg
                    bg-slate-50
                    px-3
                    py-2
                    "
                  >
                    <span className="text-slate-500">Kirill</span>

                    <span
                      className="
                      font-medium
                      text-slate-700
                      "
                    >
                      {genre.name_cyril}
                    </span>
                  </div>

                  <div
                    className="
                    flex
                    justify-between
                    rounded-lg
                    bg-slate-50
                    px-3
                    py-2
                    "
                  >
                    <span className="text-slate-500">Rus</span>

                    <span
                      className="
                      font-medium
                      text-slate-700
                      "
                    >
                      {genre.name_ru}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}

      {meta.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onChange={setPage}
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
              bg-slate-900
              px-5
              py-2.5
              text-sm
              font-medium
              text-black
              transition
              hover:bg-slate-800
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
