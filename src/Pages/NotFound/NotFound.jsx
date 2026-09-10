import { useTranslation } from "react-i18next";

import { Button, EmptyState } from "../../ui";
import { PageShell } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

/** 404 — chiqish yo'li bilan, jim ekran emas */
export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <SEO {...SEO_CONFIG.notFound} />

      <PageShell eyebrow="404" title={t("notFound.heading")} lede={t("notFound.description")}>
        <EmptyState
          title={t("notFound.title")}
          description={t("notFound.hint")}
          actions={
            <>
              <Button size="sm" variant="primary" to="/">
                {t("header.home")}
              </Button>
              <Button size="sm" variant="secondary" to="/books">
                {t("books.heading")}
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
