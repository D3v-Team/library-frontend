import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../../lib/useLocalized";
import { useGetAnnouncementsQuery } from "../../../store/services/announcements.api";
import { BASE_URL } from "../../../store/api";
import { Button, EmptyState, Reveal, Skeleton } from "../../../ui";
import { SectionHeader } from "../../../patterns";

/**
 * 04 — E'lonlar va yangiliklar. Redaksion tuzilma.
 *
 * Audit topilmasi: eski blok e'lonlarni 3 sekundda AVTOMATIK
 * almashtiradigan karusel edi — matnni o'qiyotgan odam uni yo'qotardi.
 * Bundan tashqari hamma e'lon bir xil vaznda ko'rinardi.
 *
 * Endi haqiqiy ierarxiya: bitta yetakchi yangilik (rasm + lid) va
 * yonida ixcham qatorlar (sana + sarlavha). Avtomatik almashinuv yo'q.
 */
const imageUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function NewsEditorial() {
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const { data, isLoading, error } = useGetAnnouncementsQuery({ page: 1, limit: 5 });

  const items = (data?.data ?? []).filter((i) => i.is_public !== false);
  const [lead, ...rest] = items;

  return (
    <section className="mx-auto w-full max-w-container px-gut py-16 sm:py-20">
      <SectionHeader
        eyebrow={t("announcements.title")}
        title={t("announcements.heading")}
        lede={t("announcements.description")}
        action={
          <Button variant="secondary" to="/news" iconEnd={<ArrowRight size={16} />}>
            {t("home.news.all")}
          </Button>
        }
      />

      <div className="mt-10">
        {error ? (
          <EmptyState title={t("announcements.error")} />
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
          <EmptyState title={t("announcements.empty")} />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            {/* ---------- Yetakchi yangilik ---------- */}
            <article>
              {/* `u-lift` ATAYLAB yo'q: zamini va paddingi bo'lmagan blokda
                  ko'tarilish soyasi matn atrofida osilib qolar va kartochka
                  konteyner chekkasiga yopishib ko'rinardi. O'rniga rasm
                  yengil kattalashadi va sarlavha rangi o'zgaradi — javob
                  bor, lekin layout qimirlamaydi. */}
              <Link to={`/news/${lead.id}`} className="group block">
                <span className="relative block aspect-[16/9] overflow-hidden rounded-card bg-ink-deep">
                  {imageUrl(lead.cover_image) ? (
                    <img
                      src={imageUrl(lead.cover_image)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-4 ease-out-soft group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span aria-hidden="true" className="girih-tile absolute inset-0" />
                  )}
                </span>

                <p className="mt-5 font-mono text-[0.74rem] uppercase tracking-[0.09em] text-gold-dim tabular">
                  {formatDate(lead.published_at)}
                </p>

                <h3 className="mt-2 font-display text-h3 font-semibold leading-snug text-fg transition-colors duration-1 ease-out-soft group-hover:text-accent">
                  {pick(lead, "title")}
                </h3>

                {pick(lead, "content") && (
                  <p className="mt-3 line-clamp-3 max-w-measure font-sans text-[0.9rem] leading-relaxed text-fg-muted">
                    {/* CMS dan HTML kelishi mumkin — teglarni olib tashlaymiz */}
                    {String(pick(lead, "content")).replace(/<[^>]*>/g, " ")}
                  </p>
                )}
              </Link>
            </article>

            {/* ---------- Ixcham qatorlar ---------- */}
            {rest.length > 0 && (
              <Reveal as="ul" className="flex flex-col border-t border-line-soft">
                {rest.map((item) => (
                  <li key={item.id} className="border-b border-line-soft">
                    <Link
                      to={`/news/${item.id}`}
                      className="-mx-3 block rounded-field px-3 py-4 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
                    >
                      <p className="font-mono text-[0.72rem] text-fg-faint tabular">
                        {formatDate(item.published_at)}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-display text-[0.98rem] font-medium leading-snug text-fg">
                        {pick(item, "title")}
                      </h3>
                    </Link>
                  </li>
                ))}
              </Reveal>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
