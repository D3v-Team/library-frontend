import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2, BookOpen, Eye } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import MultiSelect from "./components/MultiSelect";
import Pagination from "./components/Pagination";
import { SearchInput, FilterSelect } from "./components/ListControls";

import {
  required,
  minLength,
  isValidDate,
  validateForm,
} from "./utils/validators";

import {
  useGetBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
} from "../../store/services/books.api";

import { useGetAuthorsQuery } from "../../store/services/avtors.api";
import { useGetGenresQuery } from "../../store/services/genres";

import { BASE_URL } from "../../store/api";

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

const GRADE_LEVELS = Array.from({ length: 11 }, (_, i) => i + 1);

const emptyForm = {
  name_latin: "",
  name_cyril: "",
  name_ru: "",

  description_latin: "",
  description_cyril: "",
  description_ru: "",

  author_id: "",
  published_date: "",
  grade_level: "",
  genreIds: [],
};

const formSchema = [
  {
    field: "name_latin",
    validators: [(v) => required(v, "Nomi"), (v) => minLength(v, 2, "Nomi")],
  },

  {
    field: "author_id",
    validators: [(v) => required(v, "Muallif")],
  },

  {
    field: "published_date",
    validators: [(v) => required(v, "Nashr sanasi"), isValidDate],
  },
];

export default function Books() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [authorFilter, setAuthorFilter] = useState();

  const [genreFilter, setGenreFilter] = useState();

  const [gradeFilter, setGradeFilter] = useState();

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [errors, setErrors] = useState({});

  const [activeLang, setActiveLang] = useState("latin");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, error } = useGetBooksQuery({
    page,

    limit: 10,

    search,

    author_id: authorFilter,

    genre_id: genreFilter,

    grade_level: gradeFilter,
  });

  const { data: authorsData } = useGetAuthorsQuery({
    page: 1,
    limit: 100,
  });

  const { data: genresData } = useGetGenresQuery({
    page: 1,
    limit: 100,
  });

  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();

  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();

  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation();

  const books = data?.data ?? [];

  const totalPages = data?.meta?.totalPages ?? 1;

  const isSaving = isCreating || isUpdating;

  const authorOptions = (authorsData?.data ?? []).map((a) => ({
    value: a.id,
    label: a.full_name_latin,
  }));

  const genreOptions = (genresData?.data ?? []).map((g) => ({
    value: g.id,
    label: g.name_latin || g.name,
  }));

  const authorNameById = (id) =>
    authorsData?.data?.find((a) => a.id === id)?.full_name_latin || "—";

  const getImageUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http")) return url;

    return `${BASE_URL}${url}`;
  };

  const getMainImage = (book) => {
    return book.images?.find((img) => img.is_main)?.url;
  };

  const openCreate = () => {
    setEditing(null);

    setForm(emptyForm);

    setErrors({});

    setActiveLang("latin");

    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditing(book);

    setForm({
      ...emptyForm,

      ...book,

      genreIds: book.genres?.map((g) => g.id) ?? [],
    });

    setErrors({});

    setActiveLang("latin");

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

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);

      toast.error("Formada xatolar bor");

      return;
    }

    const payload = {
      ...form,

      grade_level: form.grade_level ? Number(form.grade_level) : undefined,
    };

    try {
      if (editing) {
        await updateBook({
          id: editing.id,
          data: payload,
        }).unwrap();

        toast.success("Kitob yangilandi");
      } else {
        await createBook(payload).unwrap();

        toast.success("Kitob qo‘shildi");
      }

      setModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Saqlashda xatolik");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteBook(deleteTarget.id).unwrap();

      toast.success("Kitob o‘chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "O‘chirishda xatolik");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Kitoblar"
        description="Kutubxona fondidagi kitoblarni boshqaring."
        actionLabel="Kitob qo‘shish"
        onAction={openCreate}
      />

      {/* FILTER */}

      <div
        className="
mb-6
flex
flex-wrap
gap-3
"
      >
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);

            setPage(1);
          }}
          placeholder="Kitob qidirish..."
        />

        <FilterSelect
          value={authorFilter}
          onChange={(v) => {
            setAuthorFilter(v);

            setPage(1);
          }}
          options={authorOptions}
          placeholder="Barcha mualliflar"
        />

        <FilterSelect
          value={genreFilter}
          onChange={(v) => {
            setGenreFilter(v);

            setPage(1);
          }}
          options={genreOptions}
          placeholder="Barcha janrlar"
        />

        <FilterSelect
          value={gradeFilter}
          onChange={(v) => {
            setGradeFilter(v);

            setPage(1);
          }}
          options={GRADE_LEVELS.map((g) => ({
            value: g,

            label: `${g}-sinf`,
          }))}
          placeholder="Barcha sinflar"
        />
      </div>

      {/* CARD LIST */}

      <div
        className="
