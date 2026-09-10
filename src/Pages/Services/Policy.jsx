import { useTranslation } from "react-i18next";

import CmsPage from "../Cms/CmsPage";
import { SEO_CONFIG } from "../../seo/seoConfig";

export default function Policy() {
  const { t } = useTranslation();

  return (
    <CmsPage
      slug="PRIVACY_POLICY"
      seo={SEO_CONFIG.privacy}
      fallbackTitle={t("header.privacy")}
      breadcrumbLabel={t("header.privacy")}
    />
  );
}
