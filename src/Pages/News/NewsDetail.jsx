import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { HOME_NEWS_ARGS, useGetNewsByIdQuery, useGetNewsQuery } from "../../store/services/news.api";
import { Button, EmptyState, Skeleton } from "../../ui";
import { MountedImage, PageMeta, PageShell, Prose, SectionHeader } from "../../patterns";
import SEO from "../../seo/SEO";
import EventGallery from "../Events/EventGallery";
import { newsCover, newsDate, plainText } from "./newsHelpers";

/** Yangilik — kungi faoliyatdan fotolavhalar, izoh matni va boshqa yangiliklar */
export default function NewsDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const { data, isLoading, error } = useGetNewsByIdQuery(id);
  // Bosh sahifadagi blok bilan bir xil argument — umumiy kesh
  const others = useGetNewsQuery(HOME_NEWS_ARGS);

  const item = data?.data ?? data;
  const rest = (others.data?.data ?? []).filter((n) => n.id !== id).slice(0, 4);
  const crumbs = [{ label: t("news.heading"), to: "/news" }];

  if (isLoading) {
    return (
      <PageShell breadcrumbs={crumbs} title={t("news.loading")}>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[340px] w-full" rounded="card" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </PageShell>
    );
  }

  if (error || !item) {
    return (
      <PageShell breadcrumbs={crumbs} title={t("news.notFound")}>
        <EmptyState
          title={t("news.notFound")}
          description={t("news.notFoundHint")}
          actions={
            <Button size="sm" variant="primary" to="/news">
              {t("news.back")}
            </Button>
          }
        />
      </PageShell>
    );
  }

  const title = pick(item, "title");
  const cover = newsCover(item);
  const hasGallery = item.images?.length > 1;

  return (
    <>
      <SEO title={title} description={plainText(pick(item, "content")).slice(0, 160)} image={cover} />

      <PageShell
        breadcrumbs={[...crumbs, { label: title }]}
        eyebrow={t("news.category")}
        title={title}
        meta={<PageMeta label={t("news.published")} value={formatDate(newsDate(item)) ?? "—"} />}
      >
        {/* Fotolar — postning asosiy mazmuni, matn ularga izoh.
            Galereya bo'lsa muqova alohida ko'rsatilmaydi: asosiy rasm
            galereyaning ichida. */}
        {hasGallery ? (
          <div className="mb-10">
            <EventGallery images={item.images} title={title} />
          </div>
        ) : (
          cover && <MountedImage src={cover} maxHeight={420} className="mb-9" />
        )}

        <Prose html={pick(item, "content")} />

        <div className="mt-12">
          <Button variant="secondary" to="/news" iconStart={<ArrowLeft size={16} />}>
            {t("news.back")}
          </Button>
        </div>

        {rest.length > 0 && (
          <div className="mt-20 border-t border-line pt-14">
            <SectionHeader eyebrow={t("news.more")} title={t("news.moreTitle")} />

            <ul className="mt-8 grid gap-x-10 border-t border-line sm:grid-cols-2">
              {rest.map((n) => (
                <li key={n.id} className="border-b border-line-soft">
                  <Link
                    to={`/news/${n.id}`}
                    className="-mx-3 block rounded-field px-3 py-4 transition-colors duration-1 ease-out-soft hover:bg-paper-3"
                  >
                    <p className="font-mono text-[0.72rem] text-fg-faint tabular">{formatDate(newsDate(n))}</p>
                    <p className="mt-1 line-clamp-2 font-display text-[0.95rem] font-medium leading-snug text-fg">
                      {pick(n, "title")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageShell>
    </>
  );
}
