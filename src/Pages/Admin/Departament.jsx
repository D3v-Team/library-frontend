import { useState } from "react";
import toast from "react-hot-toast";
import { Phone, Users } from "lucide-react";

import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useRemoveDepartmentPhotoMutation,
} from "../../store/services/departament";

import AdminPageHeader from "./components/AdminPageHeader";
import AdminEmptyState from "./components/AdminEmptyState";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";
import {
  AdminErrorState,
  CardGridSkeleton,
  LangDots,
  RowActions,
  StatusToggle,
} from "./components/AdminUI";
import apiError from "../../lib/apiError";
import ImageUploadField from "./components/ImageUploadField";
import { BASE_URL } from "../../store/api";

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

  // Swagger: multipart, `member_photo` (binary). Faqat yangi File
  // tanlanganda yuboriladi — toFormData shu mantiqni bajaradi.
  member_photo: null,
};

// UpdateDepartmentDto maydonlari (member_photo alohida ko'rib chiqiladi)
const DTO_FIELDS = Object.keys(emptyForm).filter((f) => f !== "member_photo");

const LANGS = [
  { key: "latin", label: "Lotin" },
  { key: "cyril", label: "Kirill" },
  { key: "ru", label: "Rus" },
];

/* Faqat DTO maydonlari; null lar boshqariladigan maydonlar uchun "" */
const toDeptForm = (item) => ({
  ...Object.fromEntries(DTO_FIELDS.map((f) => [f, item?.[f] ?? emptyForm[f]])),
  member_photo: null,
});

const photoUrl = (path) =>
  path ? `${BASE_URL}${String(path).startsWith("/") ? "" : "/"}${path}` : null;

