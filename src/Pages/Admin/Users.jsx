import { useState } from "react";
import toast from "react-hot-toast";
import { Users } from "lucide-react";

import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../store/services/users";

import AdminPageHeader from "./components/AdminPageHeader";
import AdminEmptyState from "./components/AdminEmptyState";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";
import { AdminErrorState, AdminTable, RowActions, StatusToggle, TableSkeleton } from "./components/AdminUI";
import apiError from "../../lib/apiError";
import FormField from "./components/FormField";
import {
  isValidEmail,
  isValidPhone,
  minLength,
  required,
  validateForm,
} from "./utils/validators";

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

  // Kirish ruxsatini o'chirish (bloklash) — tasdiq bilan; ilgari bir
  // bosishda darhol ketardi
  const [blockTarget, setBlockTarget] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useGetUsersQuery({
    page,
    limit: 20,
    search,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = data?.data ?? [];

  const totalPages = data?.meta?.totalPages ?? 1;

  const isSaving = isCreating || isUpdating;

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,

      [field]: value,
    }));

    // Foydalanuvchi tuzatishni boshlashi bilan xato yo'qoladi
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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

    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    /* Bu sahifada validatsiya UMUMAN yo'q edi: bo'sh ism, bo'sh pochta
       va bo'sh parol bilan ham so'rov to'g'ridan-to'g'ri serverga
       ketardi. Backend 400 qaytarardi, lekin foydalanuvchi qaysi
       maydon xato ekanini bilmasdi.

       Parol faqat YARATISHDA majburiy: tahrirlashda bo'sh qoldirilsa
       "o'zgartirmayman" degani (pastdagi changedData shu mantiqda). */
    const schema = [
      { field: "full_name", validators: [(v) => required(v, "F.I.SH")] },
      {
        field: "phone_number",
        validators: [(v) => required(v, "Telefon raqam"), isValidPhone],
      },
      {
        field: "email",
        validators: [(v) => required(v, "Elektron pochta"), isValidEmail],
      },
    ];

    if (!editing) {
      schema.push({
        field: "password",
        validators: [(v) => required(v, "Parol"), (v) => minLength(v, 6, "Parol")],
      });
    }

    const nextErrors = validateForm(form, schema);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Formada xatolar bor, tekshirib chiqing");
      return;
    }

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
      toast.error(apiError(err, "Xatolik yuz berdi"));
    }
  };

  const toggleStatus = async (item) => {
    setPendingId(item.id);
    try {
      await updateUser({
        id: item.id,

        data: {
          is_login: !item.is_login,
        },
      }).unwrap();

      toast.success("Status yangilandi");
    } catch (err) {
      toast.error(apiError(err, "Statusni o'zgartirishda xatolik"));
    } finally {
      setPendingId(null);
      setBlockTarget(null);
    }
  };

  // Ruxsat berish — darhol; bloklash — avval tasdiq
  const requestToggle = (item) => {
    if (item.is_login) setBlockTarget(item);
    else toggleStatus(item);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteUser(deleteTarget.id).unwrap();

      toast.success("Foydalanuvchi o'chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O'chirishda xatolik"));
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

      <div className="mb-5">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Ism, telefon yoki pochta bo‘yicha..."
        />
      </div>

      {/* Jadval — o'nlab yozuv, matnli ma'lumot (ilgari balandligi 256 px li
          kartochkalar, o'z modali va o'z paginatsiyasi bilan edi) */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : error ? (
        <AdminErrorState title="Foydalanuvchilarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : users.length === 0 ? (
        <AdminEmptyState title={search ? "Qidiruv bo‘yicha topilmadi" : "Foydalanuvchilar yo‘q"} icon={Users} />
      ) : (
        <AdminTable
          rows={users}
          isFetching={isFetching}
          onRowClick={openEdit}
          columns={[
            {
              key: "name",
              header: "F.I.SH",
              cell: (u) => (
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{u.full_name || "—"}</p>
                  {/* Mobil: aloqa shu yerda */}
                  <p className="truncate text-xs text-slate-400 md:hidden">{u.phone_number}</p>
                </div>
              ),
            },
            {
              key: "phone",
              header: "Telefon",
              hideBelow: "md",
              className: "whitespace-nowrap tabular-nums",
              cell: (u) => u.phone_number || <span className="text-slate-300">—</span>,
            },
            {
              key: "email",
              header: "Pochta",
              hideBelow: "xl",
              cell: (u) => u.email || <span className="text-slate-300">—</span>,
            },
            {
              key: "role",
              header: "Rol",
              hideBelow: "sm",
              cell: (u) => (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {u.role || "—"}
                </span>
              ),
            },
            {
              key: "login",
              header: "Kirish",
              cell: (u) => (
                <StatusToggle
                  checked={u.is_login}
                  onLabel="Ruxsat"
                  offLabel="Bloklangan"
                  pending={pendingId === u.id}
                  onChange={() => requestToggle(u)}
                />
              ),
            },
            {
              key: "actions",
              header: <span className="sr-only">Amallar</span>,
              align: "right",
              cell: (u) => <RowActions onEdit={() => openEdit(u)} onDelete={() => setDeleteTarget(u)} />,
            },
          ]}
        />
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={data?.meta?.total} disabled={isFetching} />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Adminni tahrirlash" : "Yangi admin"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="F.I.SH"
            required
            error={errors.full_name}
            value={form.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
          />

          <FormField
            label="Telefon"
            required
            type="tel"
            placeholder="+998901234567"
            error={errors.phone_number}
            value={form.phone_number}
            onChange={(e) => handleChange("phone_number", e.target.value)}
          />

          <FormField
            label="Elektron pochta"
            required
            type="email"
            placeholder="nom@domen.uz"
            error={errors.email}
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          {/* Parol faqat yaratishda: tahrirlashda bo'sh qoldirilsa o'zgartirilmaydi */}
          {!editing && (
            <FormField
              label="Parol"
              required
              type="password"
              autoComplete="new-password"
              error={errors.password}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          )}

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_login}
              onChange={(e) => handleChange("is_login", e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Admin panelga kirishga ruxsat
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(blockTarget)}
        onClose={() => setBlockTarget(null)}
        onConfirm={() => toggleStatus(blockTarget)}
        isLoading={Boolean(blockTarget) && pendingId === blockTarget?.id}
        title="Kirishni bloklash"
        description={`"${blockTarget?.full_name || ""}" admin panelga kira olmaydi. Davom etasizmi?`}
        confirmLabel="Ha, bloklash"
        pendingLabel="Bloklanmoqda..."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Foydalanuvchini o‘chirish"
        description={`"${deleteTarget?.full_name || ""}" butunlay o‘chiriladi.`}
      />
    </div>
  );
}
