// src/pages/admin/Requests.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
  User,
  CalendarDays,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Send,
} from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import FormField from "./components/FormField";
import Pagination from "./components/Pagination";
import { SearchInput, FilterSelect } from "./components/ListControls";

import {
  useGetOnlineRequestsQuery,
  useGetOnlineRequestByIdQuery,
  useUpdateOnlineRequestMutation,
  useDeleteOnlineRequestMutation,
} from "../../store/services/requests";

// ================= CONSTANTS =================
const REQUEST_TYPES = [
//   { value: "", label: "Barcha turlar" },
  { value: "BOOK_ORDER", label: "Kitobga buyurtma" },
  { value: "INQUIRY", label: "So'rov" },
  { value: "QUESTION_ANSWER", label: "Savol-javob" },
  { value: "VIRTUAL_REFERENCE", label: "Virtual ma'lumotnoma" },
];

const REQUEST_STATUSES = [
  { value: "", label: "Barcha holatlar" },
  { value: "NEW", label: "Yangi" },
  { value: "IN_PROGRESS", label: "Jarayonda" },
  { value: "ANSWERED", label: "Javob berilgan" },
  { value: "DONE", label: "Bajarilgan" },
];

const STATUS_STYLES = {
  NEW: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    icon: Clock,
  },
  IN_PROGRESS: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    icon: Clock,
  },
  ANSWERED: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    icon: CheckCircle,
  },
  DONE: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-500",
    icon: CheckCircle,
  },
};

const TYPE_LABELS = {
  BOOK_ORDER: "Kitobga buyurtma",
  INQUIRY: "So'rov",
  QUESTION_ANSWER: "Savol-javob",
  VIRTUAL_REFERENCE: "Virtual ma'lumotnoma",
};

const TYPE_ICONS = {
  BOOK_ORDER: User,
  INQUIRY: MessageSquare,
  QUESTION_ANSWER: MessageSquare,
  VIRTUAL_REFERENCE: Mail,
};

// ================= MAIN COMPONENT =================
export default function Requests() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [answerForm, setAnswerForm] = useState({
    answer: "",
    status: "NEW",
  });

  // ================= API HOOKS =================
  const { data, isLoading, isFetching, error, refetch } =
    useGetOnlineRequestsQuery({
      page,
      limit: 10,
      search,
      type: typeFilter || undefined,
      status: statusFilter || undefined,
    });

  const { data: requestDetail } = useGetOnlineRequestByIdQuery(
    selectedRequest?.id,
    { skip: !selectedRequest }
  );

  const [updateRequest, { isLoading: isUpdating }] =
    useUpdateOnlineRequestMutation();
  const [deleteRequest, { isLoading: isDeleting }] =
    useDeleteOnlineRequestMutation();

  // ================= DERIVED DATA =================
  const requests = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  // ================= HANDLERS =================
  const openDetail = (request) => {
    setSelectedRequest(request);
    setAnswerForm({
      answer: request?.answer || "",
      status: request?.status || "NEW",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
    setAnswerForm({ answer: "", status: "NEW" });
  };

  const handleStatusChange = (status) => {
    setAnswerForm((prev) => ({ ...prev, status }));
  };

  const handleAnswerChange = (e) => {
    setAnswerForm((prev) => ({ ...prev, answer: e.target.value }));
  };

  const handleUpdate = async () => {
    if (!selectedRequest) return;

    try {
      await updateRequest({
        id: selectedRequest.id,
        data: {
          answer: answerForm.answer,
          status: answerForm.status,
        },
      }).unwrap();

      toast.success("Murojaat yangilandi");
      closeModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Yangilashda xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteRequest(deleteTarget.id).unwrap();
      toast.success("Murojaat o'chirildi");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "O'chirishda xatolik yuz berdi");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ================= RENDER =================
  return (
    <div>
      <AdminPageHeader
        title="Murojaatlar"
        description="Online murojaatlarni boshqaring."
        actionLabel={null}
      />

      {/* FILTERS */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Murojaat qidirish..."
        />

        <div className="flex gap-2">
          {/* <FilterSelect
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
            options={REQUEST_TYPES}
            placeholder="Barcha turlar"
            className="w-40"
          /> */}

          <FilterSelect
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={REQUEST_STATUSES}
            placeholder="Barcha holatlar"
            className="w-40"
          />
        </div>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-slate-200 bg-blue-700"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
          Murojaatlarni yuklashda xatolik yuz berdi.
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Mail className="mx-auto mb-3 text-slate-300" size={28} />
          <p className="text-sm text-slate-500">
            {search || typeFilter || statusFilter
              ? "Hech narsa topilmadi."
              : "Hozircha murojaatlar mavjud emas."}
          </p>
        </div>
      ) : (
        <div
          className={`space-y-3 transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {requests.map((request) => {
            const StatusIcon = STATUS_STYLES[request.status]?.icon || Clock;
            const TypeIcon = TYPE_ICONS[request.type] || Mail;

            return (
              <div
                key={request.id}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  {/* LEFT */}
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <TypeIcon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {request.full_name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[request.status]?.bg} ${STATUS_STYLES[request.status]?.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[request.status]?.dot}`}
                          />
                          {REQUEST_STATUSES.find(
                            (s) => s.value === request.status
                          )?.label || request.status}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {request.phone || "-"}
                        </span>
                        {request.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {request.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {formatDate(request.created_at)}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {request.message || "Xabar kiritilmagan"}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openDetail(request)}
                      aria-label="Ko'rish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(request)}
                      aria-label="O'chirish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* ================= DETAIL MODAL ================= */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Murojaat tafsilotlari"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* REQUEST INFO */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Ism-familiya</p>
                <p className="text-sm font-medium text-slate-900">
                  {selectedRequest.full_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Turi</p>
                <p className="text-sm font-medium text-slate-900">
                  {TYPE_LABELS[selectedRequest.type] || selectedRequest.type}
                </p>
              </div>
              {selectedRequest.phone && (
                <div>
                  <p className="text-xs text-slate-400">Telefon</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedRequest.phone}
                  </p>
                </div>
              )}
              {selectedRequest.email && (
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedRequest.email}
                  </p>
                </div>
              )}
              {selectedRequest.book_id && (
                <div>
                  <p className="text-xs text-slate-400">Kitob Nomi</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedRequest.book.name_latin}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400">Yuborilgan sana</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(selectedRequest.created_at)}
                </p>
              </div>
            </div>

            {/* MESSAGE */}
            {selectedRequest.message && (
              <div>
                <p className="text-xs text-slate-400">Xabar</p>
                <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {selectedRequest.message}
                </p>
              </div>
            )}

            {/* ANSWER SECTION */}
            <div className="border-t border-slate-200 pt-4">
             

              <div className="space-y-4">
               

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Holat
                  </label>
                  <select
                    value={answerForm.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
                  >
                    {REQUEST_STATUSES.filter((s) => s.value !== "").map(
                      (status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={isUpdating}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium text-black hover:bg-slate-50 disabled:opacity-50"
              >

                {isUpdating ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= DELETE CONFIRM ================= */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Murojaatni o'chirish"
        description={`"${deleteTarget?.full_name || ""}" murojaatini o'chirmoqchimisiz?`}
      />
    </div>
  );
}