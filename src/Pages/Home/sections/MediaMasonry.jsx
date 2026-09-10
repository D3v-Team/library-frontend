import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../../../lib/cx";
import { useLocalized } from "../../../lib/useLocalized";
import { useGetMediaAlbumsQuery } from "../../../store/services/media";
import { BASE_URL } from "../../../store/api";
import { Button, EmptyState, Reveal, Skeleton } from "../../../ui";
import { SectionHeader } from "../../../patterns";

/**
 * 07 — Media galereya. Masonry teaser.
 *
 * Audit topilmasi: eski blok karusel edi. Galereyani odam ko'z bilan
 * SKANERLAYDI — bir vaqtda bittasini ko'rsatish galereyaning
 * ma'nosini yo'qotadi.
 *
 * Endi notekis balandlikdagi plitkalar, birinchisi katta. To'liq
 * galereya va lightbox — /media sahifasida (3-bosqichda qurildi).
 */
const imageUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function MediaMasonry() {
  const { t } = useTranslation();
  const { pick } = useLocalized();

  const { data, isLoading, error } = useGetMediaAlbumsQuery({ page: 1, limit: 5 });

  const albums = (data?.data ?? data?.records ?? []).filter((a) => a.is_public !== false);

  return (
    <section className="mx-auto w-full max-w-container px-gut py-16 sm:py-20">
      <SectionHeader
        eyebrow={t("media.badge")}
        title={t("media.heading")}
        lede={t("media.description")}
        action={
          <Button variant="secondary" to="/media" iconEnd={<ArrowRight size={16} />}>
            {t("media.all")}
          </Button>
        }
      />

      <div className="mt-10">
        {error ? (
          <EmptyState title={t("media.error")} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4 auto-rows-[120px] sm:auto-rows-[150px] lg:grid-cols-4 lg:auto-rows-[170px]">
            <Skeleton className="col-span-2 row-span-2 h-full w-full" rounded="card" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-full w-full" rounded="card" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <EmptyState title={t("media.empty")} />
        ) : (
          /* Qatorlar balandligi ANIQ px da belgilanadi (`auto-rows`).
             Ilgari katta plitka `sm:aspect-auto` edi va balandligini
             rasmning O'Z o'lchamidan olardi — portret muqova tushsa
             plitka cho'zilib ketar, u 2 qatorni egallagani uchun
             qolgan plitkalarning oralig'i ham ochilib ketardi.
             Endi balandlik gridda qat'iy: rasm `object-cover` bilan
             plitkaga moslanadi, ortiqchasi kesiladi. */
          <Reveal className="grid grid-cols-2 gap-4 auto-rows-[120px] sm:auto-rows-[150px] lg:grid-cols-4 lg:auto-rows-[170px]">
            {albums.map((album, i) => {
              const cover = imageUrl(album.cover_image || album.items?.[0]?.url);
              const isVideo = album.type === "VIDEO";
              // Birinchi plitka katta — masonry ohangi
              const big = i === 0;

              return (
                <Link
                  key={album.id}
                  to={`/media/${album.id}`}
                  className={cx(
                    "group relative block overflow-hidden rounded-card bg-ink-deep u-lift",
                    // Balandlik gridning qatoridan keladi — aspect-ratio yo'q
                    big && "col-span-2 row-span-2",
                  )}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-4 ease-out-soft group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span aria-hidden="true" className="girih-tile absolute inset-0" />
                  )}

                  {isVideo && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-on-ink/40 bg-ink-deep/60 text-gold backdrop-blur-sm">
                        <Play size={20} strokeWidth={2} className="translate-x-0.5" />
                      </span>
                    </span>
                  )}

                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-deep via-ink-deep/60 to-transparent p-4 pt-12">
                    <span
                      className={cx(
                        "block line-clamp-2 font-display font-medium leading-snug text-on-ink",
                        big ? "text-[1.05rem]" : "text-[0.88rem]",
                      )}
                    >
                      {pick(album, "title") || t("media.untitled")}
                    </span>
                  </span>
                </Link>
              );
            })}
          </Reveal>
        )}
      </div>
    </section>
  );
}