export default function Departament() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [activeLang, setActiveLang] = useState("latin");
  const [pendingId, setPendingId] = useState(null);

  // Rahbariyat tartibi saytdagidek — position_order bo'yicha (tekshirilgan:
  // backend sortBy=position_order ni qabul qiladi)
  const { data, isLoading, isFetching, error, refetch } = useGetDepartmentsQuery({
    page,
    limit: 24,
    search,
    sortBy: "position_order",
    sortOrder: "asc",
  });

  const [createDepartment, { isLoading: isCreating }] =
    useCreateDepartmentMutation();

  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();

  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDepartmentMutation();

  const [removeDepartmentPhoto] = useRemoveDepartmentPhotoMutation();

  // Admin mavjud suratni o'chirmoqchi bo'lsa — saqlashda alohida
  // endpointga so'rov ketadi (DELETE /departments/:id/remove-photo)
  const [photoRemoved, setPhotoRemoved] = useState(false);

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

    setPhotoRemoved(false);
    setActiveLang("latin");

    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);

    // Faqat DTO maydonlari (id, created_at formaga tushmaydi);
    // serverdagi surat yo'li File deb yuborilmaydi
    setForm(toDeptForm(item));

    setPhotoRemoved(false);
    setActiveLang("latin");

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);

    setEditing(null);

    setForm({
      ...emptyForm,
    });

    setPhotoRemoved(false);
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
        // Faqat o'zgargan DTO maydonlari
        const initial = toDeptForm(editing);
        const changedData = {};

        DTO_FIELDS.forEach((key) => {
          if (form[key] !== initial[key]) {
            changedData[key] = key === "position_order" ? Number(form[key]) || 0 : form[key];
          }
        });
        if (form.member_photo instanceof File) changedData.member_photo = form.member_photo;

        /* Surat alohida ko'rib chiqiladi. `member_photo` faqat yangi
           File tanlanganda yuboriladi — aks holda mavjud surat o'chib
           ketardi (toFormData shu qoidani bajaradi, bu yerda esa
           o'zgarmagan holatda uni umuman yubormaymiz). */
        if (!(form.member_photo instanceof File)) {
          delete changedData.member_photo;
        }

        await updateDepartment({
          id: editing.id,

          data: changedData,
        }).unwrap();

        // Admin mavjud suratni o'chirgan bo'lsa — alohida endpoint
        if (photoRemoved && !(form.member_photo instanceof File)) {
          await removeDepartmentPhoto(editing.id).unwrap();
        }

        toast.success("Xodim yangilandi");
      } else {
        await createDepartment({
          ...Object.fromEntries(DTO_FIELDS.map((f) => [f, form[f]])),
          position_order: Number(form.position_order) || 0,
          member_photo: form.member_photo instanceof File ? form.member_photo : undefined,
        }).unwrap();

        toast.success("Xodim qo‘shildi");
      }

      closeModal();
    } catch (err) {
      toast.error(apiError(err, "Xatolik yuz berdi"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDepartment(deleteTarget.id).unwrap();

      toast.success("Xodim o‘chirildi");

      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "O‘chirishda xatolik"));
    }
  };

  const toggleStatus = async (item) => {
    setPendingId(item.id);
    try {
      await updateDepartment({
        id: item.id,

        data: {
          is_active: !item.is_active,
        },
      }).unwrap();

      toast.success("Status yangilandi");
    } catch (err) {
      toast.error(apiError(err, "Statusni o‘zgartirishda xatolik"));
    } finally {
      setPendingId(null);
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

      <div className="mb-5">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Xodim qidirish..."
        />
      </div>

      {/* Xodimlar ro'yxati — kartochkalar, chunki asosiy ma'lumot SURAT.
          Ilgari kartochkada surat ham, tartib raqami ham yo'q edi. */}
      {isLoading ? (
        <CardGridSkeleton
          count={8}
          media="4/5"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        />
      ) : error ? (
        <AdminErrorState title="Xodimlarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : departments.length === 0 ? (
        <AdminEmptyState title={search ? "Qidiruv bo‘yicha xodim topilmadi" : "Xodimlar qo‘shilmagan"} icon={Users} />
      ) : (
        <div
          className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          {departments.map((item) => {
            const photo = photoUrl(item.member_photo);
            const surname = String(item.full_name_latin || "?").trim().charAt(0).toUpperCase();
            return (
              <article
                key={item.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-slate-100">
                  {photo ? (
                    <img
                      src={photo}
                      alt={item.full_name_latin || ""}
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover ${item.is_active ? "" : "opacity-50 grayscale"}`}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-5xl font-semibold text-slate-300">
                      {surname}
                    </span>
                  )}
                  <span
                    className="absolute left-3 top-3 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white"
                    title="Saytdagi tartib raqami"
                  >
                    #{item.position_order ?? "—"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <h3 className="line-clamp-2 min-h-[2.75rem] font-semibold leading-snug text-slate-900">
                    {item.full_name_latin || "Ism kiritilmagan"}
                  </h3>
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-slate-500">
                    {item.position_latin || <span className="italic text-slate-400">Lavozim ko‘rsatilmagan</span>}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <LangDots record={item} field="full_name" />
                    {item.phone && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Phone size={12} />
                        {item.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                  <StatusToggle
                    checked={item.is_active}
                    onLabel="Ko‘rinadi"
                    pending={pendingId === item.id}
                    onChange={() => toggleStatus(item)}
                  />
                  <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={data?.meta?.total} disabled={isFetching} />

      {/* Umumiy Modal: fokus tuzog'i, Esc, ichki scroll. Ilgari o'z `fixed`
          oynasi edi — uzun forma past ekranda scroll qilinmasdi. */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Xodimni tahrirlash" : "Yangi xodim"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <ImageUploadField
            label="Surat"
            value={form.member_photo}
            existingUrl={editing?.member_photo && !photoRemoved ? photoUrl(editing.member_photo) : null}
            onChange={(file) => {
              handleChange("member_photo", file);
              if (file) setPhotoRemoved(false);
            }}
            onRemove={() => {
              handleChange("member_photo", null);
              setPhotoRemoved(true);
            }}
          />

          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {LANGS.map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setActiveLang(lang.key)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  activeLang === lang.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {LANGS.map((lang) => (
            <div key={lang.key} className={activeLang === lang.key ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
              <FormField
                label={`F.I.SH (${lang.label})`}
                required={lang.key === "latin"}
                value={form[`full_name_${lang.key}`]}
                onChange={(e) => handleChange(`full_name_${lang.key}`, e.target.value)}
              />
              <FormField
                label={`Lavozim (${lang.label})`}
                value={form[`position_${lang.key}`]}
                onChange={(e) => handleChange(`position_${lang.key}`, e.target.value)}
              />
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Telefon" type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            <FormField label="Elektron pochta" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            <FormField label="Faks" value={form.fax} onChange={(e) => handleChange("fax", e.target.value)} />
            <FormField
              label="Qabul kunlari"
              placeholder="Dushanba – Juma, 09:00 – 17:00"
              value={form.reception_days}
              onChange={(e) => handleChange("reception_days", e.target.value)}
            />
            <FormField
              label="Tartib raqami"
              type="number"
              min="0"
              value={form.position_order}
              onChange={(e) => handleChange("position_order", e.target.value)}
            />
            <label className="flex items-center gap-3 self-end pb-2.5 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Saytda ko‘rsatish
            </label>
          </div>

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
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Xodimni o‘chirish"
        description={`"${deleteTarget?.full_name_latin || ""}" ro‘yxatdan o‘chiriladi.`}
      />
    </div>
  );
}
