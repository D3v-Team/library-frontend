// src/components/Message.jsx
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useCreateContactMessageMutation } from "../../store/services/message";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  message: "",
};

export default function Message({ open, onOpen, onClose }) {
  const { t } = useTranslation();

  const [form, setForm] = useState(initialForm);

  const [createContactMessage, { isLoading }] =
    useCreateContactMessageMutation();

  const closeModal = () => {
    onClose?.();
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error(t("message.errors.name"));
      return;
    }

    if (!form.email.trim()) {
      toast.error(t("message.errors.email"));
      return;
    }

    if (!form.message.trim()) {
      toast.error(t("message.errors.message"));
      return;
    }

    try {
      await createContactMessage(form).unwrap();
      toast.success(t("message.success"));
      closeModal();
    } catch (error) {
      toast.error(error?.data?.message || t("message.errors.general"));
    }
  };

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        type="button"
        onClick={() => {
          setForm(initialForm);
          onOpen?.();
        }}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg hover:text-white transition hover:bg-slate-800 active:scale-95"
        aria-label={t("message.buttonLabel")}
      >
        <MessageCircle size={22} />
      </button>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {t("message.title")}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder={t("message.placeholders.name")}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t("message.placeholders.email")}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t("message.placeholders.phone")}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t("message.placeholders.message")}
                rows={5}
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg  border py-3 text-sm font-semibold text-black transition  disabled:opacity-50"
              >
                {isLoading ? t("message.sending") : t("message.send")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}