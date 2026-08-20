// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Menu,
  X,
  Globe,
  BookOpen,
  Send,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useCreateOnlineRequestMutation } from "../../../../store/services/requests";
import { useGetBooksQuery } from "../../../../store/services/books.api";
import logo from "../../../../Images/logo.png";

const navigation = [
  {
    label: "header.about",
    children: [
      { label: "header.history", path: "/about" },
      { label: "header.management", path: "/about/management" },
      { label: "header.documents", path: "/about/documents" },
    ],
  },
  {
    label: "header.books",
    children: [
      { label: "header.books", path: "/books" },
      { label: "header.authors", path: "/authors" },
    ],
  },
  {
    label: "header.services",
    children: [
      { label: "header.bookOrder", action: "bookOrder" },
      { label: "header.onlineMessage", action: "message" },
      { label: "header.virtualReference", path: "/about/documents" },
      { label: "header.faq", path: "/faq" },
      { label: "header.privacy", path: "/privacy-policy" },
    ],
  },
];

const simpleLinks = [
  { label: "header.news", path: "/news" },
  { label: "header.events", path: "/events" },
  // { label: "header.contact", path: "/contact" },
];

const emptyForm = {
  type: "BOOK_ORDER",
  full_name: "",
  phone: "",
  email: "",
  book_id: "",
  message: "",
};

