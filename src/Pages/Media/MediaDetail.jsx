import { Image as ImageIcon, Play, Presentation } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetMediaAlbumByIdQuery } from "../../store/services/media";
import { BASE_URL } from "../../store/api";
import { useLocalized } from "../../lib/useLocalized";
import { Badge, Button, EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell } from "../../patterns";
import SEO from "../../seo/SEO";

/** Albom sahifasi — /media/:id */

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

const isVideo = (item) => {
  const url = item?.url || item?.file_url || "";
  return /\.(mp4|webm|ogg|mov)$/i.test(url) || item?.type === "VIDEO";
};

export default function MediaDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const { data, isLoading, error } = useGetMediaAlbumByIdQuery(id);

  // Endpoint javobi ba'zi joyda { data: {...} }, ba'zida to'g'ridan-to'g'ri obyekt
  const album = data?.data ?? data;
  const items = album?.items ?? [];
  const cfg = TYPES[album?.type] ?? TYPES.PHOTO;
  const TypeIcon = cfg.icon;

  if (isLoading) {
    return (
      <PageShell breadcrumbs={[{ label: t("nav.media"), to: "/media" }]} title={t("media.loading")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full" rounded="card" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (error || !album) {
    return (
      <PageShell breadcrumbs={[{ label: t("nav.media"), to: "/media" }]} title={t("media.notFound")}>
        <EmptyState
          title={t("media.notFound")}
          description={t("media.notFoundHint")}
          actions={
            <Button size="sm" variant="primary" to="/media">
              {t("media.all")}
            </Button>
          }
        />
      </PageShell>
    );
  }

  const title = pick(album, "title") || t("media.untitled");

  return (
    <>
      <SEO title={title} description={t("media.description")} />

      <PageShell
        breadcrumbs={[{ label: t("nav.media"), to: "/media" }, { label: title }]}
        eyebrow={t(cfg.label)}
        title={title}
        meta={
          <>
            <PageMeta label={t("media.metaItems")} value={items.length || "—"} />
            <PageMeta label={t("media.metaDate")} value={formatDate(album.created_at) ?? "—"} />
          </>
        }
        actions={
          <Badge tone={cfg.tone}>
            <TypeIcon size={11} strokeWidth={2} />
            {t(cfg.label)}
          </Badge>
        }
      >
        {items.length === 0 ? (
          <EmptyState
            title={t("media.emptyAlbum")}
            description={t("media.emptyAlbumHint")}
            actions={
              <Button size="sm" variant="primary" to="/media">
                {t("media.all")}
              </Button>
            }
          />
        ) : (
          <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => {
              const url = mediaUrl(item.url || item.file_url || item.path);
              if (!url) return null;

              return (
                <figure
                  key={item.id ?? i}
                  className="overflow-hidden rounded-card border border-line bg-ink-deep"
                >
                  {isVideo(item) ? (
                    <video
                      src={url}
                      controls
                      preload="metadata"
                      className="block aspect-[4/3] w-full bg-ink-deep object-cover"
                    />
                  ) : (
                    <img
                      src={url}
                      alt={pick(item, "title") || ""}
                      loading="lazy"
                      className="block aspect-[4/3] w-full object-cover"
                    />
                  )}

                  {pick(item, "title") && (
                    <figcaption className="bg-paper-2 px-4 py-3 font-sans text-[0.82rem] text-fg-muted">
                      {pick(item, "title")}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </Reveal>
        )}
      </PageShell>
    </>
  );
}
