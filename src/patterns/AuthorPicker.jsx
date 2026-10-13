import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import cx from "../lib/cx";
import { useLocalized } from "../lib/useLocalized";
import useDebouncedValue from "../lib/useDebouncedValue";
import {
  useGetAuthorByIdQuery,
  useGetAuthorOptionsInfiniteQuery,
} from "../store/services/avtors.api";

/**
 * Muallif tanlovi — kitoblar filtri (sayt) va admin kitob formasi/filtri.
 *
 * Ilgari nativ <select> sahifa ochilishi bilan 100 ta muallifni olardi —
 * mualliflar esa 2 000 dan ko'p, qolganini tanlab bo'lmasdi. Endi:
 *   · so'rov FAQAT ro'yxat ochilganda ketadi
 *   · 25 tadan, ro'yxat oxiriga scroll qilinganda keyingisi
 *   · ichida qidiruv (400 ms debounce) — 2 000 ism ichidan scroll bilan
 *     izlash noqulay
 *
 * Tanlangan muallif yuklangan sahifalarda bo'lmasa (masalan, havola
 * orqali kelinganda), uning ismi alohida bitta so'rov bilan olinadi.
 *
 * Klaviatura: ↑ ↓ — tanlash, Enter — tasdiqlash, Esc — yopish.
 *
 *   allowAll  — ro'yxat boshida "Barcha mualliflar" (filtr uchun); forma uchun false
 *   emptyLabel — hech narsa tanlanmaganda tugma yozuvi
 *   selected  — tanlangan muallif obyekti ma'lum bo'lsa (masalan, book.author),
 *               ismi uchun alohida so'rov ketmaydi
 *   variant   — "site" (dizayn tokenlari) | "admin" (admin panel maydonlari)
 */
const TRIGGER = {
  site: "h-11 rounded-field bg-paper-3 pl-3.5 pr-3 text-[0.9rem] text-fg",
  admin: "h-[42px] rounded-lg bg-white pl-3.5 pr-3 text-sm text-slate-700",
};

export default function AuthorPicker({
  value,
  onChange,
  className,
  allowAll = true,
  emptyLabel,
  selected: selectedProp,
  variant = "site",
  invalid = false,
  id,
}) {
  const { t } = useTranslation();
  const { pick } = useLocalized();
  const listId = useId();

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const sentinelRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const search = useDebouncedValue(query.trim(), 400);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading } =
    useGetAuthorOptionsInfiniteQuery({ search }, { skip: !open });

  const authors = useMemo(() => data?.pages.flatMap((p) => p.data ?? []) ?? [], [data]);

  const allLabel = t("books.allAuthors");
  const placeholder = emptyLabel ?? allLabel;

  // allowAll bo'lsa 0-qator — "Barcha mualliflar", keyin mualliflar
  const options = useMemo(
    () => [
      ...(allowAll ? [{ id: "", label: allLabel }] : []),
      ...authors.map((a) => ({ id: a.id, label: pick(a, "full_name") })),
    ],
    [authors, pick, allowAll, allLabel],
  );

  /* Tanlangan muallif nomi: yuklangan sahifalardan, tashqaridan berilgan
     obyektdan yoki — oxirgi chora — bitta so'rov bilan */
  const known =
    authors.find((a) => a.id === value) ?? (selectedProp?.id === value ? selectedProp : null);
  const { data: selectedData } = useGetAuthorByIdQuery(value, { skip: !value || Boolean(known) });
  const selected = known ?? selectedData?.data ?? selectedData;
  const label = value ? pick(selected, "full_name") || "…" : placeholder;

  /* Tashqariga bosilsa — yopiladi */
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Qidiruv o'zgarsa ro'yxat boshidan
  useEffect(() => {
    setActive(0);
    listRef.current?.scrollTo({ top: 0 });
  }, [search]);

  /* Cheksiz scroll: ro'yxat oxiridagi belgi ko'ringanda keyingi sahifa */
  useEffect(() => {
    const node = sentinelRef.current;
    if (!open || !node || !hasNextPage) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) fetchNextPage();
      },
      { root: listRef.current, rootMargin: "0px 0px 80px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [open, hasNextPage, isFetching, fetchNextPage, authors.length]);

  // Klaviatura bilan tanlangan qator ko'rinib tursin
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openList = () => {
    setOpen(true);
    setActive(Math.max(0, options.findIndex((o) => o.id === value)));
  };

  const choose = (id) => {
    onChange(id);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      // Modal ichida (admin forma) Esc faqat ro'yxatni yopsin, formani emas
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (options[active]) choose(options[active].id);
    }
  };

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        aria-label={value ? undefined : placeholder}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openList();
          }
        }}
        className={cx(
          "flex w-full items-center gap-2 border text-left font-sans transition-colors duration-1 ease-out-soft",
          TRIGGER[variant] ?? TRIGGER.site,
          invalid
            ? "border-red-300"
            : variant === "admin"
              ? open ? "border-slate-900" : "border-slate-200"
              : open ? "border-gold-dim" : "border-line hover:border-gold-dim",
          !value && variant === "admin" && "text-slate-400",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className={cx("shrink-0 text-fg-faint transition-transform duration-1", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-1.5 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-line bg-paper-2 shadow-s2"
          onKeyDown={onKeyDown}
        >
          <div className="relative border-b border-line-soft p-2">
            <Search
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-fg-faint"
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("books.authorSearch")}
              aria-label={t("books.authorSearch")}
              aria-controls={listId}
              aria-activedescendant={options[active] ? `${listId}-${active}` : undefined}
              autoComplete="off"
              className="h-10 w-full rounded-field border border-line bg-paper-3 pl-9 pr-9 font-sans text-[0.86rem] text-fg placeholder:text-fg-faint"
            />
            {(isFetching && !isFetchingNextPage) || query.trim() !== search ? (
              <Loader2
                size={15}
                aria-hidden="true"
                className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-fg-faint"
              />
            ) : null}
          </div>

          <ul ref={listRef} id={listId} role="listbox" className="max-h-72 overflow-y-auto py-1">
            {options.map((option, i) => {
              const isSelected = option.id === value;
              return (
                <li
                  key={option.id || "all"}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(option.id)}
                  className={cx(
                    "mx-1 flex cursor-pointer items-center gap-2 rounded-field px-3 py-2 font-sans text-[0.86rem]",
                    i === active ? "bg-paper-3 text-fg" : "text-fg-muted",
                    allowAll && i === 0 && "border-b border-line-soft",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isSelected && <Check size={14} strokeWidth={2.2} className="shrink-0 text-gold-dim" />}
                </li>
              );
            })}

            {!isLoading && authors.length === 0 && (
              <li className="px-4 py-5 text-center font-sans text-[0.82rem] text-fg-faint">
                {t("books.authorNotFound")}
              </li>
            )}

            {(isLoading || hasNextPage) && (
              <li
                ref={sentinelRef}
                className="flex items-center justify-center gap-2 py-3 font-sans text-[0.78rem] text-fg-faint"
              >
                <Loader2 size={14} aria-hidden="true" className="animate-spin" />
                {t("books.loadingMore")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
