import { useState } from "react";
import toast from "react-hot-toast";

import {
  Pencil,
  Trash2,
  Search,
  Users,
  X,
  Phone,
  Mail,
  CalendarDays,
} from "lucide-react";

import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "../../store/services/departament";

import AdminPageHeader from "./components/AdminPageHeader";

const emptyForm = {
  full_name_latin: "",
  full_name_cyril: "",
  full_name_ru: "",

  position_latin: "",
  position_cyril: "",
  position_ru: "",

  position_order: 0,

  phone: "",
  email: "",
  fax: "",

  reception_days: "",

  is_active: true,
};

export default function Departament() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const { data, isLoading, isFetching, error } = useGetDepartmentsQuery({
    page,

    limit: 10,

    search,



    sortOrder: "desc",
  });

  const [createDepartment, { isLoading: isCreating }] =
    useCreateDepartmentMutation();

  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();

  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDepartmentMutation();

  const departments = data?.data ?? [];

  const totalPages = data?.meta?.totalPages ?? 1;

  const isSaving = isCreating || isUpdating;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...emptyForm,
    });

    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);

    setForm({
      ...emptyForm,

      ...item,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);

    setEditing(null);

    setForm({
      ...emptyForm,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    if (!form.full_name_latin.trim()) {
      toast.error("Ism kiritilishi kerak");

      return;
    }

    try {
      if (editing) {
        const changedData = {};

        Object.keys(form).forEach((key) => {
          if (form[key] !== editing[key]) {
            changedData[key] = form[key];
          }
        });

        await updateDepartment({
          id: editing.id,

          data: changedData,
        }).unwrap();

        toast.success("Xodim yangilandi");
      } else {
        await createDepartment(form).unwrap();

        toast.success("Xodim qo‘shildi");
      }

      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDepartment(deleteTarget.id).unwrap();

      toast.success("Xodim o‘chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "O‘chirishda xatolik");
    }
  };

  const toggleStatus = async (item) => {
    try {
      await updateDepartment({
        id: item.id,

        data: {
          is_active: !item.is_active,
        },
      }).unwrap();

      toast.success("Status yangilandi");
    } catch (err) {
      toast.error(err?.data?.message || "Statusni o‘zgartirishda xatolik");
    }
  };
  return (
    <div>
      <AdminPageHeader
        title="Departament xodimlari"
        description="Tashkilot bo‘lim xodimlarini boshqarish."
        actionLabel="Qo‘shish"
        onAction={openCreate}
      />

      {/* SEARCH */}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={17}
            className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Xodim qidirish..."
            className="
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            py-2.5
            pl-10
            pr-4
            text-sm
            text-slate-800
            outline-none
            focus:border-slate-400
          "
          />
        </div>
      </div>

      {/* LOADING */}

      {isLoading && (
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
      )}

      {/* ERROR */}

      {error && (
        <div
          className="
          rounded-xl
          bg-red-50
          px-5
          py-10
          text-center
          text-sm
          text-red-600
        "
        >
          Ma'lumotlarni yuklashda xatolik
        </div>
      )}

      {/* EMPTY */}

      {!isLoading && !error && departments.length === 0 && (
        <div
          className="
          rounded-2xl
          border
          border-dashed
          border-slate-300
          bg-white
          py-16
          text-center
        "
        >
          <Users
            size={36}
            className="
            mx-auto
            text-slate-300
          "
          />

          <p
            className="
            mt-3
            text-sm
            text-slate-500
          "
          >
            Xodimlar topilmadi
          </p>
        </div>
      )}

      {/* CARDS */}

      {!isLoading && !error && departments.length > 0 && (
        <div
          className="
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-3
        "
        >
          {departments.map((item) => (
            <div
              key={item.id}
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >
                <div>
                  <h3
                    className="
                      text-base
                      font-semibold
                      text-slate-900
                    "
                  >
                    {item.full_name_latin}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    {item.position_latin || "-"}
                  </p>
                </div>

                <button
                  onClick={() => toggleStatus(item)}
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium

                    ${
                      item.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }
                  `}
                >
                  {item.is_active ? "Faol" : "Nofaol"}
                </button>
              </div>

              <div
                className="
                  mt-5
                  space-y-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-sm
                    text-slate-600
                  "
                >
                  <Phone size={16} className="text-slate-400" />

                  {item.phone || "-"}
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-sm
                    text-slate-600
                  "
                >
                  <Mail size={16} className="text-slate-400" />

                  {item.email || "-"}
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-sm
                    text-slate-600
                  "
                >
                  <CalendarDays size={16} className="text-slate-400" />

                  {item.reception_days || "-"}
                </div>
              </div>

              <div
                className="
                  mt-5
                  flex
                  gap-2
                  border-t
                  border-slate-100
                  pt-4
                "
              >
                <button
                  onClick={() => openEdit(item)}
                  className="
                    flex-1
                    rounded-lg
                    border
                    border-slate-200
                    py-2
                    text-sm
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  <span
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    <Pencil size={15} />
                    Tahrirlash
                  </span>
                </button>

                <button
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
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}

      <div
        className="
        mt-8
        flex
        items-center
        justify-between
      "
      >
        <p
          className="
          text-sm
          text-slate-500
        "
        >
          Sahifa {page} / {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="
            rounded-lg
            border
            px-4
            py-2
            text-sm
            disabled:opacity-40
          "
          >
            Oldingi
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="
            rounded-lg
            border
            px-4
            py-2
            text-sm
            disabled:opacity-40
          "
          >
            Keyingi
          </button>
        </div>
      </div>
      {/* CREATE / UPDATE MODAL */}

      {modalOpen && (
        <div
          className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      px-4
    "
        >
          <div
            className="
        w-full
        max-w-3xl
        rounded-2xl
        bg-white
        p-6
        shadow-xl
      "
          >
            <div
              className="
          mb-6
          flex
          items-center
          justify-between
        "
            >
              <h2
                className="
            text-lg
            font-semibold
            text-slate-900
          "
              >
                {editing ? "Xodimni tahrirlash" : "Yangi xodim"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="
            text-slate-400
            hover:text-slate-700
          "
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="
          grid
          gap-4
          sm:grid-cols-2
        "
            >
              {[
                ["full_name_latin", "F.I.SH (Lotin)", "text"],
                ["full_name_cyril", "F.I.SH (Kirill)", "text"],
                ["full_name_ru", "F.I.SH (Rus)", "text"],

                ["position_latin", "Lavozim", "text"],
                ["position_cyril", "Lavozim Kirill", "text"],
                ["position_ru", "Lavozim Rus", "text"],

                ["phone", "Telefon", "tel"],
                ["email", "Email", "email"],
                ["fax", "Fax", "text"],
                ["reception_days", "Qabul kunlari", "text"],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label
                    className="
                mb-1.5
                block
                text-sm
                font-medium
                text-slate-700
              "
                  >
                    {label}
                  </label>

                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="
                w-full
                rounded-lg
                border
                border-slate-200
                px-3
                py-2.5
                text-sm
                text-slate-800
                outline-none
                focus:border-slate-400
              "
                  />
                </div>
              ))}

              <div>
                <label
                  className="
              mb-1.5
              block
              text-sm
              font-medium
              text-slate-700
            "
                >
                  Tartib raqami
                </label>

                <input
                  type="number"
                  value={form.position_order}
                  onChange={(e) =>
                    handleChange("position_order", Number(e.target.value))
                  }
                  className="
              w-full
              rounded-lg
              border
              border-slate-200
              px-3
              py-2.5
              text-sm
              text-slate-800
            "
                />
              </div>

              <label
                className="
            mt-7
            flex
            items-center
            gap-3
            text-sm
            text-slate-700
          "
              >
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleChange("is_active", e.target.checked)}
                />
                Faol
              </label>

              <div
                className="
            col-span-full
            mt-5
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
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {deleteTarget && (
        <div
          className="
 fixed
 inset-0
 z-50
 flex
 items-center
 justify-center
 bg-black/40
 px-4
 "
        >
          <div
            className="
 max-w-md
 w-full
 rounded-2xl
 bg-white
 p-6
 "
          >
            <h3
              className="
text-lg
font-semibold
text-slate-900
"
            >
              O‘chirish
            </h3>

            <p
              className="
mt-3
text-sm
text-slate-500
"
            >
              {deleteTarget.full_name_latin}
              o‘chirilsinmi?
            </p>

            <div
              className="
mt-6
flex
justify-end
gap-3
"
            >
              <button
                onClick={() => setDeleteTarget(null)}
                className="
rounded-lg
border
border-slate-200
px-4
py-2
text-sm
"
              >
                Bekor
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="
rounded-lg
bg-red-600
px-4
py-2
text-sm
text-white
disabled:opacity-50
"
              >
                {isDeleting ? "O‘chirilmoqda..." : "O‘chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
