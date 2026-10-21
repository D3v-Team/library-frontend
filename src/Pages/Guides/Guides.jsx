import { Download, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../../lib/cx";
import { useLocalized } from "../../lib/useLocalized";
import { useGetGuidesQuery } from "../../store/services/guides.api";
import { BASE_URL } from "../../store/api";
import { EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell, Pagination } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

/**
 * Qo'llanmalar — PDF formatdagi qo'llanmalar (backend: GET /guides).
 *
 * Hujjatlar sahifasi bilan bir xil ro'yxat: nom + tavsif + hajm,
 * nom bosilsa PDF yangi tabda ochiladi, o'ngda yuklab olish. Sahifalash
 * serverda (`?page=`).
 */
const LIMIT = 20;

const fileUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

// Javob shakli Swagger da yozilmagan — hujjatlar modulidagi nomlar va
// ehtimoliy muqobillari
const guideFile = (guide) => fileUrl(guide.file_url || guide.file_path || guide.file);

const formatSize = (bytes) => {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Guides() {
  const { t } = useTranslation();
  const { pick, formatNumber } = useLocalized();

  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);

  const { data, isLoading, isFetching, error } = useGetGuidesQuery({ page, limit: LIMIT });

  const guides = data?.data ?? [];
  const total = data?.meta?.total;
  const totalPages = data?.meta?.totalPages ?? 1;

  const goPage = (p) => {
    const next = new URLSearchParams(params);
    if (p > 1) next.set("page", String(p));
    else next.delete("page");
    setParams(next);
  };

  return (
    <>
      <SEO {...SEO_CONFIG.guides} />

      <PageShell
        breadcrumbs={[{ label: t("guides.heading") }]}
        eyebrow={t("guides.badge")}
        title={t("guides.heading")}
        lede={t("guides.description")}
        meta={<PageMeta label={t("guides.metaTotal")} value={total != null ? formatNumber(total) : "—"} />}
      >
        <div className="max-w-4xl">
          {error ? (
            <EmptyState title={t("guides.error")} />
          ) : isLoading ? (
            <div className="flex flex-col">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-line-soft py-5">
                  <Skeleton className="h-11 w-11 shrink-0" rounded="card" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : guides.length === 0 ? (
            <EmptyState title={t("guides.empty")} description={t("guides.emptyHint")} />
          ) : (
            <>
              <Reveal
                as="ul"
                className={cx(
                  "flex flex-col border-t border-line transition-opacity duration-1 ease-out-soft",
                  isFetching && "opacity-60",
                )}
              >
                {guides.map((guide) => {
                  const href = guideFile(guide);
                  const name = pick(guide, "name") || guide.file_name;
                  const description = pick(guide, "description");
                  const size = formatSize(guide.file_size);

                  return (
                    <li key={guide.id} className="flex items-center gap-2 border-b border-line-soft">
                      <a
                        href={href ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="-ml-3 flex min-w-0 flex-1 items-start gap-4 rounded-field py-5 pl-3 pr-2 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
                      >
                        {/* PDF varag'i */}
                        <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-card border border-line bg-page text-gold-dim">
                          <FileText size={17} strokeWidth={1.8} aria-hidden="true" />
                          <span className="mt-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.08em]">
                            PDF
                          </span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[1rem] font-medium leading-snug text-fg">
                            {name}
                          </span>
                          {description && (
                            <span className="mt-1 block line-clamp-2 font-sans text-[0.85rem] leading-relaxed text-fg-muted">
                              {description}
                            </span>
                          )}
                          {size && (
                            <span className="mt-1.5 block font-mono text-[0.72rem] text-fg-faint tabular">{size}</span>
                          )}
                        </span>
                      </a>

                      {href && (
                        <a
                          href={href}
                          download
                          aria-label={`${t("guides.download")}: ${name}`}
                          title={t("guides.download")}
                          className="-mr-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-field text-fg-faint transition-colors duration-1 ease-out-soft hover:bg-paper-3 hover:text-fg"
                        >
                          <Download size={16} strokeWidth={1.8} aria-hidden="true" />
                        </a>
                      )}
                    </li>
                  );
                })}
              </Reveal>

              <div className="mt-10">
                <Pagination page={page} totalPages={totalPages} disabled={isFetching} onChange={goPage} />
              </div>
            </>
          )}
        </div>
      </PageShell>
    </>
  );
}
