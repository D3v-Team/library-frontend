// src/components/UseFullLinks.jsx
import {
  ArrowUpRight,
  Building2,
  ExternalLink,
  Globe2,
  Landmark,
  Newspaper,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetUsefulLinksQuery } from "../../../store/services/links";

const iconMap = {
  Globe2,
  Landmark,
  Building2,
  ShieldCheck,
  Newspaper,
};

export default function UseFullLinks() {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error } = useGetUsefulLinksQuery({
    page: 1,
    limit: 10,
  });

  const usefulLinks = data?.data ?? [];

  // Tilga qarab title ni olish
  const getTitle = (link) => {
    const lang = i18n.language;
    if (lang === "uz") return link.title_latin;
    if (lang === "ru") return link.title_ru;
    if (lang === "cyrl") return link.title_cyril;
    return link.title_latin || "Nomsiz";
  };

  if (isLoading) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center text-red-500">
          {t("usefulLinks.error")}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-slate-200 pb-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-blue-700" />

            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
              <Globe2 size={17} />
              {t("usefulLinks.badge")}
            </div>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {t("usefulLinks.heading")}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            {t("usefulLinks.description")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {usefulLinks.map((link, index) => {
            const Icon = iconMap[link.icon] || Globe2;
            const title = getTitle(link);

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-md"
              >
                <span className="absolute right-5 top-4 text-xs font-semibold tracking-widest text-slate-300">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700 shadow-sm transition group-hover:bg-blue-700 group-hover:text-white">
                  <Icon size={20} />
                </div>

                <div className="mt-5 pr-6">
                  <h3 className="text-base font-semibold leading-6 text-slate-900 group-hover:text-blue-700">
                    {title}
                  </h3>

                  <p className="mt-2 truncate text-sm text-slate-500">
                    {link.url}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-xs font-semibold text-slate-400">
                    {t("usefulLinks.source")}
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 group-hover:bg-blue-700 group-hover:text-white">
                    <ArrowUpRight size={15} />
                  </span>
                </div>

                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-700 transition-all group-hover:w-full" />
              </a>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <ExternalLink size={13} />
          {t("usefulLinks.footer")}
        </div>
      </div>
    </section>
  );
}