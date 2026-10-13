import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, Loader2, Search, Send, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useCreateOnlineRequestMutation } from "../store/services/requests";
import { useGetBooksQuery } from "../store/services/books.api";
import { useLocalized } from "../lib/useLocalized";
import useDebouncedValue from "../lib/useDebouncedValue";
import { getBookAuthorName } from "../Pages/Books/bookHelpers";
import { Button, Dialog, EmptyState, Field, Input, Skeleton, Textarea } from "../ui";
import apiError from "../lib/apiError";

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
 *
 * Kitob tanlash: fond katta (Excel importi minglab kitob qo'shadi),
 * varaqlab kerakli kitobni topib bo'lmaydi. Shuning uchun ro'yxat
 * umuman ko'rsatilmaydi — faqat nomi bo'yicha qidiruv natijalari.
 * So'rov backend `search` ga, kamida 2 harfdan keyin va yozish
 * to'xtagach 400 ms o'tib ketadi (har harfga so'rov ketmaydi).
 * Tanlangan kitob alohida eslab qolinadi: qidiruv o'zgarib u
 * natijalardan chiqib ketsa ham tanlov yo'qolmaydi.
 */

const BOOK_LIMIT = 5;
const SEARCH_DELAY = 400;
const SEARCH_MIN = 2;

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
  // Sahifa qaysi qidiruvga tegishli ekani bilan birga saqlanadi: qidiruv
  // o'zgarsa sahifa darhol 1 bo'ladi. Ilgari effekt orqali tiklanardi va
  // undan oldin {eski sahifa, yangi qidiruv} bilan ortiqcha so'rov ketardi.
  const [pageState, setPageState] = useState({ search: "", page: 1 });
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);

  const search = useDebouncedValue(query.trim(), SEARCH_DELAY);
  const page = pageState.search === search ? pageState.page : 1;
  const setPage = (next) =>
    setPageState({ search, page: typeof next === "function" ? next(page) : next });
  const canSearch = search.length >= SEARCH_MIN;
  const isTyping = query.trim() !== search && query.trim().length >= SEARCH_MIN;

  const [createOnlineRequest, { isLoading }] = useCreateOnlineRequestMutation();

  // Faqat qidiruv bo'lganda so'raladi — bo'sh modalda ro'yxat yo'q
  const { currentData, isFetching } = useGetBooksQuery(
    { page, limit: BOOK_LIMIT, search, sortBy: "", sortOrder: "desc" },
    { skip: !open || !canSearch },
  );

  /* Ko'rsatiladigan natija. Yangi qidiruvda eski natija ko'rinmaydi
     (`currentData` bo'sh), lekin SHU qidiruv ichida sahifa almashganda
     oldingi sahifa xiralashib turadi — ro'yxat skeletonga sakramaydi. */
  const lastResult = useRef(null);
  if (currentData) lastResult.current = { search, data: currentData };
  const result =
    currentData ?? (lastResult.current?.search === search ? lastResult.current.data : undefined);

  const books = canSearch ? result?.data ?? [] : [];
  const totalPages = canSearch ? result?.meta?.totalPages ?? 1 : 1;
  const busy = isTyping || isFetching;

  // Modal har ochilganda toza holatdan boshlanadi
  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setErrors({});
    setPageState({ search: "", page: 1 });
    setQuery("");
    setSelectedBook(null);
  }, [open]);

  const chooseBook = (book) => {
    setSelectedBook(book);
    setField("book_id", book.id);
  };

  const clearBook = () => {
    setSelectedBook(null);
    setField("book_id", "");
  };

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
      toast.error(apiError(err, t("bookOrder.error")));
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

          {/* Tanlangan kitob — qidiruv o'zgarsa ham ko'rinib turadi */}
          {selectedBook && (
            <div className="flex items-center gap-3 rounded-field border border-gold bg-gold/10 px-3.5 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-gold">
                <Check size={13} strokeWidth={2.4} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-sans text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-gold-dim">
                  {t("bookOrder.selected")}
                </span>
                <span className="block truncate font-display text-[0.92rem] font-medium text-fg">
                  {pick(selectedBook, "name") || t("bookOrder.untitled")}
                </span>
              </span>
              <Button size="sm" variant="ghost" onClick={clearBook} iconStart={<X size={14} />}>
                {t("bookOrder.change")}
              </Button>
            </div>
          )}

          {/* Qidiruv */}
          <div className="relative">
            <Search
              size={16}
              strokeWidth={1.9}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-faint"
            />
            <label htmlFor="book-order-search" className="sr-only">
              {t("bookOrder.searchLabel")}
            </label>
            <Input
              id="book-order-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              // Enter formani yubormasin — bu yerda u faqat qidiruv
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              placeholder={t("bookOrder.search")}
              autoComplete="off"
              className="pl-10 pr-10"
              aria-controls="book-order-results"
            />
            {busy && (
              <Loader2
                size={16}
                strokeWidth={2}
                aria-label={t("bookOrder.searching")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-fg-faint"
              />
            )}
          </div>

          <div id="book-order-results" aria-live="polite" aria-busy={busy}>
            {!canSearch && !isTyping ? (
              // Hali qidirilmagan — ro'yxat o'rniga yo'l-yo'riq
              <p className="rounded-field border border-dashed border-line px-4 py-5 text-center font-sans text-[0.84rem] text-fg-muted">
                {query.trim() ? (
                  t("bookOrder.searchMin", { count: SEARCH_MIN })
                ) : (
                  <>
                    <span className="block font-display text-[0.95rem] font-medium text-fg">
                      {t("bookOrder.searchPrompt")}
                    </span>
                    <span className="mt-0.5 block">{t("bookOrder.searchPromptHint")}</span>
                  </>
                )}
              </p>
            ) : !result ? (
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" rounded="field" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <EmptyState
                title={t("bookOrder.notFound", { term: search })}
                description={t("bookOrder.notFoundHint")}
                className="py-8"
              />
            ) : (
              <div
                role="radiogroup"
                aria-label={t("bookOrder.chooseBook")}
                aria-invalid={errors.book_id ? true : undefined}
                // Qayta so'rov paytida ro'yxat o'chib-yonmaydi, faqat xiralashadi
                className={`flex flex-col gap-1.5 transition-opacity duration-1 ease-out-soft ${
                  isFetching ? "opacity-60" : ""
                }`}
              >
                {books.map((book) => {
                  const selected = String(form.book_id) === String(book.id);
                  const title = pick(book, "name") || t("bookOrder.untitled");
                  const author = getBookAuthorName(book, pick);

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
                        onChange={() => chooseBook(book)}
                        className="h-4 w-4 shrink-0 accent-ink"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-[0.92rem] font-medium text-fg">
                          {title}
                        </span>
                        {author && (
                          <span className="block truncate font-sans text-[0.76rem] text-fg-muted">
                            {author}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

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
                disabled={page <= 1 || isFetching}
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
                disabled={page >= totalPages || isFetching}
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
