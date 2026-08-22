import { useState } from "react";
import toast from "react-hot-toast";

import {
  Pencil,
  Trash2,
  Search,
  Users,
  Mail,
  Phone,
  X,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../store/services/users";

import AdminPageHeader from "./components/AdminPageHeader";

const emptyForm = {
  phone_number: "",
  email: "",
  full_name: "",
  password: "",
  is_login: true,
};

export default function UsersPage() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, error } = useGetUsersQuery({
    page,

    limit: 10,

    search,

    sortBy: "",

    sortOrder: "desc",
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = data?.data ?? [];

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

    setForm(emptyForm);

    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);

    setForm({
      phone_number: item.phone_number ?? "",

      email: item.email ?? "",

      full_name: item.full_name ?? "",

      password: "",

      is_login: item.is_login,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);

    setEditing(null);

    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    try {
      if (editing) {
        const changedData = {};

        Object.keys(form).forEach((key) => {
          if (form[key] !== (key === "password" ? "" : editing[key])) {
            if (form[key] !== "") {
              changedData[key] = form[key];
            }
          }
        });

        await updateUser({
          id: editing.id,

          data: changedData,
        }).unwrap();

        toast.success("Foydalanuvchi yangilandi");
      } else {
        await createUser(form).unwrap();

        toast.success("Foydalanuvchi yaratildi");
      }

      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || "Xatolik yuz berdi");
    }
  };

  const toggleStatus = async (item) => {
    try {
      await updateUser({
        id: item.id,

        data: {
          is_login: !item.is_login,
        },
      }).unwrap();

      toast.success("Status yangilandi");
    } catch (err) {
      toast.error("Statusni o'zgartirishda xatolik");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteUser(deleteTarget.id).unwrap();

      toast.success("Foydalanuvchi o'chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "O'chirishda xatolik");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Adminlar"
        description="Admin foydalanuvchilarni boshqarish."
        actionLabel="Admin qo‘shish"
        onAction={openCreate}
      />

      {/* SEARCH */}

      <div
        className="
          mb-6
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            relative
            w-full
            max-w-md
          "
        >
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
            placeholder="Foydalanuvchi qidirish..."
            className="
              w-full
              rounded-lg
              border
              border-slate-200
              bg-white
              py-2.5
              pl-10
              pr-3
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
          }).map((_, index) => (
            <div
              key={index}
              className="
                  h-64
                  animate-pulse
                  rounded-2xl
                  bg-slate-100
                "
            />
          ))}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-6
            py-12
            text-center
            text-sm
            text-red-600
          "
        >
          Foydalanuvchilarni yuklashda xatolik.
        </div>
      )}

      {/* EMPTY */}

      {!isLoading && !error && users.length === 0 && (
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
            size={35}
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
            Foydalanuvchilar topilmadi.
          </p>
        </div>
      )}

      {/* USER CARDS */}

      {!isLoading && !error && users.length > 0 && (
        <div
          className="
            grid
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {users.map((item) => (
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
              {/* HEADER */}

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
                    {item.full_name}
                  </h3>

                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-slate-400
                    "
                  >
                    <ShieldCheck size={14} />
                    ADMIN
                  </div>
                </div>

                <button
                  onClick={() => toggleStatus(item)}
                  className={`
                    flex
                    items-center
                    gap-1
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium

                    ${
                      item.is_login
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }

                  `}
                >
                  {item.is_login ? (
                    <>
                      <UserCheck size={13} />
                      Faol
                    </>
                  ) : (
                    <>
                      <UserX size={13} />
                      Nofaol
                    </>
                  )}
                </button>
              </div>

              {/* INFO */}

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

                  {item.phone_number || "-"}
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
              </div>

              {/* ACTIONS */}

              <div
                className="
                  mt-6
                  flex
                  gap-2
                "
              >
                <button
                  onClick={() => openEdit(item)}
                  className="
                    flex
                    h-9
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-200
                    text-sm
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  <Pencil size={15} />
                  Tahrirlash
                </button>

                <button
                  onClick={() => setDeleteTarget(item)}
                  className="
                    flex
                    h-9
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-red-200
                    text-red-500
                    hover:bg-red-50
                  "
                >
                  <Trash2 size={15} />
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

        <div
          className="
            flex
            gap-2
          "
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="
              rounded-lg
              border
              border-slate-200
              px-4
              py-2
              text-sm
              text-slate-600
              disabled:opacity-40
            "
          >
            Oldingi
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="
              rounded-lg
              border
              border-slate-200
              px-4
              py-2
              text-sm
              text-slate-600
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
max-w-xl
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
                {editing ? "Adminni tahrirlash" : "Yangi admin"}
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
space-y-4
"
            >
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
                  F.I.SH
                </label>

                <input
                  value={form.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className="
w-full
rounded-lg
border
border-slate-200
px-3
py-2.5
text-sm
outline-none
focus:border-slate-400
"
                />
              </div>

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
                  Telefon
                </label>

                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  className="
w-full
rounded-lg
border
border-slate-200
px-3
py-2.5
text-sm
outline-none
focus:border-slate-400
"
                />
              </div>

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
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="
w-full
rounded-lg
border
border-slate-200
px-3
py-2.5
text-sm
outline-none
focus:border-slate-400
"
                />
              </div>

              {!editing && (
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
                    Parol
                  </label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="
w-full
rounded-lg
border
border-slate-200
px-3
py-2.5
text-sm
outline-none
focus:border-slate-400
"
                  />
                </div>
              )}

              <label
                className="
flex
items-center
gap-3
text-sm
text-slate-700
"
              >
                <input
                  type="checkbox"
                  checked={form.is_login}
                  onChange={(e) => handleChange("is_login", e.target.checked)}
                />
                Login qilishga ruxsat
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
                  type="submit"
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
w-full
max-w-md
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
              {deleteTarget.full_name}
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
