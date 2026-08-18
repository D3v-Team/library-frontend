// src/seo/SEO.jsx
//
// Har bir sahifa ichida chaqiriladigan yagona, qayta ishlatiladigan
// SEO komponenti. title / description / keywords / Open Graph /
// Twitter Card teglarini react-helmet-async orqali <head> ichiga yozadi.
//
// Foydalanish:
//   import SEO from "../../seo/SEO";
//   import { SEO_CONFIG } from "../../seo/seoConfig";
//
//   <SEO {...SEO_CONFIG.news} />
//
// Dinamik sahifalarda esa API'dan kelgan title/description/image bilan:
//   <SEO
//     title={news.title_latin}
//     description={truncateForMeta(news.content_latin)}
//     image={resolveSeoImage(news.cover_image)}
//     type="article"
//   />

import { Helmet } from "react-helmet-async";
import {
  DEFAULT_LOCALE,
  DEFAULT_OG_IMAGE,
  DEFAULT_TWITTER_SITE,
  SITE_NAME,
  getSiteUrl,
} from "./seoConfig";

export default function SEO({
  title,
  description,
  keywords,
  image,
  path,
  type = "website",
  noIndex = false,
  publishedTime,
  modifiedTime,
  jsonLd,
}) {
  const siteUrl = getSiteUrl();

  const resolvedPath =
    path || (typeof window !== "undefined" ? window.location.pathname : "/");

  const canonicalUrl = `${siteUrl}${resolvedPath}`;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  const metaImage = image
    ? image.startsWith("http")
      ? image
      : `${siteUrl}${image}`
    : `${siteUrl}${DEFAULT_OG_IMAGE}`;

  const keywordsContent = Array.isArray(keywords)
    ? keywords.join(", ")
    : keywords;

  return (
    <Helmet>
      {/* Asosiy meta teglar */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywordsContent && <meta name="keywords" content={keywordsContent} />}
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && (
        <meta property="og:description" content={description} />
      )}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:locale" content={DEFAULT_LOCALE} />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={DEFAULT_TWITTER_SITE} />
      <meta name="twitter:title" content={fullTitle} />
      {description && (
        <meta name="twitter:description" content={description} />
      )}
      <meta name="twitter:image" content={metaImage} />

      {/* Ixtiyoriy JSON-LD structured data (masalan Organization, Article, Book) */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
