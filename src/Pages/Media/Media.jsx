import { useState } from "react";
import { Image as ImageIcon, Play, Presentation } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetMediaAlbumsQuery } from "../../store/services/media";
import { BASE_URL } from "../../store/api";
import { useLocalized } from "../../lib/useLocalized";
import { Badge, Button, Card, EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell } from "../../patterns";
import SEO from "../../seo/SEO";

/**
 * Media galereyasi — /media
 *
 * Audit topilmasi: bu sahifa MAVJUD EMAS edi. Admin panelda media
 * albomlari boshqariladi, bosh sahifada media bo'limi bor, footer da
 * havola izohga olingan — lekin ochiladigan public sahifa yo'q edi.
 * Ya'ni kutubxona yuklagan barcha albomlar faqat bosh sahifadagi
 * karuseldan ko'rinardi.
 *
 * Lightbox va albom ichidagi navigatsiya 5-bosqichda boyitiladi.
 */

const TYPES = {
  PHOTO: { icon: ImageIcon, tone: "lapis", label: "media.type.photo" },
  VIDEO: { icon: Play, tone: "clay", label: "media.type.video" },
  PRESENTATION: { icon: Presentation, tone: "olive", label: "media.type.presentation" },
};

const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const LIMIT = 12;

export default function Media() {
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error } = useGetMediaAlbumsQuery({
    page,
    limit: LIMIT,
    type: type || undefined,
  });

  // Endpoint `is_public` parametrini qabul qilmaydi (media.js dagi query
  // ni qarang) — shuning uchun yopiq albomlar mijoz tomonida ajratiladi.
  // Aks holda admin hali chop etmagan albom public saytda ko'rinardi.
  const albums = (data?.data ?? data?.records ?? []).filter(
    (a) => a.is_public !== false,
  );
  const total = data?.meta?.total;
  const totalPages = data?.meta?.totalPages ?? 1;

  const changeType = (next) => {
    setType(next);
    setPage(1);
  };

  return (
    <>
      <SEO title={t("media.heading")} description={t("media.description")} />

      <PageShell
        breadcrumbs={[{ label: t("nav.media") }]}
        eyebrow={t("media.badge")}
        title={t("media.heading")}
        lede={t("media.description")}
        meta={
          <>
            <PageMeta label={t("media.metaAlbums")} value={total ?? "—"} />
            <PageMeta label={t("media.metaShown")} value={albums.length || "—"} />
          </>
        }
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={type === "" ? "primary" : "ghost"}
              onClick={() => changeType("")}
            >
              {t("media.all")}
            </Button>
            {Object.entries(TYPES).map(([key, cfg]) => (
              <Button
                key={key}
                size="sm"
                variant={type === key ? "primary" : "ghost"}
                onClick={() => changeType(key)}
              >
                {t(cfg.label)}
              </Button>
            ))}
          </div>
        }
      >
        {error ? (
          <EmptyState
            title={t("media.error")}
            description={t("media.errorHint")}
            actions={
              <Button size="sm" variant="primary" onClick={() => window.location.reload()}>
                {t("media.retry")}
              </Button>
            }
          />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[4/3] w-full" rounded="card" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <EmptyState
            title={t("media.empty")}
            description={t("media.emptyHint")}
            actions={
              type ? (
                <Button size="sm" variant="primary" onClick={() => changeType("")}>
                  {t("media.all")}
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => {
                const cfg = TYPES[album.type] ?? TYPES.PHOTO;
                const Icon = cfg.icon;
                const cover = mediaUrl(album.cover_image || album.cover_url || album.items?.[0]?.url);
                const count = album.items?.length ?? 0;

                return (
                  <Card
                    key={album.id}
                    interactive
                    to={`/media/${album.id}`}
                    className="overflow-hidden"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden bg-ink-deep">
                      {cover ? (
                        <img
                          src={cover}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        // Muqova yo'q — kulrang ikonka o'rniga naqshli zamin
                        <span aria-hidden="true" className="girih-tile absolute inset-0" />
                      )}

                      <span className="absolute left-3 top-3">
                        <Badge tone={cfg.tone}>
                          <Icon size={11} strokeWidth={2} />
                          {t(cfg.label)}
                        </Badge>
                      </span>
                    </span>

                    <span className="block p-4">
                      <span className="block font-display text-[1rem] font-semibold leading-snug text-fg">
                        {pick(album, "title") || t("media.untitled")}
                      </span>

                      <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.74rem] text-fg-faint tabular">
                        {count > 0 && <span>{t("media.itemCount", { count })}</span>}
                        {album.created_at && <span>{formatDate(album.created_at)}</span>}
                      </span>
                    </span>
                  </Card>
                );
              })}
            </Reveal>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                >
                  {t("media.prevPage")}
                </Button>

                <span className="font-mono text-[0.8rem] text-fg-muted tabular">
                  {page} / {totalPages}
                </span>

                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                >
                  {t("media.nextPage")}
                </Button>
              </div>
            )}
          </>
        )}
      </PageShell>
    </>
  );
}
