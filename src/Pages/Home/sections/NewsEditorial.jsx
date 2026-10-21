import { ArrowRight, Images } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../../lib/useLocalized";
import { HOME_NEWS_ARGS, useGetNewsQuery } from "../../../store/services/news.api";
import { Button, EmptyState, Reveal, Skeleton } from "../../../ui";
import { SectionHeader } from "../../../patterns";
import { newsCover, newsDate, photoCount, plainText } from "../../News/newsHelpers";

/**
 * 03 — Yangiliklar: kutubxonaning har kungi faoliyatidan fotolavhalar
 * (backend: GET /news).
 *
 * Bitta yetakchi post (katta foto + lid) va yonida ixcham qatorlar
 * (kichik foto + sana + sarlavha). Avtomatik almashinuv yo'q — o'qiyotgan odam
 * matnni yo'qotmaydi.
 */
export default function NewsEditorial() {
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const { data, isLoading, error } = useGetNewsQuery(HOME_NEWS_ARGS);

  const items = data?.data ?? [];
  const [lead, ...rest] = items;
  const leadCover = lead ? newsCover(lead) : null;
  const leadText = lead ? plainText(pick(lead, "content")) : "";

  return (
    <section className="mx-auto w-full max-w-container px-gut py-16 sm:py-20">
      <SectionHeader
        eyebrow={t("news.title")}
        title={t("news.heading")}
        lede={t("news.description")}
        action={
          <Button variant="secondary" to="/news" iconEnd={<ArrowRight size={16} />}>
            {t("home.news.all")}
          </Button>
        }
      />

      <div className="mt-10">
        {error ? (
          <EmptyState title={t("news.error")} />
        ) : isLoading ? (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-4">
              <Skeleton className="aspect-[16/9] w-full" rounded="card" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-full" />
            </div>
            <div className="flex flex-col gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <EmptyState title={t("news.empty")} />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            {/* ---------- Yetakchi yangilik ---------- */}
            <article>
              <Link to={`/news/${lead.id}`} className="group block">
                <span className="relative block aspect-[16/9] overflow-hidden rounded-card bg-ink-deep">
                  {leadCover ? (
                    <img
                      src={leadCover}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-4 ease-out-soft group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span aria-hidden="true" className="girih-tile absolute inset-0" />
                  )}

                  {photoCount(lead) > 1 && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-field bg-ink-deep/75 px-2 py-1 font-mono text-[0.72rem] text-white tabular backdrop-blur-sm">
                      <Images size={13} strokeWidth={1.8} aria-hidden="true" />
                      {t("news.photos", { count: photoCount(lead) })}
                    </span>
                  )}
                </span>

                <p className="mt-5 font-mono text-[0.74rem] uppercase tracking-[0.09em] text-gold-dim tabular">
                  {formatDate(newsDate(lead))}
                </p>

                <h3 className="mt-2 font-display text-h3 font-semibold leading-snug text-fg transition-colors duration-1 ease-out-soft group-hover:text-accent">
                  {pick(lead, "title")}
                </h3>

                {leadText && (
                  <p className="mt-3 line-clamp-3 max-w-measure font-sans text-[0.9rem] leading-relaxed text-fg-muted">
                    {leadText}
                  </p>
                )}
              </Link>
            </article>

            {/* ---------- Ixcham qatorlar ---------- */}
            {rest.length > 0 && (
              <Reveal as="ul" className="flex flex-col border-t border-line-soft">
                {rest.map((item) => {
                  const thumb = newsCover(item);
                  return (
                    <li key={item.id} className="border-b border-line-soft">
                      <Link
                        to={`/news/${item.id}`}
                        className="-mx-3 flex items-center gap-4 rounded-field px-3 py-3.5 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
                      >
                        <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-field bg-ink-deep">
                          {thumb ? (
                            <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                          ) : (
                            <span aria-hidden="true" className="girih-tile absolute inset-0" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono text-[0.72rem] text-fg-faint tabular">
                            {formatDate(newsDate(item))}
                          </span>
                          <span className="mt-1 block line-clamp-2 font-display text-[0.98rem] font-medium leading-snug text-fg">
                            {pick(item, "title")}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </Reveal>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
