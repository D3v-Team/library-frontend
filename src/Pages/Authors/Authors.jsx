import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../../lib/cx";
import { useLocalized } from "../../lib/useLocalized";
import { useGetAuthorsQuery } from "../../store/services/avtors.api";
import { BASE_URL } from "../../store/api";
import { Button, EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell } from "../../patterns";
import SEO from "../../seo/SEO";

/**
 * Mualliflar ko'rsatkichi.
 *
 * "Boylik retsepti" ning to'rtinchi qoidasi — ikkinchi qatlam:
 * bu yerda ALIFBO INDEKSI. Kutubxona ko'rsatkichi harf bo'yicha
 * ochiladi, ya'ni 128 muallifni bir gridda ko'rsatish emas,
 * balki "Q harfidagilar" ni topish imkoni bo'lishi kerak.
 */
const imageUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

const authorImage = (author) => {
  const first = Array.isArray(author?.images) ? author.images[0] : null;
  return imageUrl(first?.url || first?.image_url || first?.path);
};

export default function Authors() {
  const { t } = useTranslation();
  const { pick, formatNumber } = useLocalized();

  const [params, setParams] = useSearchParams();
  const letter = (params.get("letter") ?? "").toUpperCase();

  const { data, isLoading, error } = useGetAuthorsQuery({ page: 1, limit: 200 });
  /* `?? []` har renderda yangi massiv qaytaradi — uni useMemo
     bog'liqligiga bersak memo hech qachon ishlamaydi. */
  const authors = useMemo(() => data?.data ?? [], [data]);
  const total = data?.meta?.total;

  /* Alifbo — faqat MAVJUD harflar chiqadi, bo'sh harf bosilmaydi */
  const { letters, grouped } = useMemo(() => {
    const map = new Map();

    for (const a of authors) {
      const name = pick(a, "full_name");
      if (!name) continue;

      const ch = name.trim().charAt(0).toUpperCase();
      if (!map.has(ch)) map.set(ch, []);
      map.get(ch).push({ ...a, __name: name });
    }

    const sortedLetters = [...map.keys()].sort((x, y) => x.localeCompare(y));
    for (const list of map.values()) {
      list.sort((x, y) => x.__name.localeCompare(y.__name));
    }

    return { letters: sortedLetters, grouped: map };
  }, [authors, pick]);

  const shown = letter && grouped.has(letter) ? grouped.get(letter) : authors.map((a) => ({ ...a, __name: pick(a, "full_name") }));

  const setLetter = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("letter", value);
    else next.delete("letter");
    setParams(next, { replace: true });
  };

  return (
    <>
      <SEO title={t("author.heading")} description={t("author.description")} />

      <PageShell
        breadcrumbs={[{ label: t("author.heading") }]}
        eyebrow={t("author.badge")}
        title={t("author.heading")}
        lede={t("author.description")}
        meta={
          <>
            <PageMeta label={t("author.metaTotal")} value={total != null ? formatNumber(total) : "—"} />
            <PageMeta label={t("author.metaLetters")} value={letters.length || "—"} />
          </>
        }
        filters={
          letters.length > 0 ? (
            <nav aria-label={t("author.alphabet")} className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLetter("")}
                aria-pressed={letter === ""}
                className={cx(
                  "inline-flex h-9 items-center rounded-field border px-3 font-sans text-[0.8rem] font-semibold transition-colors duration-1 ease-out-soft",
                  letter === ""
                    ? "border-ink bg-ink text-on-ink"
                    : "border-line text-fg-muted hover:border-gold hover:text-fg",
                )}
              >
                {t("author.all")}
              </button>

              {letters.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setLetter(ch)}
                  aria-pressed={letter === ch}
                  className={cx(
                    "inline-flex h-9 w-9 items-center justify-center rounded-field border font-display text-[0.88rem] font-semibold transition-colors duration-1 ease-out-soft",
                    letter === ch
                      ? "border-ink bg-ink text-on-ink"
                      : "border-line text-fg-muted hover:border-gold hover:text-fg",
                  )}
                >
                  {ch}
                </button>
              ))}
            </nav>
          ) : null
        }
      >
        {error ? (
          <EmptyState title={t("author.error")} />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[3/4] w-full" rounded="card" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            title={t("author.empty")}
            actions={
              letter ? (
                <Button size="sm" variant="primary" onClick={() => setLetter("")}>
                  {t("author.all")}
                </Button>
              ) : null
            }
          />
        ) : (
          <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((author) => {
              const photo = authorImage(author);
              const nationality = pick(author, "nationality");

              return (
                <article key={author.id}>
                  <Link to={`/authors/${author.id}`} className="group block u-lift rounded-card">
                    <span className="relative block aspect-[3/4] overflow-hidden rounded-card bg-ink-deep">
                      {photo ? (
                        <img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <span aria-hidden="true" className="girih-tile absolute inset-0" />
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="font-display text-[2.4rem] font-semibold text-gold/70">
                              {author.__name?.charAt(0)}
                            </span>
                          </span>
                        </>
                      )}
                    </span>

                    <h2 className="mt-3 line-clamp-2 font-display text-[1rem] font-semibold leading-snug text-fg">
                      {author.__name}
                    </h2>

                    {nationality && (
                      <p className="mt-0.5 font-sans text-[0.8rem] text-fg-muted">{nationality}</p>
                    )}
                  </Link>
                </article>
              );
            })}
          </Reveal>
        )}
      </PageShell>
    </>
  );
}