export default function Header({ onMessageOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  // Book order modal state
  const [bookOrderOpen, setBookOrderOpen] = useState(false);
  const [bookForm, setBookForm] = useState(emptyForm);
  const [bookErrors, setBookErrors] = useState({});
  const [bookPage, setBookPage] = useState(1);
  const BOOK_LIMIT = 5;

  const closeTimer = useRef(null);
  const location = useLocation();

  const { t, i18n } = useTranslation();

  const [createOnlineRequest, { isLoading }] = useCreateOnlineRequestMutation();

  // ===== KITOBLARNI OLISH – faqat modal ochilganda =====
  const {
    data: booksData,
    isLoading: booksLoading,
    isFetching: booksFetching,
  } = useGetBooksQuery(
    {
      page: bookPage,
      limit: BOOK_LIMIT,
      sortBy: "",
      sortOrder: "desc",
    },
    { skip: !bookOrderOpen }
  );

  const books = booksData?.data ?? [];
  const totalBooks = booksData?.meta?.total ?? 0;
  const totalPages = booksData?.meta?.totalPages ?? 1;

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLanguageOpen(false);
  };

  // Header scroll holati
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu ochilganda body scrollini bloklash
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
    setOpenMenu(null);
  }, [mobileOpen]);

  // Sahifa o‘zgarganda mobile menu yopiladi
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setBookOrderOpen(false);
    setBookPage(1);
  }, [location.pathname]);

  // Escape bilan mobile menu va modal yopish
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setOpenMenu(null);
        setBookOrderOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleMenu = (label) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  const openDesktopMenu = (label) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };

  const scheduleCloseDesktopMenu = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  // ================= BOOK ORDER HANDLERS =================
  const openBookOrder = () => {
    setBookForm(emptyForm);
    setBookErrors({});
    setBookPage(1);
    setBookOrderOpen(true);
    setOpenMenu(null);
  };

  const closeBookOrder = () => {
    setBookOrderOpen(false);
    setBookForm(emptyForm);
    setBookErrors({});
    setBookPage(1);
  };

  const handleBookFieldChange = (field, value) => {
    setBookForm((prev) => ({ ...prev, [field]: value }));
    if (bookErrors[field]) {
      setBookErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateBookForm = () => {
    const errors = {};
    if (!bookForm.full_name.trim()) errors.full_name = "Ism-familiya kiriting";
    if (!bookForm.phone.trim()) errors.phone = "Telefon raqam kiriting";
    if (!bookForm.email.trim()) errors.email = "Email kiriting";
    else if (!/\S+@\S+\.\S+/.test(bookForm.email)) errors.email = "To‘g‘ri email kiriting";
    if (!bookForm.book_id) errors.book_id = "Kitob tanlang";
    setBookErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!validateBookForm()) return;

    try {
      await createOnlineRequest({
        type: "BOOK_ORDER",
        full_name: bookForm.full_name,
        phone: bookForm.phone,
        email: bookForm.email,
        book_id: bookForm.book_id,
        message: bookForm.message || "",
      }).unwrap();
      toast.success("Buyurtmangiz qabul qilindi!");
      closeBookOrder();
    } catch (err) {
      toast.error(err?.data?.message || "Buyurtma yuborishda xatolik");
    }
  };

  const getBookTitle = (book) => {
    const lang = i18n.language;
    if (lang === "uz") return book.name_latin;
    if (lang === "ru") return book.name_ru;
    if (lang === "cyrl") return book.name_cyril;
    return book.name_latin || "Nomsiz";
  };

  const goPrevPage = () => setBookPage((p) => Math.max(1, p - 1));
  const goNextPage = () => setBookPage((p) => Math.min(totalPages, p + 1));

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-all duration-300 ${
          scrolled ? "border-slate-200 shadow-md" : "border-slate-100 shadow-none"
        }`}
      >
        <div className="mx-auto flex h-24 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center" aria-label={t("header.home")}>
            <img src={logo} alt="Chinaz kutubxonasi" className="h-16 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link to="/" className="rounded-lg px-4 py-3 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950">
              {t("header.home")}
            </Link>

            {navigation.map((item) => {
              const isOpen = openMenu === item.label;
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => openDesktopMenu(item.label)}
                  onMouseLeave={scheduleCloseDesktopMenu}
                >
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.label)}
                    aria-expanded={isOpen}
                    className="flex items-center gap-1 rounded-lg px-4 py-3 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                  >
                    {t(item.label)}
                    <ChevronDown size={17} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className={`absolute right-0 top-full w-64 origin-top rounded-xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-200 ${
                      isOpen ? "visible translate-y-2 opacity-100" : "invisible -translate-y-1 opacity-0"
                    }`}
                  >
                    {item.children.map((child) => {
                      if (child.action === "bookOrder") {
                        return (
                          <button
                            key={child.label}
                            type="button"
                            onClick={() => { setOpenMenu(null); openBookOrder(); }}
                            className="block w-full rounded-lg px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                          >
                            {t(child.label)}
                          </button>
                        );
                      }
                      if (child.action === "message") {
                        return (
                          <button
                            key={child.label}
                            type="button"
                            onClick={() => { setOpenMenu(null); onMessageOpen?.(); }}
                            className="block w-full rounded-lg px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                          >
                            {t(child.label)}
                          </button>
                        );
                      }
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setOpenMenu(null)}
                          className="block rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                        >
                          {t(child.label)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {simpleLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-lg px-4 py-3 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen((prev) => !prev)}
                className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Globe size={18} />
                <span>{i18n.language === "cyrl" ? "ЎЗ" : i18n.language.toUpperCase()}</span>
                <ChevronDown size={14} className={`transition-transform ${languageOpen ? "rotate-180" : ""}`} />
              </button>
              {languageOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                  {["uz", "ru", "cyrl"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => changeLanguage(l)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {l === "uz" ? "O'zbekcha" : l === "ru" ? "Русский" : "Ўзбекча"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ===== MOBILE: Language Selector (tepada) ===== */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen((prev) => !prev)}
                className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                aria-label="Tilni o'zgartirish"
              >
                <Globe size={18} />
                <span className="text-xs font-semibold uppercase">
                  {i18n.language === "cyrl" ? "ЎЗ" : i18n.language.toUpperCase()}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${languageOpen ? "rotate-180" : ""}`}
                />
              </button>
              {languageOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50">
                  {["uz", "ru", "cyrl"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => changeLanguage(l)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {l === "uz" ? "O'zbekcha" : l === "ru" ? "Русский" : "Ўзбекча"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? t("header.closeMenu") : t("header.openMenu")}
            aria-expanded={mobileOpen}
            className="relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 active:scale-95 lg:hidden"
          >
            <Menu
              size={24}
              className={`absolute transition-all duration-200 ${
                mobileOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
              }`}
            />
            <X
              size={24}
              className={`absolute transition-all duration-200 ${
                mobileOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            />
          </button>
        </div>

        {/* Mobile Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 top-24 z-40 bg-slate-950/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        {/* Mobile Navigation (no language selector at bottom) */}
        <div
          className={`fixed inset-x-0 top-24 z-40 origin-top overflow-hidden border-t border-slate-200 bg-white shadow-xl transition-all duration-300 ease-out lg:hidden ${
            mobileOpen
              ? "max-h-[calc(100dvh-6rem)] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
          }`}
        >
          <nav className="mx-auto flex max-h-[calc(100dvh-6rem)] max-w-[1440px] flex-col overflow-y-auto px-4 py-3 sm:px-6">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3.5 text-base font-medium text-slate-800 transition-colors duration-150 active:bg-slate-100"
            >
              {t("header.home")}
            </Link>

            {navigation.map((item) => {
              const isOpen = openMenu === item.label;
              return (
                <div key={item.label} className="border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.label)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-medium text-slate-800 transition-colors duration-150 active:bg-slate-100"
                  >
                    {t(item.label)}
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="mb-1 ml-2 flex flex-col gap-0.5 border-l-2 border-slate-100 pl-3">
                        {item.children.map((child) => {
                          if (child.action === "bookOrder") {
                            return (
                              <button
                                key={child.label}
                                type="button"
                                onClick={() => {
                                  setMobileOpen(false);
                                  setOpenMenu(null);
                                  openBookOrder();
                                }}
                                className="rounded-lg px-3 py-2.5 text-left text-sm text-slate-500"
                              >
                                {t(child.label)}
                              </button>
                            );
                          }
                          if (child.action === "message") {
                            return (
                              <button
                                key={child.label}
                                type="button"
                                onClick={() => {
                                  setMobileOpen(false);
                                  setOpenMenu(null);
                                  onMessageOpen?.();
                                }}
                                className="rounded-lg px-3 py-2.5 text-left text-sm text-slate-500"
                              >
                                {t(child.label)}
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => {
                                setMobileOpen(false);
                                setOpenMenu(null);
                              }}
                              className="rounded-lg px-3 py-2.5 text-sm text-slate-500"
                            >
                              {t(child.label)}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {simpleLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="border-t border-slate-100 px-4 py-3.5 text-base font-medium text-slate-800 transition-colors duration-150 active:bg-slate-100"
              >
                {t(item.label)}
              </Link>
            ))}

            {/* Mobile actions – language selector removed from here */}
          </nav>
        </div>
      </header>

      {/* ========================= BOOK ORDER MODAL ========================= */}
      {bookOrderOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeBookOrder}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {t("header.bookOrder")}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeBookOrder}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <input
                  name="full_name"
                  value={bookForm.full_name}
                  onChange={(e) => handleBookFieldChange("full_name", e.target.value)}
                  placeholder="Ism-familiya *"
                  className={`w-full rounded-lg border ${bookErrors.full_name ? "border-red-500" : "border-slate-200"} px-4 py-3 text-sm outline-none focus:border-slate-900`}
                />
                {bookErrors.full_name && (
                  <p className="mt-1 text-xs text-red-500">{bookErrors.full_name}</p>
                )}
              </div>

              <div>
                <input
                  name="phone"
                  value={bookForm.phone}
                  onChange={(e) => handleBookFieldChange("phone", e.target.value)}
                  placeholder="Telefon raqam *"
                  className={`w-full rounded-lg border ${bookErrors.phone ? "border-red-500" : "border-slate-200"} px-4 py-3 text-sm outline-none focus:border-slate-900`}
                />
                {bookErrors.phone && (
                  <p className="mt-1 text-xs text-red-500">{bookErrors.phone}</p>
                )}
              </div>

              <div>
                <input
                  name="email"
                  type="email"
                  value={bookForm.email}
                  onChange={(e) => handleBookFieldChange("email", e.target.value)}
                  placeholder="Email *"
                  className={`w-full rounded-lg border ${bookErrors.email ? "border-red-500" : "border-slate-200"} px-4 py-3 text-sm outline-none focus:border-slate-900`}
                />
                {bookErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{bookErrors.email}</p>
                )}
              </div>

              {/* Kitoblar select + pagination */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Kitob tanlang *
                </label>
                <div className="relative">
                  <select
                    name="book_id"
                    value={bookForm.book_id}
                    onChange={(e) => handleBookFieldChange("book_id", e.target.value)}
                    className={`w-full rounded-lg border ${bookErrors.book_id ? "border-red-500" : "border-slate-200"} px-4 py-3 text-sm outline-none focus:border-slate-900`}
                    disabled={booksLoading || booksFetching}
                  >
                    <option value="">Kitob tanlang</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {getBookTitle(book)}
                      </option>
                    ))}
                  </select>
                  {(booksLoading || booksFetching) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={goPrevPage}
                      disabled={bookPage <= 1 || booksLoading || booksFetching}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-slate-500">
                      {bookPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={goNextPage}
                      disabled={bookPage >= totalPages || booksLoading || booksFetching}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
                {bookErrors.book_id && (
                  <p className="mt-1 text-xs text-red-500">{bookErrors.book_id}</p>
                )}
              </div>

              <div>
                <textarea
                  name="message"
                  value={bookForm.message}
                  onChange={(e) => handleBookFieldChange("message", e.target.value)}
                  placeholder="Qo'shimcha ma'lumot (ixtiyoriy)"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-black transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isLoading ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}