rounded-2xl
border
border-slate-200
bg-white
p-5
shadow-sm
"
      >
        {isLoading ? (
          <div
            className="
grid
grid-cols-2
gap-5
sm:grid-cols-3
lg:grid-cols-4
"
          >
            {Array.from({
              length: 8,
            }).map((_, i) => (
              <div
                key={i}
                className="
h-42
animate-pulse
rounded-xl
bg-blue-700
"
              />
            ))}
          </div>
        ) : error ? (
          <div
            className="
py-14
text-center
text-sm
text-red-600
"
          >
            Kitoblarni yuklashda xatolik yuz berdi.
          </div>
        ) : books.length === 0 ? (
          <div
            className="
py-16
text-center
text-sm
text-slate-500
"
          >
            Kitob topilmadi.
          </div>
        ) : (
          <div
            className={`
grid
grid-cols-1
gap-5
sm:grid-cols-2
xl:grid-cols-3

${isFetching ? "opacity-60" : "opacity-100"}

`}
          >
            {books.map((book) => (
              <article
                key={book.id}
                className="
group
rounded-xl
border
border-slate-200
bg-white
p-4
transition
hover:-translate-y-1
hover:shadow-lg
"
              >
                <div
                  className="
flex
gap-4
"
                >
                  {/* IMAGE */}

                  <div
                    className="
h-36
w-24
shrink-0
overflow-hidden
rounded-lg
bg-slate-100
"
                  >
                    {getMainImage(book) ? (
                      <img
                        src={getImageUrl(getMainImage(book))}
                        alt={book.name_latin}
                        className="
h-full
w-full
object-cover
"
                      />
                    ) : (
                      <div
                        className="
flex
h-full
items-center
justify-center
text-slate-300
"
                      >
                        <BookOpen size={28} />
                      </div>
                    )}
                  </div>

                  <div
                    className="
min-w-0
flex-1
"
                  >
                    <h3
                      className="
line-clamp-2
text-base
font-semibold
text-slate-900
"
                    >
                      {book.name_latin}
                    </h3>

                    <p
                      className="
mt-1
line-clamp-1
text-sm
text-slate-500
"
                    >
                      {book.author?.full_name_latin ||
                        authorNameById(book.author_id)}
                    </p>

                    <div
                      className="
mt-3
flex
flex-wrap
gap-1
"
                    >
                      {(book.genres ?? []).map((g) => (
                        <span
                          key={g.id}
                          className="
rounded-full
bg-slate-100
px-2
py-1
text-xs
text-slate-600
"
                        >
                          {g.name_latin || g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="
mt-5
flex
items-center
justify-between
border-t
border-slate-100
pt-4
"
                >
                  <div
                    className="
text-xs
text-slate-500
"
                  >
                    <p>
                      Sana:
                      <span
                        className="
ml-1
font-medium
text-slate-700
"
                      >
                        {book.published_date?.slice(0, 10) || "—"}
                      </span>
                    </p>

                    <p className="mt-1">
                      Sinf:
                      <span
                        className="
ml-1
font-medium
text-slate-700
"
                      >
                        {book.grade_level || "—"}
                      </span>
                    </p>
                  </div>

                  <div
                    className="
flex
gap-1
"
                  >
                    <Link
                      to={`/admin/books/${book.id}`}
                      className="
flex
h-8
w-8
items-center
justify-center
rounded-lg
text-slate-500
hover:bg-slate-100
"
                    >
                      <Eye size={15} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => openEdit(book)}
                      className="
flex
h-8
w-8
items-center
justify-center
rounded-lg
text-slate-500
hover:bg-slate-100
"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(book)}
                      className="
flex
h-8
w-8
items-center
justify-center
rounded-lg
text-red-500
hover:bg-red-50
"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* MODAL DAVOMI 3-QISMDA */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Kitobni tahrirlash" : "Yangi kitob qo‘shish"}
        size="lg"
      >
        <form
          onSubmit={handleSubmit}
          className="
            space-y-6
          "
        >
          {/* LANGUAGE */}

          <div
            className="
              flex
              gap-1
              rounded-xl
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
                  rounded-lg
                  py-2
                  text-sm
                  font-medium
                  transition

                  ${
                    activeLang === lang.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }

                `}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* LANG CONTENT */}

          {LANGS.map((lang) => (
            <div
              key={lang.key}
              className={activeLang === lang.key ? "space-y-4" : "hidden"}
            >
              <FormField
                label={`Nomi (${lang.label})`}
                required={lang.key === "latin"}
                value={form[`name_${lang.key}`]}
                onChange={(e) =>
                  handleFieldChange(`name_${lang.key}`, e.target.value)
                }
                error={lang.key === "latin" ? errors.name_latin : undefined}
                placeholder="Kitob nomi"
              />

              <FormField
                as="textarea"
                rows={4}
                label={`Tavsif (${lang.label})`}
                value={form[`description_${lang.key}`]}
                onChange={(e) =>
                  handleFieldChange(`description_${lang.key}`, e.target.value)
                }
                placeholder="Kitob haqida qisqacha"
              />
            </div>
          ))}

          {/* AUTHOR + GRADE */}

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
            "
          >
            <FormField
              as="select"
              label="Muallif"
              required
              value={form.author_id}
              onChange={(e) => handleFieldChange("author_id", e.target.value)}
              error={errors.author_id}
            >
              <option value="">Muallifni tanlang</option>

              {authorOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FormField>

            <FormField
              as="select"
              label="Sinf darajasi"
              value={form.grade_level}
              onChange={(e) => handleFieldChange("grade_level", e.target.value)}
            >
              <option value="">Tanlanmagan</option>

              {GRADE_LEVELS.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}-sinf
                </option>
              ))}
            </FormField>
          </div>

          {/* DATE */}

          <FormField
            type="date"
            label="Nashr sanasi"
            required
            value={form.published_date}
            onChange={(e) =>
              handleFieldChange("published_date", e.target.value)
            }
            error={errors.published_date}
          />

          {/* GENRES */}

          <MultiSelect
            label="Janrlar"
            options={genreOptions}
            value={form.genreIds}
            onChange={(value) => handleFieldChange("genreIds", value)}
            emptyText="
              Janr mavjud emas
            "
          />

          {/* ACTIONS */}

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
              disabled={isSaving}
              className="
                rounded-lg
                border
                border-slate-200
                bg-white
                px-5
                py-2.5
                text-sm
                font-medium
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:opacity-50
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
                text-white
                transition
                hover:bg-slate-800
                disabled:opacity-50
              "
            >
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>

          {editing && (
            <p
              className="
                  text-center
                  text-xs
                  text-slate-400
                "
            >
              Rasm va fayllarni boshqarish uchun{" "}
              <Link
                to={`/admin/books/${editing.id}`}
                className="
                    underline
                    hover:text-slate-700
                  "
              >
                kitob sahifasiga
              </Link>{" "}
              o‘ting.
            </p>
          )}
        </form>
      </Modal>

      {/* DELETE CONFIRM */}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Kitobni o‘chirish"
        description={`
          "${deleteTarget?.name_latin || ""}"
          kitobini o‘chirmoqchimisiz?
          Bu amalni ortga qaytarib bo‘lmaydi.
          `}
      />
    </div>
  );
}
