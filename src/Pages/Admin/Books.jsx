import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, FileSpreadsheet } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import MultiSelect from "./components/MultiSelect";
import Pagination from "./components/Pagination";
import { SearchInput, FilterSelect } from "./components/ListControls";
import AdminEmptyState from "./components/AdminEmptyState";
import { AdminErrorState, AdminTable, RowActions, TableSkeleton } from "./components/AdminUI";
import ExcelImportModal from "./components/ExcelImportModal";

import {
  required,
  minLength,
  isValidYear,
  validateForm,
} from "./utils/validators";

import {
  useGetBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
} from "../../store/services/books.api";

import { AuthorPicker } from "../../patterns";
import { useGetGenresQuery } from "../../store/services/genres";
import { formatBookYear, getBookGenreIds, getBookGenreLabel, isExcelBook } from "../Books/bookHelpers";

import { BASE_URL } from "../../store/api";
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

  // Nashr yili majburiyligi faqat YARATISHDA (handleSubmit ga qarang)
  {
    field: "published_date",
    validators: [isValidYear],
  },
];

// UpdateBookDto maydonlari — faqat shular yuboriladi. Ilgari `...book`
// dan tuzilgan butun obyekt ketardi: id, images, files, genres, author,
// created_at... Backend ortiqchani tashlamasa, bog'lanishlar buzilardi.
const BOOK_TEXT_FIELDS = [
  "name_latin", "name_cyril", "name_ru",
  "description_latin", "description_cyril", "description_ru",
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

  const [excelOpen, setExcelOpen] = useState(false);

  const navigate = useNavigate();

  const { data, isLoading, isFetching, error, refetch } = useGetBooksQuery({
    page,

    limit: 20,

    search,

    author_id: authorFilter,

    genre_id: genreFilter,

    grade_level: gradeFilter,
  });

  /* Mualliflar ro'yxati sahifa ochilganda OLINMAYDI: ular 2 000 dan ko'p,
     backend esa limit ni 100 ga qirqadi — ilgari faqat birinchi 100 tasini
     tanlash mumkin edi. AuthorPicker ro'yxat ochilganda 25 tadan, qidiruv
     va cheksiz scroll bilan oladi. */

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

  const genreOptions = (genresData?.data ?? []).map((g) => ({
    value: g.id,
    label: g.name_latin || g.name,
  }));

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

      /* `book.genres` — bu BOG'LANISH qatorlari massivi:
           { id: <bog'lanish id>, bookId, genreId: <haqiqiy janr id>, genre: {...} }
         Ilgari bu yerdan `g.id` olinardi, ya'ni bog'lanish qatorining
         ID'si — backend bunday janrni topa olmay 404 qaytarardi:
         "Belgilangan janrlardan ba'zilari topilmadi".
         Yaratishda xato chiqmasdi, chunki u yerda ID ro'yxatdan tanlanadi. */
      genreIds: getBookGenreIds(book),

      // Excel kitoblarida tavsif null — boshqariladigan maydonlar uchun ""
      ...Object.fromEntries(BOOK_TEXT_FIELDS.map((f) => [f, book[f] ?? ""])),

      // Formada faqat yil: "1962-01-01T00:00:00.000Z" -> "1962"
      published_date: formatBookYear(book.published_date) ?? "",
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

    // Excel importidagi kitoblarda yil yo'q — tahrirlashda talab qilinmaydi
    if (!editing && !form.published_date) {
      validationErrors.published_date = "Nashr yili to‘ldirilishi shart";
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);

      toast.error("Formada xatolar bor");

      return;
    }

    const payload = {
      ...Object.fromEntries(
        BOOK_TEXT_FIELDS.filter((f) => form[f] != null).map((f) => [f, form[f]]),
      ),

      author_id: form.author_id,

      // UpdateBookDto da majburiy
      genreIds: form.genreIds ?? [],

      grade_level: form.grade_level ? Number(form.grade_level) : undefined,

      // Formada maydoni yo'q — mavjud qiymat saqlanadi (Excel importi beradi)
      quantity: form.quantity != null ? Number(form.quantity) : undefined,

      // Backend sana kutadi — faqat yil kiritiladi, oy va kun 1-yanvar.
      // Yil bo'sh bo'lsa (Excel kitobi) umuman yuborilmaydi — ilgari
      // "-01-01" ketardi.
      published_date: form.published_date ? `${form.published_date}-01-01` : undefined,
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
      toast.error(apiError(err, "Saqlashda xatolik"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteBook(deleteTarget.id).unwrap();

      toast.success("Kitob o‘chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O‘chirishda xatolik"));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Kitoblar"
        description="Kutubxona fondidagi kitoblarni boshqaring."
        actionLabel="Kitob qo‘shish"
        onAction={openCreate}
        extraActions={
          <button
            type="button"
            onClick={() => setExcelOpen(true)}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800 shadow-sm transition-all duration-200 hover:border-green-300 hover:bg-green-100 active:scale-[0.98]"
          >
            <FileSpreadsheet size={16} strokeWidth={2} />
            Excel yuklash
          </button>
        }
      />

      <ExcelImportModal open={excelOpen} onClose={() => setExcelOpen(false)} />

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

        <AuthorPicker
          variant="admin"
          className="w-56"
          value={authorFilter ?? ""}
          onChange={(id) => {
            setAuthorFilter(id || undefined);
            setPage(1);
          }}
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

      {/* Jadval — minglab kitob (Excel importi) uchun. Ilgari kartochkalar edi,
          skeleton esa mavjud bo'lmagan `h-42` klassi tufayli umuman ko'rinmasdi. */}
      {isLoading ? (
        <TableSkeleton rows={10} cols={6} thumb />
      ) : error ? (
        <AdminErrorState title="Kitoblarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : books.length === 0 ? (
        <AdminEmptyState title="Kitoblar topilmadi" icon={BookOpen} />
      ) : (
        <AdminTable
          rows={books}
          isFetching={isFetching}
          onRowClick={(book) => navigate(`/admin/books/${book.id}`)}
          columns={[
            {
              key: "book",
              header: "Kitob",
              cell: (book) => {
                const cover = getMainImage(book);
                const genres = (book.genres ?? []).map(getBookGenreLabel).filter(Boolean);
                return (
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-300">
                      {cover ? (
                        <img src={getImageUrl(cover)} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <BookOpen size={16} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-medium text-slate-900">{book.name_latin || "Nomsiz"}</p>
                      <p className="truncate text-xs text-slate-500">
                        {book.author?.full_name_latin || book.author_name || "Muallif ko‘rsatilmagan"}
                      </p>
                      {/* Mobil: janr shu yerda */}
                      {genres.length > 0 && (
                        <p className="truncate text-xs text-slate-400 lg:hidden">{genres.join(", ")}</p>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              key: "genres",
              header: "Janr",
              hideBelow: "lg",
              cell: (book) => {
                const genres = (book.genres ?? []).map(getBookGenreLabel).filter(Boolean);
                return genres.length ? (
                  <div className="flex max-w-[14rem] flex-wrap gap-1">
                    {genres.map((g) => (
                      <span key={g} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{g}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-300">—</span>
                );
              },
            },
            {
              key: "quantity",
              header: "Nusxa",
              hideBelow: "sm",
              align: "right",
              className: "tabular-nums",
              cell: (book) => book.quantity ?? "—",
            },
            {
              key: "year",
              header: "Yil",
              hideBelow: "md",
              className: "tabular-nums text-slate-500",
              cell: (book) => formatBookYear(book.published_date) || <span className="text-slate-300">—</span>,
            },
            {
              key: "grade",
              header: "Sinf",
              hideBelow: "lg",
              className: "tabular-nums text-slate-500",
              cell: (book) => book.grade_level || <span className="text-slate-300">—</span>,
            },
            {
              key: "source",
              header: "Manba",
              hideBelow: "md",
              cell: (book) =>
                isExcelBook(book) ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <FileSpreadsheet size={12} />
                    Excel
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Qo‘lda</span>
                ),
            },
            {
              key: "actions",
              header: <span className="sr-only">Amallar</span>,
              align: "right",
              cell: (book) => (
                <RowActions
                  onView={() => navigate(`/admin/books/${book.id}`)}
                  viewLabel="Rasmlar va fayllar"
                  onEdit={() => openEdit(book)}
                  onDelete={() => setDeleteTarget(book)}
                />
              ),
            },
          ]}
        />
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={data?.meta?.total} disabled={isFetching} />

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
            <div>
              <label
                htmlFor="book-author"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Muallif<span className="text-red-500"> *</span>
              </label>
              <AuthorPicker
                id="book-author"
                variant="admin"
                allowAll={false}
                emptyLabel="Muallifni tanlang"
                value={form.author_id}
                selected={editing?.author}
                invalid={Boolean(errors.author_id)}
                onChange={(id) => handleFieldChange("author_id", id)}
              />
              {errors.author_id && (
                <p className="mt-1.5 text-xs text-red-600">{errors.author_id}</p>
              )}
            </div>

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

          {/* NASHR YILI — oy va kun kerak emas */}

          <FormField
            label="Nashr yili"
            required
            inputMode="numeric"
            maxLength={4}
            placeholder="Masalan: 1926"
            value={form.published_date}
            onChange={(e) =>
              handleFieldChange("published_date", e.target.value.replace(/\D/g, "").slice(0, 4))
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
