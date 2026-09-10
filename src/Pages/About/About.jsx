import { useTranslation } from "react-i18next";

import CmsPage from "../Cms/CmsPage";
import { SEO_CONFIG } from "../../seo/seoConfig";

export default function About() {
  const { t } = useTranslation();

  return (
    <CmsPage
      slug="ABOUT"
      seo={SEO_CONFIG.about}
      fallbackTitle={t("header.about")}
      breadcrumbLabel={t("header.about")}
    />
  );
}
