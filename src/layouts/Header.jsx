import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Menu, Search, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../lib/cx";
import { NAV_DIRECT, NAV_GROUPS } from "./navigation";
import GirihStar from "../design/motifs/GirihStar";
import logo from "../Images/logo.png";

/**
 * PESHTOQ — sayt sarlavhasi.
 *
 * BITTA QATOR, 64px (`--header-h`).
 *
 * Ilgari ikki qatorli edi (88px logo qatori + 46px navigatsiya qatori
 * = 135px) va guruh bosilganda butun kenglikdagi mega-menyu paneli
 * ochilardi — ichida kitob muqovalari bilan. Ikkalasi ham juda katta
 * bo'lib chiqdi: header ekranning yuqori qismini yeb qo'yar, ochilgan
 * panel esa sahifaning yarmini bosardi.
 *
 * Endi:
 *   · hammasi bitta 64px qatorda: logo · navigatsiya · qidiruv · til
 *   · guruhlar ixcham dropdown ochadi (280px), tirik ma'lumot yo'q
 */
export default function Header({ onMessageOpen, onBookOrderOpen }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [openGroup, setOpenGroup] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [term, setTerm] = useState("");

  const closeTimer = useRef(null);
  const navRef = useRef(null);
  const langRef = useRef(null);

  /* ---------- Scroll holati: chegara va soya ---------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- Sahifa almashsa hammasi yopiladi ---------- */
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
    setMobileGroup(null);
    setLangOpen(false);
  }, [location.pathname, location.search]);

  /* ---------- Mobil menyu ochiq bo'lsa sahifa scrolli bloklanadi ---------- */
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  /* ---------- Esc hammasini yopadi ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpenGroup(null);
      setMobileOpen(false);
      setLangOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Tashqariga bosilsa yopiladi ---------- */
  useEffect(() => {
    if (!openGroup && !langOpen) return;

    const onDown = (e) => {
      if (openGroup && navRef.current && !navRef.current.contains(e.target)) setOpenGroup(null);
      if (langOpen && langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openGroup, langOpen]);

  /* ---------- Fokus navigatsiyadan chiqsa panel yopiladi ---------- */
  const onNavBlur = useCallback((e) => {
    if (navRef.current && !navRef.current.contains(e.relatedTarget)) setOpenGroup(null);
  }, []);

  const hoverOpen = (id) => {
    clearTimeout(closeTimer.current);
    setOpenGroup(id);
  };
  const hoverClose = () => {
    clearTimeout(closeTimer.current);
    // Kichik kechikish: kursor tugmadan dropdownga o'tayotganda yopilmasin
    closeTimer.current = setTimeout(() => setOpenGroup(null), 140);
  };

  const runAction = (action) => {
    setOpenGroup(null);
    setMobileOpen(false);
    if (action === "bookOrder") onBookOrderOpen?.();
    if (action === "message") onMessageOpen?.();
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : "/books");
    setTerm("");
    setMobileOpen(false);
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path.split("?")[0]);

  const langLabel = i18n.language === "cyrl" ? "ЎЗ" : i18n.language.toUpperCase();

  return (
    <>
      <header
        className={cx(
          "sticky top-0 z-50 border-b bg-page/95 backdrop-blur-md",
          "transition-[border-color,box-shadow] duration-2 ease-out-soft",
          scrolled ? "border-line shadow-s1" : "border-line-soft",
        )}
      >
        <div className="mx-auto flex h-header-h w-full max-w-container items-center gap-3 px-gut">
          {/* ---------- Logo ---------- */}
          <Link to="/" aria-label={t("header.home")} className="flex shrink-0 items-center gap-2.5">
            <img src={logo} alt="" width="40" height="40" className="h-10 w-auto object-contain" />
            <span className="hidden min-[1400px]:block font-display text-[0.92rem] font-semibold leading-tight text-fg">
              {t("brand.short")}
            </span>
          </Link>

          {/* ---------- Navigatsiya (desktop) ---------- */}
          <nav
            ref={navRef}
            onBlur={onNavBlur}
            aria-label={t("nav.primary")}
            className="hidden items-center lg:flex"
          >
            {NAV_DIRECT.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={cx(
                  "relative flex h-header-h items-center px-3 font-sans text-[0.85rem] font-medium",
                  "transition-colors duration-1 ease-out-soft",
                  isActive(item.path) ? "text-fg" : "text-fg-muted hover:text-fg",
                  isActive(item.path) &&
                    "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-gold",
                )}
              >
                {t(item.label)}
              </Link>
            ))}

            {NAV_GROUPS.map((group) => {
              const open = openGroup === group.id;

              return (
                <div
                  key={group.id}
                  className="relative flex items-center"
                  onMouseEnter={() => hoverOpen(group.id)}
                  onMouseLeave={hoverClose}
                >
                  <button
                    type="button"
                    onClick={() => setOpenGroup(open ? null : group.id)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setOpenGroup(group.id);
                      }
                    }}
                    aria-expanded={open}
                    className={cx(
                      "flex h-header-h items-center gap-1 px-3 font-sans text-[0.85rem] font-medium",
                      "transition-colors duration-1 ease-out-soft",
                      open ? "text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {t(group.label)}
                    <ChevronDown
                      size={13}
                      aria-hidden="true"
                      className={cx("transition-transform duration-2", open && "rotate-180")}
                    />
                  </button>

                  {/* ---------- Ixcham dropdown ---------- */}
                  {open && (
                    <div className="absolute left-0 top-full z-50 w-[280px] overflow-hidden rounded-card border border-line bg-paper-2 py-1.5 shadow-s2">
                      <ul>
                        {group.items.map((item) => {
                          const cls =
                            "flex w-full items-center gap-2 px-4 py-2.5 text-left font-sans text-[0.85rem] text-fg-muted transition-colors duration-1 ease-out-soft hover:bg-paper-3 hover:text-fg";

                          return (
                            <li key={item.path || item.action}>
                              {item.action ? (
                                <button type="button" onClick={() => runAction(item.action)} className={cls}>
                                  {t(item.label)}
                                </button>
                              ) : (
                                <Link to={item.path} onClick={() => setOpenGroup(null)} className={cls}>
                                  {t(item.label)}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* ---------- Qidiruv ---------- */}
          <form onSubmit={submitSearch} role="search" className="ml-auto hidden xl:block">
            <label htmlFor="header-search" className="sr-only">
              {t("nav.searchLabel")}
            </label>
            <div className="relative">
              <Search
                size={15}
                strokeWidth={1.9}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
              />
              <input
                id="header-search"
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                className={cx(
                  "h-9 w-52 rounded-field border border-line bg-paper-3 pl-9 pr-3",
                  "font-sans text-[0.82rem] text-fg placeholder:text-fg-faint",
                  "transition-colors duration-1 ease-out-soft hover:border-gold-dim",
                )}
              />
            </div>
          </form>

          {/* Qidiruv maydoni sig'maydigan kenglikda — katalogga havola */}
          <Link
            to="/books"
            aria-label={t("nav.searchLabel")}
            className="ml-auto hidden h-9 w-9 shrink-0 items-center justify-center rounded-field border border-line text-fg-muted transition-colors duration-1 ease-out-soft hover:border-gold hover:text-fg lg:flex xl:hidden"
          >
            <Search size={15} strokeWidth={1.9} />
          </Link>

          {/* ---------- Til ---------- */}
          <div ref={langRef} className="relative ml-auto shrink-0 lg:ml-2">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
              aria-haspopup="true"
              className={cx(
                "inline-flex h-9 items-center gap-1 rounded-field border border-line px-2.5",
                "font-sans text-[0.78rem] font-semibold text-fg-muted",
                "transition-colors duration-1 ease-out-soft hover:border-gold hover:text-fg",
              )}
            >
              <Globe size={15} strokeWidth={1.9} />
              <span>{langLabel}</span>
              <ChevronDown
                size={12}
                className={cx("transition-transform duration-2", langOpen && "rotate-180")}
              />
            </button>

            {langOpen && (
              <ul className="absolute right-0 top-full z-50 mt-1.5 w-36 overflow-hidden rounded-card border border-line bg-paper-2 py-1 shadow-s2">
                {[
                  { code: "uz", name: "O'zbekcha" },
                  { code: "ru", name: "Русский" },
                  { code: "cyrl", name: "Ўзбекча" },
                ].map((l) => (
                  <li key={l.code}>
                    <button
                      type="button"
                      onClick={() => {
                        i18n.changeLanguage(l.code);
                        setLangOpen(false);
                      }}
                      aria-current={i18n.language === l.code || undefined}
                      className={cx(
                        "flex w-full items-center justify-between px-3 py-2 text-left",
                        "font-sans text-[0.82rem] transition-colors duration-1 ease-out-soft",
                        i18n.language === l.code
                          ? "text-fg"
                          : "text-fg-muted hover:bg-paper-3 hover:text-fg",
                      )}
                    >
                      {l.name}
                      {i18n.language === l.code && <GirihStar size={9} className="text-gold" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ---------- Mobil menyu tugmasi ---------- */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t("header.closeMenu") : t("header.openMenu")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-field border border-line text-fg-muted transition-colors duration-1 ease-out-soft hover:border-gold hover:text-fg lg:hidden"
          >
            {mobileOpen ? <X size={18} strokeWidth={1.9} /> : <Menu size={18} strokeWidth={1.9} />}
          </button>
        </div>
      </header>

      {/* ================= Mobil menyu ================= */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 top-header-h z-40 bg-ink-deep/40 backdrop-blur-[2px] lg:hidden"
          />

          <div className="fixed inset-x-0 top-header-h z-40 max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-line bg-page shadow-s2 lg:hidden">
            <nav aria-label={t("nav.primary")} className="flex flex-col px-gut py-4">
              <form onSubmit={submitSearch} role="search" className="mb-4">
                <label htmlFor="mobile-search" className="sr-only">
                  {t("nav.searchLabel")}
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-faint"
                  />
                  <input
                    id="mobile-search"
                    type="search"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder={t("nav.searchPlaceholder")}
                    className="h-11 w-full rounded-field border border-line bg-paper-3 pl-10 pr-3 font-sans text-[0.9rem] text-fg placeholder:text-fg-faint"
                  />
                </div>
              </form>

              {NAV_DIRECT.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="border-t border-line-soft py-3.5 font-display text-[1rem] font-medium text-fg"
                >
                  {t(item.label)}
                </Link>
              ))}

              {NAV_GROUPS.map((group) => {
                const open = mobileGroup === group.id;

                return (
                  <div key={group.id} className="border-t border-line-soft">
                    <button
                      type="button"
                      onClick={() => setMobileGroup(open ? null : group.id)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between py-3.5 text-left font-display text-[1rem] font-medium text-fg"
                    >
                      {t(group.label)}
                      <ChevronDown
                        size={17}
                        aria-hidden="true"
                        className={cx(
                          "shrink-0 text-fg-faint transition-transform duration-2",
                          open && "rotate-180",
                        )}
                      />
                    </button>

                    {open && (
                      <ul className="mb-2 ml-1 flex flex-col border-l-2 border-line-soft pl-3">
                        {group.items.map((item) => (
                          <li key={item.path || item.action}>
                            {item.action ? (
                              <button
                                type="button"
                                onClick={() => runAction(item.action)}
                                className="w-full py-2.5 text-left font-sans text-[0.9rem] text-fg-muted"
                              >
                                {t(item.label)}
                              </button>
                            ) : (
                              <Link
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className="block py-2.5 font-sans text-[0.9rem] text-fg-muted"
                              >
                                {t(item.label)}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
