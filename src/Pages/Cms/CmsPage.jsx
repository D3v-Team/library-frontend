import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetPageBySlugQuery } from "../../store/services/pages";
import { Button, EmptyState, Skeleton } from "../../ui";
import { PageMeta, PageShell, Prose } from "../../patterns";
import SEO from "../../seo/SEO";

/**
 * Admin panelda yoziladigan matnli sahifalar uchun yagona qobiq.
 *
 * Audit topilmasi: About, FAQ va Maxfiylik siyosati uchta alohida
 * fayl edi, lekin uchtasi ham AYNAN bir xil ish qilardi — slug
 * bo'yicha sahifani olib, HTML ni chiqarish. Har birida til tanlash
 * mantiqi, yuklanish skeleti va xato holati qo'lda takrorlangan
 * (jami ~350 qator uch nusxada).
 *
 * Endi bitta komponent, uch route uni slug bilan chaqiradi.
 */
export default function CmsPage({ slug, seo, fallbackTitle, breadcrumbLabel }) {
  const { t } = useTranslation();
  const { pick, formatDate } = useLocalized();

  const { data: page, isLoading, error } = useGetPageBySlugQuery(slug);

  const title = pick(page, "title") || fallbackTitle;
  const content = pick(page, "content");

  if (isLoading) {
    return (
      <PageShell breadcrumbs={[{ label: breadcrumbLabel }]} title={fallbackTitle}>
        <div className="flex max-w-measure flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4" style={{ width: i % 3 === 2 ? "70%" : "100%" }} />
          ))}
        </div>
      </PageShell>
    );
  }

  if (error || !content) {
    return (
      <>
        <SEO {...seo} />
        <PageShell breadcrumbs={[{ label: breadcrumbLabel }]} title={title}>
          <EmptyState
            title={error ? t("cms.error") : t("cms.empty")}
            description={error ? t("cms.errorHint") : t("cms.emptyHint")}
            actions={
              <>
                <Button size="sm" variant="primary" to="/">
                  {t("header.home")}
                </Button>
                <Button size="sm" variant="secondary" to="/contact">
                  {t("header.contact")}
                </Button>
              </>
            }
          />
        </PageShell>
      </>
    );
  }

  return (
    <>
      <SEO {...seo} title={title} />

      <PageShell
        breadcrumbs={[{ label: breadcrumbLabel }]}
        title={title}
        meta={
          page?.updated_at ? (
            <PageMeta label={t("cms.updated")} value={formatDate(page.updated_at)} />
          ) : null
        }
      >
        <Prose html={content} />
      </PageShell>
    </>
  );
}
