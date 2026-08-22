// src/pages/Home/Policy.jsx
import { useTranslation } from "react-i18next";
import { useGetPageBySlugQuery } from "../../store/services/pages";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

export default function Policy() {
  const { t, i18n } = useTranslation();

  const { data: page, isLoading, error } = useGetPageBySlugQuery("PRIVACY_POLICY");

  // Tilga qarab sarlavha va kontentni tanlash
  const getTitle = () => {
    if (!page) return "";
    const lang = i18n.language;
    if (lang === "uz") return page.title_latin;
    if (lang === "ru") return page.title_ru;
    if (lang === "cyrl") return page.title_cyril;
    return page.title_latin || "Maxfiylik siyosati";
  };

  const getContent = () => {
    if (!page) return "";
    const lang = i18n.language;
    if (lang === "uz") return page.content_latin;
    if (lang === "ru") return page.content_ru;
    if (lang === "cyrl") return page.content_cyril;
    return page.content_latin || "";
  };

  const title = getTitle();
  const content = getContent();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SEO {...SEO_CONFIG.privacy} />
        <div className="animate-pulse">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-slate-300" />
            <div className="h-4 w-44 rounded bg-slate-300" />
          </div>
          <div className="h-10 w-2/3 rounded-lg bg-slate-300" />
          <div className="mt-4 h-4 w-96 max-w-full rounded bg-slate-300" />
          <div className="mt-10 space-y-3">
            <div className="h-4 w-full rounded bg-slate-300" />
            <div className="h-4 w-full rounded bg-slate-300" />
            <div className="h-4 w-5/6 rounded bg-slate-300" />
            <div className="h-4 w-full rounded bg-slate-300" />
            <div className="h-4 w-4/5 rounded bg-slate-300" />
            <div className="h-4 w-full rounded bg-slate-300" />
            <div className="h-4 w-3/4 rounded bg-slate-300" />
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full rounded bg-slate-300" />
            <div className="h-4 w-full rounded bg-slate-300" />
            <div className="h-4 w-2/3 rounded bg-slate-300" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !page) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SEO {...SEO_CONFIG.privacy} noIndex />
        <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-16 text-center">
          <p className="text-sm text-red-600">
            {t("policy.error") || "Sahifa ma'lumotlarini yuklashda xatolik yuz berdi."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <SEO
        {...SEO_CONFIG.privacy}
        title={title}
        description={content?.slice(0, 160) || "Maxfiylik siyosati haqida ma'lumot"}
      />

      <div className="mb-4 flex items-center gap-3">
        <span className="h-7 w-1 rounded-full bg-slate-900" />
        <span className="text-sm font-semibold tracking-[0.12em] text-slate-900">
          {t("policy.badge") || "MAXFIYLIK SIYOSATI"}
        </span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
        {t("policy.description") || "Shaxsiy ma'lumotlarni himoya qilish siyosati."}
      </p>

      <div className="mt-10 prose prose-slate max-w-none">
        {content ? (
          <div
            className="text-base leading-7 text-slate-700"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <p className="text-sm text-slate-500">
              {t("policy.noContent") || "Hozircha ma'lumot mavjud emas."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}