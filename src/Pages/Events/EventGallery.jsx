import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useTranslation } from "react-i18next";

import cx from "../../lib/cx";
import scrollToSection from "../../lib/scrollToSection";
import { resolveMediaUrl } from "../Books/bookHelpers";
import { Dialog, Reveal } from "../../ui";
import { Pagination, SectionHeader } from "../../patterns";

/**
 * Tadbir fotolavhalari — 10 tagacha rasm.
 *
 * Grid sahifalarga bo'linadi (6 tadan): 10 ta rasm bir ekranda
 * tavsifni pastga itarib yuboradi. Paginatsiya katalogdagi bilan
 * bir xil komponent, faqat sahifani tepaga sakratmaydi — galereya
 * sahifaning o'rtasida turadi.
 *
 * Rasm bosilsa — lightbox: ← → tugmalari va klaviatura, pastda
 * miniaturalar. Yopilganda grid o'sha rasm turgan sahifaga o'tadi.
 */
const PER_PAGE = 6;

const imageSrc = (img) =>
  resolveMediaUrl(img?.url || img?.image_url || img?.path || img?.file_url);

export default function EventGallery({ images, title }) {
  const { t } = useTranslation();
  const rootRef = useRef(null);

  const list = useMemo(
    () =>
      [...(images ?? [])]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((img) => ({ ...img, src: imageSrc(img) }))
        .filter((img) => img.src),
    [images],
  );

  const [page, setPage] = useState(1);
  const [active, setActive] = useState(null); // lightbox indeksi

  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const visible = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Rasmlar soni kamaysa sahifa chegaradan chiqmasin
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const changePage = (p) => {
    setPage(p);

    // Galereya tepasi ekrandan chiqib ketgan bo'lsa — unga qaytamiz
    scrollToSection(rootRef.current, { onlyIfAbove: true });
  };

  const go = useCallback(
    (dir) => setActive((i) => (i == null ? i : (i + dir + list.length) % list.length)),
    [list.length],
  );

  const close = () => {
    if (active != null) setPage(Math.floor(active / PER_PAGE) + 1);
    setActive(null);
  };

  // ← → klaviatura — faqat lightbox ochiq bo'lganda
  useEffect(() => {
    if (active == null) return undefined;

    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  if (list.length === 0) return null;

  const current = active != null ? list[active] : null;

  return (
    <section ref={rootRef}>
      <SectionHeader
        as="h2"
        eyebrow={t("events.galleryCount", { count: list.length })}
        title={t("events.gallery")}
      />

      <Reveal
        key={page}
        as="ul"
        className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
      >
        {visible.map((img, i) => {
          const index = (page - 1) * PER_PAGE + i;

          return (
            <li key={img.id ?? img.src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${t("events.galleryOpen")} — ${t("events.photo", { current: index + 1, total: list.length })}`}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-card border border-line bg-paper-3 shadow-s1"
              >
                <img
                  src={img.src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-4 ease-out-soft group-hover:scale-[1.03]"
                />

                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-ink-deep/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-2 ease-out-soft group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <span className="font-mono text-[0.72rem] text-on-ink/85 tabular">
                    {index + 1} / {list.length}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-field bg-on-ink/15 text-on-ink backdrop-blur-sm">
                    <Expand size={15} strokeWidth={1.9} />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </Reveal>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[0.75rem] text-fg-faint tabular">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, list.length)} / {list.length}
          </span>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={changePage}
            scrollToTop={false}
            size="sm"
            labels={{
              nav: t("events.galleryPagination"),
              prev: t("media.prevPage"),
              next: t("media.nextPage"),
            }}
          />
        </div>
      )}

      {/* ---------- Lightbox ---------- */}
      <Dialog
        open={current != null}
        onClose={close}
        size="xl"
        title={title}
        description={current ? t("events.photo", { current: active + 1, total: list.length }) : undefined}
      >
        {current && (
          <div className="flex flex-col gap-4">
            <div className="relative flex items-center justify-center overflow-hidden rounded-card bg-ink-deep">
              <img
                key={current.src}
                src={current.src}
                alt={t("events.photo", { current: active + 1, total: list.length })}
                className="block max-h-[62dvh] w-auto max-w-full object-contain"
              />

              {list.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={t("events.prevPhoto")}
                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-field bg-ink-deep/60 text-on-ink backdrop-blur-sm transition-colors duration-1 ease-out-soft hover:bg-ink-deep/85"
                  >
                    <ChevronLeft size={20} strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={t("events.nextPhoto")}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-field bg-ink-deep/60 text-on-ink backdrop-blur-sm transition-colors duration-1 ease-out-soft hover:bg-ink-deep/85"
                  >
                    <ChevronRight size={20} strokeWidth={1.9} />
                  </button>
                </>
              )}
            </div>

            {list.length > 1 && (
              <ul className="flex gap-2 overflow-x-auto pb-1">
                {list.map((img, i) => (
                  <li key={img.id ?? img.src} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={t("events.photo", { current: i + 1, total: list.length })}
                      aria-current={i === active ? "true" : undefined}
                      className={cx(
                        "block h-14 w-20 overflow-hidden rounded-field border-2 transition-opacity duration-1 ease-out-soft",
                        i === active
                          ? "border-gold opacity-100"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                    >
                      <img src={img.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Dialog>
    </section>
  );
}
