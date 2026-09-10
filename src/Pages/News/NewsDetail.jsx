import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import {
  useGetAnnouncementByIdQuery,
  useGetAnnouncementsQuery,
} from "../../store/services/announcements.api";
import { BASE_URL } from "../../store/api";
import { Button, EmptyState, Skeleton } from "../../ui";
import { MountedImage, PageMeta, PageShell, Prose, SectionHeader } from "../../patterns";
import SEO from "../../seo/SEO";

const imageUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

/** Yangilik sahifasi — ostida boshqa yangiliklar (berk ko'cha bo'lmaydi) */
export default function NewsDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const { data, isLoading, error } = useGetAnnouncementByIdQuery(id);
  const others = useGetAnnouncementsQuery({ page: 1, limit: 6 });

  const item = data?.data ?? data;
  const rest = (others.data?.data ?? []).filter((n) => n.id !== id).slice(0, 4);

  if (isLoading) {
    return (
      <PageShell breadcrumbs={[{ label: t("announcements.heading"), to: "/news" }]} title={t("announcements.loading")}>
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
      <PageShell breadcrumbs={[{ label: t("announcements.heading"), to: "/news" }]} title={t("announcements.notFound")}>
        <EmptyState
          title={t("announcements.notFound")}
          description={t("news.notFoundHint")}
          actions={
            <Button size="sm" variant="primary" to="/news">
              {t("announcements.back")}
            </Button>
          }
        />
      </PageShell>
    );
  }

  const title = pick(item, "title");
  const cover = imageUrl(item.cover_image);

  return (
    <>
      <SEO title={title} description={String(pick(item, "content") ?? "").replace(/<[^>]*>/g, " ").slice(0, 160)} image={cover} />

      <PageShell
        breadcrumbs={[{ label: t("announcements.heading"), to: "/news" }, { label: title }]}
        eyebrow={t("announcements.category")}
        title={title}
        meta={<PageMeta label={t("news.published")} value={formatDate(item.published_at) ?? "—"} />}
      >
        {cover && <MountedImage src={cover} maxHeight={340} className="mb-9" />}

        <Prose html={pick(item, "content")} />

        <div className="mt-12">
          <Button variant="secondary" to="/news" iconStart={<ArrowLeft size={16} />}>
            {t("announcements.back")}
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
                    <p className="font-mono text-[0.72rem] text-fg-faint tabular">
                      {formatDate(n.published_at)}
                    </p>
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
