// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const navigation = [
  {
    label: "header.about",
    children: [
      {
        label: "header.history",
        path: "/about/documents",
      },
      {
        label: "header.management",
        path: "/about/management",
      },
      {
        label: "header.documents",
        path: "/about/documents",
      },
    ],
  },
  {
    label: "header.books",
    children: [
      {
        label: "header.books",
        path: "/books",
      },
    ],
  },
  {
    label: "header.services",
    children: [
      {
        label: "header.bookOrder",
        path: "/services/order",
      },
      {
        label: "header.onlineMessage",
        action: "message",
      },
      {
        label: "header.virtualReference",
        path: "/about/documents",
      },
    ],
  },
];

const simpleLinks = [
  {
    label: "header.news",
    path: "/news",
  },
  {
    label: "header.events",
    path: "/events",
  },
  {
    label: "header.contact",
    path: "/contact",
  },
];

export default function Header({ onMessageOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const closeTimer = useRef(null);
  const location = useLocation();

  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLanguageOpen(false);
  };

  // Header scroll holati
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Mobile menu ochilganda body scrollini bloklash
  useEffect(() => {
    if (mobileOpen) {
      const previousOverflow = document.body.style.overflow;

      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    setOpenMenu(null);
  }, [mobileOpen]);

  // Sahifa o‘zgarganda mobile menu yopiladi
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  // Escape bilan mobile menu yopish
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setOpenMenu(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleMenu = (label) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  // Desktop hover
  const openDesktopMenu = (label) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };

  const scheduleCloseDesktopMenu = () => {
    clearTimeout(closeTimer.current);

    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
    }, 120);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "border-slate-200 shadow-md" : "border-slate-100 shadow-none"
      }`}
    >
      {/* =========================
          MAIN HEADER
      ========================== */}
      <div className="mx-auto flex h-24 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label={t("header.home")}
        >
          <img
            src="/src/Images/logo.png"
            alt="Chinaz kutubxonasi"
            className="h-16 w-auto object-contain"
          />
        </Link>

        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}
        <nav className="hidden items-center gap-1 lg:flex">
          {/* Home */}
          <Link
            to="/"
            className="rounded-lg px-4 py-3 text-[15px] font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-950"
          >
            {t("header.home")}
          </Link>

          {/* Dropdown menus */}
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
                  className="flex items-center gap-1 rounded-lg px-4 py-3 text-[15px] font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-950"
                >
                  {t(item.label)}

                  <ChevronDown
                    size={17}
                    className={`transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 top-full w-64 origin-top rounded-xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-200 ease-out ${
                    isOpen
                      ? "visible translate-y-2 opacity-100"
                      : "invisible -translate-y-1 opacity-0"
                  }`}
                >
                  {item.children.map((child) =>
                    child.action === "message" ? (
                      <button
                        key={child.label}
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onMessageOpen?.();
                        }}
                        className="block w-full rounded-lg px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      >
                        {t(child.label)}
                      </button>
                    ) : (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setOpenMenu(null)}
                        className="block rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      >
                        {t(child.label)}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            );
          })}

          {/* Simple links */}
          {simpleLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-lg px-4 py-3 text-[15px] font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-950"
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        {/* =========================
            DESKTOP ACTIONS
        ========================== */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Language */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen((prev) => !prev)}
              className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Globe size={18} />

              <span>
                {i18n.language === "cyrl" ? "ЎЗ" : i18n.language.toUpperCase()}
              </span>

              <ChevronDown
                size={14}
                className={`transition-transform ${
                  languageOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {languageOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                <button
                  type="button"
                  onClick={() => changeLanguage("uz")}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  O'zbekcha
                </button>

                <button
                  type="button"
                  onClick={() => changeLanguage("ru")}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  Русский
                </button>

                <button
                  type="button"
                  onClick={() => changeLanguage("cyrl")}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  Ўзбекча
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================
            MOBILE BUTTON
        ========================== */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? t("header.closeMenu") : t("header.openMenu")}
          aria-expanded={mobileOpen}
          className="relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition-colors duration-200 hover:bg-slate-100 active:scale-95 lg:hidden"
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

      {/* =========================
          MOBILE BACKDROP
      ========================== */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 top-24 z-40 bg-slate-950/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* =========================
          MOBILE NAVIGATION
      ========================== */}
      <div
        className={`fixed inset-x-0 top-24 z-40 origin-top overflow-hidden border-t border-slate-200 bg-white shadow-xl transition-all duration-300 ease-out lg:hidden ${
          mobileOpen
            ? "max-h-[calc(100dvh-6rem)] translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-h-[calc(100dvh-6rem)] max-w-[1440px] flex-col overflow-y-auto px-4 py-3 sm:px-6">
          {/* Home */}
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl px-4 py-3.5 text-base font-medium text-slate-800 transition-colors duration-150 active:bg-slate-100"
          >
            {t("header.home")}
          </Link>

          {/* Dropdown navigation */}
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

                {/* Submenu */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="mb-1 ml-2 flex flex-col gap-0.5 border-l-2 border-slate-100 pl-3">
                      {item.children.map((child) =>
                        child.action === "message" ? (
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
                        ) : (
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
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Simple links */}
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

          {/* Mobile actions */}
          <div className="sticky bottom-0 mt-2 flex gap-2 border-t border-slate-200 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen((prev) => !prev)}
                className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Globe size={18} />

                <span>
                  {i18n.language === "cyrl"
                    ? "ЎЗ"
                    : i18n.language.toUpperCase()}
                </span>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    languageOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {languageOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => changeLanguage("uz")}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    O'zbekcha
                  </button>

                  <button
                    type="button"
                    onClick={() => changeLanguage("cyrl")}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Ўзбекча
                  </button>

                  <button
                    type="button"
                    onClick={() => changeLanguage("ru")}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Русский
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
