import { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetDocumentsQuery } from "../../store/services/documents.api";
import { BASE_URL } from "../../store/api";
import { Button, EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell } from "../../patterns";
import SEO from "../../seo/SEO";

/**
 * Hujjatlar.
 *
 * Jadval ko'rinishida: nom · kategoriya · sana · yuklab olish.
 * Yon panelda kategoriya sanoqlari — "boylik retsepti" ning
 * ikkinchi qatlami.
 */
const fileUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

export default function Documents() {
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";

  const { data, isLoading, error } = useGetDocumentsQuery({ page: 1, limit: 200 });
  /* `?? []` har renderda yangi massiv qaytaradi — uni useMemo
     bog'liqligiga bersak memo hech qachon ishlamaydi. */
  const docs = useMemo(() => data?.data ?? [], [data]);

  /* Kategoriya sanoqlari — bo'sh kategoriya ko'rinmaydi */
  const categories = useMemo(() => {
    const map = new Map();
    for (const d of docs) {
      const key = d.category || "—";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].map(([key, count]) => ({ key, count }));
  }, [docs]);

  const shown = category ? docs.filter((d) => (d.category || "—") === category) : docs;

  const setCategory = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("category", value);
    else next.delete("category");
    setParams(next, { replace: true });
  };

  return (
    <>
      <SEO title={t("documents.heading")} description={t("documents.description")} />

      <PageShell
        breadcrumbs={[{ label: t("documents.heading") }]}
        eyebrow={t("documents.badge")}
        title={t("documents.heading")}
        lede={t("documents.description")}
        meta={
          <>
            <PageMeta label={t("documents.metaTotal")} value={docs.length || "—"} />
            <PageMeta label={t("documents.metaCategories")} value={categories.length || "—"} />
          </>
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
            ) : shown.length === 0 ? (
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
              <Reveal as="ul" className="flex flex-col border-t border-line">
                {shown.map((doc) => {
                  const href = fileUrl(doc.file_url);
                  const title = pick(doc, "title");

                  return (
                    <li key={doc.id} className="border-b border-line-soft">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="-mx-3 flex items-center gap-4 rounded-field px-3 py-4 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
                      >
                        <FileText
                          size={17}
                          strokeWidth={1.8}
                          aria-hidden="true"
                          className="shrink-0 text-gold-dim"
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[0.95rem] font-medium leading-snug text-fg">
                            {title || doc.file_name}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-4 font-mono text-[0.73rem] text-fg-faint tabular">
                            {doc.category && <span>{doc.category}</span>}
                            {doc.created_at && <span>{formatDate(doc.created_at)}</span>}
                          </span>
                        </span>

                        <Download
                          size={16}
                          strokeWidth={1.8}
                          aria-hidden="true"
                          className="shrink-0 text-fg-faint"
                        />
                      </a>
                    </li>
                  );
                })}
              </Reveal>
            )}
          </div>

          {categories.length > 1 && (
            <aside>
              <h2 className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-gold-dim">
                {t("documents.categories")}
              </h2>

              <ul className="mt-4 flex flex-col border-t border-line">
                <li className="border-b border-line-soft">
                  <button
                    type="button"
                    onClick={() => setCategory("")}
                    className={`flex w-full items-center justify-between py-2.5 text-left font-sans text-[0.85rem] transition-colors duration-1 ease-out-soft ${
                      category === "" ? "text-fg" : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    {t("documents.all")}
                    <span className="font-mono text-[0.74rem] text-fg-faint tabular">
                      {docs.length}
                    </span>
                  </button>
                </li>

                {categories.map((c) => (
                  <li key={c.key} className="border-b border-line-soft">
                    <button
                      type="button"
                      onClick={() => setCategory(c.key)}
                      className={`flex w-full items-center justify-between py-2.5 text-left font-sans text-[0.85rem] transition-colors duration-1 ease-out-soft ${
                        category === c.key ? "text-fg" : "text-fg-muted hover:text-fg"
                      }`}
                    >
                      <span className="truncate">{c.key}</span>
                      <span className="ml-2 shrink-0 font-mono text-[0.74rem] text-fg-faint tabular">
                        {c.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </PageShell>
    </>
  );
}
