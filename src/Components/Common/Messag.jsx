import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useCreateContactMessageMutation } from "../../store/services/message";
import { Button, Dialog, Field, Input, Textarea } from "../../ui";

/**
 * Online murojaat.
 *
 * Yangi tizimga o'tkazildi. Ilgari bu modal o'z `fixed inset-0` div i
 * bilan qurilgan edi va uch kamchiligi bor edi:
 *
 *   · label lar umuman yo'q — faqat placeholder, ya'ni yozuv
 *     boshlanishi bilan maydon nima uchun ekani yo'qolardi va ekran
 *     o'qish dasturi uni umuman aytmasdi
 *   · xatolar faqat toast da chiqardi — qaysi maydon xato ekani
 *     ko'rinmasdi
 *   · fokus tuzoqqa olinmasdi, Esc ishlamasdi, bir zumda ochilib
 *     bir zumda yopilardi
 *
 * Endi hammasi `Dialog` va `Field` dan keladi.
 */
const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  message: "",
};

export default function Message({ open, onOpen, onClose }) {
  const { t } = useTranslation();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const [createContactMessage, { isLoading }] = useCreateContactMessageMutation();

  // Modal har ochilganda toza holatdan boshlanadi
  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
    setErrors({});
  }, [open]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = t("message.errors.name");
    if (!form.email.trim()) next.email = t("message.errors.email");
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = t("bookOrder.errors.emailInvalid");
    if (!form.message.trim()) next.message = t("message.errors.message");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createContactMessage(form).unwrap();
      toast.success(t("message.success"));
      onClose?.();
    } catch (error) {
      toast.error(error?.data?.message || t("message.errors.general"));
    }
  };

  return (
    <>
      {/* Suzuvchi tugma — BackToTop `bottom-20` da, bu `bottom-6` da */}
      <button
        type="button"
        onClick={() => onOpen?.()}
        aria-label={t("message.buttonLabel")}
        title={t("message.buttonLabel")}
        className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink bg-ink text-gold shadow-s2 transition-colors duration-1 ease-out-soft hover:border-gold hover:bg-gold hover:text-ink-deep"
      >
        <MessageCircle size={21} strokeWidth={1.9} />
      </button>

      <Dialog
        open={open}
        onClose={onClose}
        title={t("message.title")}
        description={t("message.description")}
        icon={<MessageCircle size={17} strokeWidth={1.9} />}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button variant="ghost" onClick={onClose}>
              {t("bookOrder.cancel")}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="contact-message-form"
              loading={isLoading}
              iconEnd={<Send size={15} />}
            >
              {isLoading ? t("message.sending") : t("message.send")}
            </Button>
          </div>
        }
      >
        <form id="contact-message-form" onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <Field label={t("message.placeholders.name")} required error={errors.full_name}>
            {(a) => (
              <Input
                {...a}
                value={form.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                invalid={!!errors.full_name}
                autoComplete="name"
              />
            )}
          </Field>

          <Field label={t("message.placeholders.phone")}>
            {(a) => (
              <Input
                {...a}
                type="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                autoComplete="tel"
                placeholder="+998"
              />
            )}
          </Field>

          <Field
            label={t("message.placeholders.email")}
            required
            error={errors.email}
            className="sm:col-span-2"
          >
            {(a) => (
              <Input
                {...a}
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                invalid={!!errors.email}
                autoComplete="email"
              />
            )}
          </Field>

          <Field
            label={t("message.placeholders.message")}
            required
            error={errors.message}
            className="sm:col-span-2"
          >
            {(a) => (
              <Textarea
                {...a}
                rows={5}
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                invalid={!!errors.message}
              />
            )}
          </Field>
        </form>
      </Dialog>
    </>
  );
}
