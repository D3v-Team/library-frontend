import { useTranslation } from "react-i18next";

import { Button, EmptyState } from "../../ui";
import { PageShell } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

/** 403 — ruxsat yo'q */
export default function Forbidden() {
  const { t } = useTranslation();

  return (
    <>
      <SEO {...SEO_CONFIG.forbidden} />

      <PageShell eyebrow="403" title={t("forbidden.heading")} lede={t("forbidden.description")}>
        <EmptyState
          title={t("forbidden.title")}
          description={t("forbidden.hint")}
          actions={
            <>
              <Button size="sm" variant="primary" to="/">
                {t("header.home")}
              </Button>
              <Button size="sm" variant="secondary" to="/login">
                {t("forbidden.login")}
              </Button>
            </>
          }
        />
      </PageShell>
    </>
  );
}
