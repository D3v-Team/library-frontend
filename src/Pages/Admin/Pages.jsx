// src/pages/admin/Pages.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, FileText } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import { SearchInput } from "./components/ListControls";

import {
  useGetPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} from "../../store/services/pages";

const LANGS = [
  { key: "latin", label: "Lotin" },
  { key: "cyril", label: "Kirill" },
  { key: "ru", label: "Rus" },
];

// Slug variantlari
const SLUG_OPTIONS = [
  { value: "ABOUT", label: "About (Biz haqimizda)" },
  { value: "PRIVACY_POLICY", label: "Privacy Policy (Maxfiylik siyosati)" },
  // { value: "TERMS_OF_SERVICE", label: "Terms of Service (Foydalanish shartlari)" },
  { value: "FAQ", label: "FAQ (Ko'p so'raladigan savollar)" },
  // { value: "RULES", label: "Rules (Qoidalar)" },
  // { value: "CONTACTS", label: "Contacts (Aloqa)" },
];

const emptyForm = {
  slug: "",
  title_latin: "",
  title_cyril: "",
  title_ru: "",
  content_latin: "",
  content_cyril: "",
  content_ru: "",
};

export default function Pages() {
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState("latin");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useGetPagesQuery();

  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();

  const pages = data ?? [];
  const isSaving = isCreating || isUpdating;

  // Filter by search (client-side)
  const filteredPages = pages.filter((p) =>
    p.slug?.toLowerCase().includes(search.toLowerCase()) ||
    p.title_latin?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingPage(null);
    setForm(emptyForm);
    setActiveLang("latin");
    setModalOpen(true);
  };

  const openEdit = (page) => {
    setEditingPage(page);
    setForm({ ...emptyForm, ...page });
    setActiveLang("latin");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPage(null);
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // Validation
    if (!form.slug.trim()) {
      toast.error("Slug tanlang yoki kiriting");
      return;
    }
    if (!form.title_latin.trim()) {
      toast.error("Lotincha sarlavha kiritish majburiy");
      return;
    }
    if (!form.content_latin.trim()) {
      toast.error("Lotincha kontent kiritish majburiy");
      return;
    }

    try {
      if (editingPage) {
        await updatePage({ id: editingPage.id, data: form }).unwrap();
        toast.success("Sahifa yangilandi");
      } else {
        await createPage(form).unwrap();
        toast.success("Sahifa yaratildi");
      }
      closeModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Saqlashda xatolik yuz berdi");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePage(deleteTarget.id).unwrap();
      toast.success("Sahifa o'chirildi");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "O'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Sahifalar"
        description="Saytning statik sahifalarini boshqaring (About, Privacy, FAQ va boshqalar)."
        actionLabel="Sahifa qo'shish"
        onAction={openCreate}
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Slug yoki sarlavha bo'yicha qidirish..."
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-blue-700" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
          Sahifalarni yuklashda xatolik yuz berdi.
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <FileText className="mx-auto mb-3 text-slate-300" size={28} />
          <p className="text-sm text-slate-500">
            {search ? "Hech narsa topilmadi." : "Hozircha sahifalar mavjud emas."}
          </p>
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {page.title_latin || "Nomsiz"}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="font-mono">slug: {page.slug}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {page.title_cyril ? "Kirill" : ""} 
                      {page.title_ru ? (page.title_cyril ? " • Rus" : "Rus") : ""}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(page)}
                  aria-label="Tahrirlash"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(page)}
                  aria-label="O'chirish"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingPage ? "Sahifani tahrirlash" : "Yangi sahifa"}
        description="Slug tanlang va 3 tilda sarlavha hamda kontent kiriting."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slug Select */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Slug (qisqa nom) *
            </label>
            <select
              value={form.slug}
              onChange={(e) => handleFieldChange("slug", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              <option value="">Slug tanlang...</option>
              {SLUG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Agar ro'yxatda bo'lmasa, o'zingiz yozib qo'shishingiz mumkin.
            </p>
          </div>

          {/* Language tabs */}
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {LANGS.map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setActiveLang(lang.key)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  activeLang === lang.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
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
                label={`Sarlavha (${lang.label})`}
                required={lang.key === "latin"}
                value={form[`title_${lang.key}`]}
                onChange={(e) => handleFieldChange(`title_${lang.key}`, e.target.value)}
              />
              <FormField
                as="textarea"
                rows={6}
                label={`Kontent (${lang.label})`}
                required={lang.key === "latin"}
                value={form[`content_${lang.key}`]}
                onChange={(e) => handleFieldChange(`content_${lang.key}`, e.target.value)}
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg border  px-5 py-2.5 text-sm font-medium text-black hover:bg-slate-50 disabled:opacity-50"
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
        title="Sahifani o'chirish"
        description={`"${deleteTarget?.title_latin || ""}" sahifasini o'chirmoqchimisiz?`}
      />
    </div>
  );
}