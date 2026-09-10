import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetAnnouncementsQuery } from "../../store/services/announcements.api";
import { BASE_URL } from "../../store/api";
import { EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell, Pagination } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

/**
 * Yangiliklar va e'lonlar ro'yxati.
 *
 * Bu yerda ilgari yon panelda "Arxiv" bo'lib, oylar bo'yicha filtr
 * turgan edi. OLIB TASHLANDI: backend oy bo'yicha filtrlashni
 * qo'llab-quvvatlamaydi, shuning uchun u ro'yxat FAQAT joriy
 * sahifadagi yozuvlardan yasalardi. Ya'ni "sentabr 2026" deb
 * yozilgan bo'lsa ham, u butun arxivni emas, shu 9 yozuvni
 * ko'rsatardi — foydalanuvchini chalg'itadigan nazorat.
 *
 * Backend `?month=` yoki sana oralig'ini qabul qiladigan bo'lsa,
 * arxivni qaytarish oson: filtr URL da (`page` allaqachon shunday).
 */
const LIMIT = 12;

const imageUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

export default function News() {
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);

  const { data, isLoading, isFetching, error } = useGetAnnouncementsQuery({
    page,
    limit: LIMIT,
  });

  const items = (data?.data ?? []).filter((i) => i.is_public !== false);
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
      <SEO {...SEO_CONFIG.news} />

      <PageShell
        breadcrumbs={[{ label: t("announcements.heading") }]}
        eyebrow={t("announcements.title")}
        title={t("announcements.heading")}
        lede={t("announcements.description")}
        meta={<PageMeta label={t("news.metaTotal")} value={total ?? "—"} />}
      >
        {error ? (
          <EmptyState title={t("announcements.error")} />
        ) : isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[16/10] w-full" rounded="card" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title={t("announcements.empty")} />
        ) : (
          <>
            <Reveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id}>
                  <Link to={`/news/${item.id}`} className="group block">
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-card bg-ink-deep">
                      {imageUrl(item.cover_image) ? (
                        <img
                          src={imageUrl(item.cover_image)}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-4 ease-out-soft group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span aria-hidden="true" className="girih-tile absolute inset-0" />
                      )}
                    </span>

                    <p className="mt-4 font-mono text-[0.74rem] uppercase tracking-[0.08em] text-gold-dim tabular">
                      {formatDate(item.published_at)}
                    </p>

                    <hr className="mt-2" />

                    <h2 className="mt-1.5 line-clamp-2 font-display text-[1.05rem] font-semibold leading-snug text-fg transition-colors duration-1 ease-out-soft group-hover:text-accent">
                      {pick(item, "title")}
                    </h2>
                    <hr className="mt-2" />

                    {pick(item, "content") && (
                      <p className="mt-2 line-clamp-2 font-sans text-[0.85rem] leading-relaxed text-fg-muted">
                        {String(pick(item, "content")).replace(/<[^>]*>/g, " ")}
                      </p>
                    )}
                  </Link>
                </article>
              ))}
            </Reveal>.          

            <div className="mt-14">
              <Pagination page={page} totalPages={totalPages} disabled={isFetching} onChange={goPage} />
            </div>
          </>
        )}
      </PageShell>
    </>
  );
}
