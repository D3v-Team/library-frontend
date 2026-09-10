import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useCreateOnlineRequestMutation } from "../store/services/requests";
import { useGetBooksQuery } from "../store/services/books.api";
import { useLocalized } from "../lib/useLocalized";
import { Button, Dialog, EmptyState, Field, Input, Skeleton, Textarea } from "../ui";

/**
 * Kitobga buyurtma modali.
 *
 * Header dan ajratib olindi: u yerda 250 qator forma mantiqi
 * navigatsiya bilan bir faylda yashab, Header ni 679 qatorga
 * cho'zgan edi. Buyurtma formasi navigatsiyaning vazifasi emas.
 *
 * Ayni paytda yangi konstruktorga o'tkazildi: Dialog (fokus tuzog'i
 * bilan), Field (label va aria bog'lanishlari bilan), Skeleton va
 * EmptyState. Ilgari modalda label lar umuman yo'q edi — faqat
 * placeholder, ya'ni ekran o'qish dasturi maydon nima uchun ekanini
 * aytmasdi.
 */

const BOOK_LIMIT = 5;

const emptyForm = {
  full_name: "",
  phone: "",
  email: "",
  book_id: "",
  message: "",
};

export default function BookOrderModal({ open, onClose }) {
  const { t } = useTranslation();
  const { pick } = useLocalized();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);

  const [createOnlineRequest, { isLoading }] = useCreateOnlineRequestMutation();

  // Kitoblar faqat modal ochilganda so'raladi
  const { data, isFetching } = useGetBooksQuery(
    { page, limit: BOOK_LIMIT, sortBy: "", sortOrder: "desc" },
    { skip: !open },
  );

  const books = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  // Modal har ochilganda toza holatdan boshlanadi
  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setErrors({});
    setPage(1);
  }, [open]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = t("bookOrder.errors.fullName");
    if (!form.phone.trim()) next.phone = t("bookOrder.errors.phone");
    if (!form.email.trim()) next.email = t("bookOrder.errors.email");
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = t("bookOrder.errors.emailInvalid");
    if (!form.book_id) next.book_id = t("bookOrder.errors.book");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createOnlineRequest({
        type: "BOOK_ORDER",
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        book_id: form.book_id,
        message: form.message || "",
      }).unwrap();

      toast.success(t("bookOrder.success"));
      onClose?.();
    } catch (err) {
      toast.error(err?.data?.message || t("bookOrder.error"));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("header.bookOrder")}
      description={t("bookOrder.description")}
      icon={<BookOpen size={17} strokeWidth={1.9} />}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose}>
            {t("bookOrder.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="book-order-form"
            loading={isLoading}
            iconEnd={<Send size={15} />}
          >
            {isLoading ? t("bookOrder.sending") : t("bookOrder.submit")}
          </Button>
        </div>
      }
    >
      <form id="book-order-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* ---------- Kitob tanlash ---------- */}
        <fieldset className="flex flex-col gap-3">
          <legend className="font-sans text-[0.8rem] font-semibold text-fg">
            {t("bookOrder.chooseBook")}
            <span className="ml-1 text-clay" aria-hidden="true">*</span>
          </legend>

          {isFetching ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: BOOK_LIMIT }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" rounded="field" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title={t("bookOrder.noBooks")}
              description={t("bookOrder.noBooksHint")}
              className="py-8"
            />
          ) : (
            <div
              role="radiogroup"
              aria-label={t("bookOrder.chooseBook")}
              aria-invalid={errors.book_id ? true : undefined}
              className="flex flex-col gap-1.5"
            >
              {books.map((book) => {
                const selected = String(form.book_id) === String(book.id);
                const title = pick(book, "name") || t("bookOrder.untitled");

                return (
                  <label
                    key={book.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-field border px-3.5 py-2.5 transition-colors duration-1 ease-out-soft ${
                      selected
                        ? "border-gold bg-gold/10"
                        : "border-line bg-paper-3 hover:border-gold-dim"
                    }`}
                  >
                    <input
                      type="radio"
                      name="book_id"
                      value={book.id}
                      checked={selected}
                      onChange={() => setField("book_id", book.id)}
                      className="h-4 w-4 shrink-0 accent-ink"
                    />
                    <span className="font-display text-[0.92rem] font-medium text-fg">
                      {title}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {errors.book_id && (
            <p className="text-[0.78rem] text-clay">{errors.book_id}</p>
          )}

          {/* Sahifalash — jami sahifa bittadan ko'p bo'lsa */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                iconStart={<ChevronLeft size={15} />}
              >
                {t("bookOrder.prev")}
              </Button>

              <span className="font-mono text-[0.76rem] text-fg-faint tabular">
                {page} / {totalPages}
              </span>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                iconEnd={<ChevronRight size={15} />}
              >
                {t("bookOrder.next")}
              </Button>
            </div>
          )}
        </fieldset>

        {/* ---------- Buyurtmachi ---------- */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("bookOrder.fullName")} required error={errors.full_name}>
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

          <Field label={t("bookOrder.phone")} required error={errors.phone}>
            {(a) => (
              <Input
                {...a}
                type="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                invalid={!!errors.phone}
                autoComplete="tel"
                placeholder="+998"
              />
            )}
          </Field>

          <Field
            label={t("bookOrder.email")}
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
            label={t("bookOrder.message")}
            hint={t("bookOrder.messageHint")}
            className="sm:col-span-2"
          >
            {(a) => (
              <Textarea
                {...a}
                rows={3}
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
              />
            )}
          </Field>
        </div>
      </form>
    </Dialog>
  );
}
