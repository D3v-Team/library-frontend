import { useTranslation } from "react-i18next";

import CmsPage from "../Cms/CmsPage";
import { SEO_CONFIG } from "../../seo/seoConfig";

export default function FAQ() {
  const { t } = useTranslation();

  return (
    <CmsPage
      slug="FAQ"
      seo={SEO_CONFIG.faq}
      fallbackTitle={t("header.faq")}
      breadcrumbLabel={t("header.faq")}
    />
  );
}
