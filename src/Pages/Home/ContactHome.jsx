// src/components/ContactHome.jsx
import {
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  Youtube,
  ArrowUpRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetContactInfoQuery } from "../../store/services/contact.info";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

const getSocialIcon = (platform) => {
  switch (platform) {
    case "facebook":
      return Facebook;
    case "instagram":
      return Instagram;
    case "telegram":
      return Send;
    case "youtube":
      return Youtube;
    default:
      return Globe;
  }
};

export default function ContactHome() {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error } = useGetContactInfoQuery();

  const getAddress = () => {
    if (!data) return "-";

    if (i18n.language === "ru") {
      return data.address_ru;
    }

    if (i18n.language === "cyrl") {
      return data.address_cyril;
    }

    return data.address_latin;
  };

  if (isLoading) {
    return (
      <section className="py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-40 animate-pulse rounded bg-blue-700/40" />

          <div className="mt-3 h-8 w-64 animate-pulse rounded bg-blue-700/50" />

          <div className="mt-7 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="h-[280px] animate-pulse rounded-2xl bg-blue-700" />

            <div className="space-y-4 rounded-2xl border border-slate-200 p-6">
              <div className="h-5 w-32 animate-pulse rounded bg-blue-700/50" />
              <div className="h-12 animate-pulse rounded bg-blue-700/40" />
              <div className="h-12 animate-pulse rounded bg-blue-700/40" />
              <div className="h-12 animate-pulse rounded bg-blue-700/40" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return null;
  }

  const socialLinks = data.social_links ?? [];
  const address = getAddress();

  return (
    <section className="py-12 sm:py-14">
      <SEO {...SEO_CONFIG.contact} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-blue-700" />

              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                {t("contact.badge")}
              </span>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t("contact.heading")}
            </h2>
          </div>

          {/* <a
            href="/contact"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
          >
            {t("contact.more") || "Batafsil"}

            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a> */}
        </div>

        {/* CONTENT */}
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          {/* MAP */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <iframe
              title="Kutubxona joylashuvi"
              src={`https://www.google.com/maps?q=${
                data.latitude || 41.311081
              },${data.longitude || 69.240562}&output=embed`}
              className="h-[260px] w-full border-0 sm:h-[300px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* MAP LABEL */}
            <div className="absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl border border-white/70 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
                <MapPin size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {t("contact.address")}
                </p>

                <p className="truncate text-xs font-medium text-slate-800">
                  {address || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h3 className="text-base font-semibold text-slate-900">
              {t("contact.info")}
            </h3>

            <div className="mt-5 space-y-3">
              {/* PHONE */}
              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                    <Phone size={16} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {t("contact.phone")}
                    </span>

                    <span className="mt-0.5 block truncate text-sm font-semibold text-slate-800">
                      {data.phone}
                    </span>
                  </span>
                </a>
              )}

              {/* EMAIL */}
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                    <Mail size={16} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {t("contact.email")}
                    </span>

                    <span className="mt-0.5 block truncate text-sm font-semibold text-slate-800">
                      {data.email}
                    </span>
                  </span>
                </a>
              )}

              {/* ADDRESS */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <MapPin size={16} />
                </span>

                <span className="min-w-0">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {t("contact.address")}
                  </span>

                  <span className="mt-0.5 block line-clamp-2 text-sm font-semibold text-slate-800">
                    {address || "-"}
                  </span>
                </span>
              </div>
            </div>

            {/* SOCIALS */}
            {socialLinks.length > 0 && (
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-400">
                  {t("contact.social")}
                </span>

                <div className="flex items-center gap-2">
                  {socialLinks.map((item) => {
                    const Icon = getSocialIcon(item.platform);

                    return (
                      <a
                        key={item.platform}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.platform}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-700 hover:bg-blue-700 hover:text-white"
                      >
                        <Icon size={15} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}