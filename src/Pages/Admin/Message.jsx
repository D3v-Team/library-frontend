import { useState } from "react";
import toast from "react-hot-toast";

import { Mail, Phone, User, Eye, Trash2, MessageCircle } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import ConfirmDialog from "./components/ConfirmDialog";
import Pagination from "./components/Pagination";
import { SearchInput } from "./components/ListControls";

import {
  useGetContactMessagesQuery,
  useGetContactMessageByIdQuery,
  useDeleteContactMessageMutation,
} from "../../store/services/message.js";

export default function ContactMessages() {
  // ================= FILTER =================

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  // ================= LIST =================

  const { data, isLoading, error, isFetching } = useGetContactMessagesQuery({
    page,

    limit: 10,

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
      toast.error(error?.data?.message || "Xabarni o‘chirishda xatolik");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("uz-UZ");
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
                h-56
                animate-pulse
                rounded-2xl
                bg-slate-100
              "
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="
            rounded-2xl
            bg-red-50
            px-6
            py-12
            text-center
            text-sm
            text-red-600
          "
        >
          Xabarlarni yuklashda xatolik.
        </div>
      ) : messages.length === 0 ? (
        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-slate-300
            bg-white
            px-6
            py-16
            text-center
          "
        >
          <MessageCircle
            size={34}
            className="
              mx-auto
              mb-3
              text-slate-300
            "
          />

          <p
            className="
              text-sm
              text-slate-500
            "
          >
            Xabarlar mavjud emas.
          </p>
        </div>
      ) : (
        <div
          className={`
            grid
            gap-5
            md:grid-cols-2
            xl:grid-cols-3

            ${isFetching ? "opacity-60" : ""}
          `}
        >
          {messages.map((item) => (
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
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
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
                    <User size={20} />
                  </div>

                  <div>
                    <h3
                      className="
                        text-sm
                        font-semibold
                        text-slate-900
                      "
                    >
                      {item.full_name || "-"}
                    </h3>

                    <p
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
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
                  <Mail size={16} />

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
                  <Phone size={16} />

                  {item.phone || "-"}
                </div>

                <p
                  className="
                    line-clamp-3
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  {item.message || "-"}
                </p>
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
                  type="button"
                  onClick={() => openDetail(item)}
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-200
                    py-2
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  <Eye size={15} />
                  Ko‘rish
                </button>

                <button
                  type="button"
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
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal
        open={Boolean(selectedMessage)}
        onClose={closeDetail}
        title="Xabar tafsilotlari"
        size="md"
      >
        {isDetailLoading ? (
          <div
            className="
              h-40
              animate-pulse
              rounded-xl
              bg-slate-100
            "
          />
        ) : (
          <div
            className="
              space-y-4
            "
          >
            <div>
              <p className="text-xs text-slate-400">Ism</p>

              <p className="text-sm font-medium text-slate-900">
                {messageDetail?.full_name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Email</p>

              <p className="text-sm font-medium text-slate-900">
                {messageDetail?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Telefon</p>

              <p className="text-sm font-medium text-slate-900">
                {messageDetail?.phone || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Xabar</p>

              <p className="mt-1 text-sm leading-6 text-slate-700">
                {messageDetail?.message || "-"}
              </p>
            </div>
          </div>
        )}
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
