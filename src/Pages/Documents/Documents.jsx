import { Download, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../../lib/cx";
import { useLocalized } from "../../lib/useLocalized";
import { useGetDocumentsQuery } from "../../store/services/documents.api";
import { BASE_URL } from "../../store/api";
import { Button, EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell, Pagination } from "../../patterns";
import SEO from "../../seo/SEO";

/**
 * Hujjatlar.
 *
 * Jadval ko'rinishida: nom · kategoriya · sana · ko'rish / yuklab olish.
 *
 * Ilgari hammasi bitta `limit: 200` so'rovda olinib (backend baribir 100
 * ga qirqadi), kategoriya filtri va sanoqlari klientda hisoblanardi —
 * 100-hujjatdan keyingilari hech qachon ko'rinmasdi. Endi kategoriya
 * ham, sahifa ham serverda; kategoriyalar Swagger enum idan (sanoqsiz —
 * har biri uchun alohida so'rov kerak bo'lardi).
 */
const LIMIT = 20;
const CATEGORIES = ["LAW", "DECISION", "ORDER", "REPORT"];

const fileUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

// Backend faylni asl nomi bilan beradi (Content-Disposition: attachment)
const downloadUrl = (id) => `${BASE_URL}/api/documents/${id}/download`;

export default function Documents() {
  const { t } = useTranslation();
  const { pick, formatDate, formatNumber } = useLocalized();

  const [params, setParams] = useSearchParams();
  const rawCategory = params.get("category") ?? "";
  const category = CATEGORIES.includes(rawCategory) ? rawCategory : "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const { data, isLoading, isFetching, error } = useGetDocumentsQuery({
    page,
    limit: LIMIT,
    category: category || undefined,
  });

  const docs = data?.data ?? [];
  const total = data?.meta?.total;
  const totalPages = data?.meta?.totalPages ?? 1;

  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: !("page" in patch) });
  };

  const setCategory = (value) => update({ category: value, page: "" });
  const catLabel = (key) => (CATEGORIES.includes(key) ? t(`documents.cat.${key}`) : key);

  return (
    <>
      <SEO title={t("documents.heading")} description={t("documents.description")} />

      <PageShell
        breadcrumbs={[{ label: t("documents.heading") }]}
        eyebrow={t("documents.badge")}
        title={t("documents.heading")}
        lede={t("documents.description")}
        meta={
          <PageMeta
            label={category ? catLabel(category) : t("documents.metaTotal")}
            value={total != null ? formatNumber(total) : "—"}
          />
        }
      >
        <div className="grid gap-12 lg:grid-cols-[1fr_220px] lg:gap-16">
          <div>
            {error ? (
              <EmptyState title={t("documents.error")} />
            ) : isLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border-b border-line-soft py-4">
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                ))}
              </div>
            ) : docs.length === 0 ? (
              <EmptyState
                title={t("documents.empty")}
                description={category ? t("documents.emptyCategory") : t("documents.emptyHint")}
                actions={
                  category ? (
                    <Button size="sm" variant="primary" onClick={() => setCategory("")}>
                      {t("documents.all")}
                    </Button>
                  ) : null
                }
              />
            ) : (
              <>
                <Reveal
                  as="ul"
                  className={cx(
                    "flex flex-col border-t border-line transition-opacity duration-1 ease-out-soft",
                    isFetching && "opacity-60",
                  )}
                >
                  {docs.map((doc) => {
                    const href = fileUrl(doc.file_url);
                    const title = pick(doc, "title") || doc.file_name;

                    return (
                      <li key={doc.id} className="flex items-center gap-2 border-b border-line-soft">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="-ml-3 flex min-w-0 flex-1 items-center gap-4 rounded-field py-4 pl-3 pr-2 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
                        >
                          <FileText
                            size={17}
                            strokeWidth={1.8}
                            aria-hidden="true"
                            className="shrink-0 text-gold-dim"
                          />

                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-[0.95rem] font-medium leading-snug text-fg">
                              {title}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-x-4 font-mono text-[0.73rem] text-fg-faint tabular">
                              {doc.category && <span>{catLabel(doc.category)}</span>}
                              {doc.created_at && <span>{formatDate(doc.created_at)}</span>}
                            </span>
                          </span>
                        </a>

                        <a
                          href={downloadUrl(doc.id)}
                          download
                          aria-label={`${t("documents.download")}: ${title}`}
                          title={t("documents.download")}
                          className="-mr-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-field text-fg-faint transition-colors duration-1 ease-out-soft hover:bg-paper-3 hover:text-fg"
                        >
                          <Download size={16} strokeWidth={1.8} aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </Reveal>

                <div className="mt-10">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    disabled={isFetching}
                    onChange={(p) => update({ page: p > 1 ? String(p) : "" })}
                    labels={{
                      nav: t("documents.pagination"),
                      prev: t("media.prevPage"),
                      next: t("media.nextPage"),
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <aside>
            <h2 className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-gold-dim">
              {t("documents.categories")}
            </h2>

            <ul className="mt-4 flex flex-col border-t border-line">
              {["", ...CATEGORIES].map((key) => (
                <li key={key || "all"} className="border-b border-line-soft">
                  <button
                    type="button"
                    onClick={() => setCategory(key)}
                    aria-pressed={category === key}
                    className={cx(
                      "flex w-full items-center justify-between py-2.5 text-left font-sans text-[0.85rem] transition-colors duration-1 ease-out-soft",
                      category === key ? "font-medium text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    <span className="truncate">{key ? catLabel(key) : t("documents.all")}</span>
                    {category === key && (
                      <span aria-hidden="true" className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </PageShell>
    </>
  );
}
