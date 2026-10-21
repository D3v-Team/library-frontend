import { useState } from "react";
import toast from "react-hot-toast";

import { Mail, MessageCircle, Phone } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";
import AdminEmptyState from "./components/AdminEmptyState";
import { AdminErrorState, RowActions, TableSkeleton } from "./components/AdminUI";

import {
  useGetContactMessagesQuery,
  useGetContactMessageByIdQuery,
  useDeleteContactMessageMutation,
} from "../../store/services/message.js";
import apiError from "../../lib/apiError";

export default function ContactMessages() {
  // ================= FILTER =================

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  // ================= LIST =================

  // Barcha xabarlar. `is_read` filtri YUBORILMAYDI — backend uni qo'llab
  // quvvatlamaydi (so'rov xato qaytaradi), Swaggerda esa ko'rsatilgan.
  const { data, isLoading, error, isFetching, refetch } = useGetContactMessagesQuery({
    page,
    limit: 20,
    search,
  });

  const [deleteContactMessage, { isLoading: isDeleting }] =
    useDeleteContactMessageMutation();

  // ================= DATA =================

  const messages = data?.data ?? [];

  const totalPages = data?.meta?.totalPages ?? 1;

  // ================= DETAIL MODAL =================

  const [selectedMessage, setSelectedMessage] = useState(null);

  const { data: messageDetail, isLoading: isDetailLoading } =
    useGetContactMessageByIdQuery(selectedMessage?.id, {
      skip: !selectedMessage,
    });

  // ================= DELETE =================

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ================= HANDLERS =================

  const openDetail = (item) => {
    setSelectedMessage(item);
  };

  const closeDetail = () => {
    setSelectedMessage(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteContactMessage(deleteTarget.id).unwrap();

      toast.success("Xabar o‘chirildi");

      setDeleteTarget(null);
    } catch (error) {
      toast.error(apiError(error, "Xabarni o‘chirishda xatolik"));
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    const today = new Date();
    // Bugungi xabar — faqat vaqt, qolganlari — sana (pochta qutisidagidek)
    return d.toDateString() === today.toDateString()
      ? d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString("ru-RU");
  };
  return (
    <div>
      <AdminPageHeader
        title="Xabarlar"
        description="Foydalanuvchilardan kelgan murojaatlarni boshqaring."
      />

      <div
        className="
          mb-6
        "
      >
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Xabar qidirish..."
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={3} />
      ) : error ? (
        <AdminErrorState title="Xabarlarni yuklashda xatolik yuz berdi" onRetry={refetch} />
      ) : messages.length === 0 ? (
        <AdminEmptyState
          title={search ? "Qidiruv bo‘yicha xabar topilmadi" : "Hozircha xabar yo‘q"}
          icon={MessageCircle}
        />
      ) : (
        /* Pochta qutisi: har xabar — bitta qator. Ilgari 3 ustunli
           kartochkalar edi va o'qilmagan xabarni ajratib bo'lmasdi. */
        <ul
          className={`divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-opacity ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          {messages.map((item) => (
            <li key={item.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDetail(item);
                    }
                  }}
                  className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {item.full_name || "Ismsiz"}
                      </p>
                      <span className="hidden shrink-0 truncate text-xs text-slate-400 sm:inline">
                        {item.phone || item.email || ""}
                      </span>
                    </div>
                    <p className="truncate text-sm text-slate-500">{item.message || "—"}</p>
                  </div>

                  <span className="shrink-0 text-xs text-slate-400 tabular-nums">
                    {formatDate(item.created_at)}
                  </span>

                  <RowActions onDelete={() => setDeleteTarget(item)} />
                </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={data?.meta?.total} disabled={isFetching} />

      <Modal
        open={Boolean(selectedMessage)}
        onClose={closeDetail}
        title="Xabar tafsilotlari"
        size="md"
      >
        {/* Ro'yxatdagi ma'lumot darhol ko'rinadi, detail so'rovi kelgach yangilanadi */}
        {(() => {
          const m = messageDetail ?? selectedMessage ?? {};
          return (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{m.full_name || "Ismsiz"}</p>
                  <p className="text-xs text-slate-400">
                    {m.created_at ? new Date(m.created_at).toLocaleString("ru-RU") : ""}
                    {isDetailLoading && " · yuklanmoqda…"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {m.phone && (
                  <a
                    href={`tel:${m.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Phone size={14} />
                    {m.phone}
                  </a>
                )}
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Mail size={14} />
                    {m.email}
                  </a>
                )}
              </div>

              <p className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {m.message || "—"}
              </p>
            </div>
          );
        })()}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Xabarni o‘chirish"
        description="
          Ushbu xabarni o‘chirmoqchimisiz?
        "
      />
    </div>
  );
}
