// src/pages/Contact.jsx
import {
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  Send,
  Youtube,
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

export default function Contact() {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error } = useGetContactInfoQuery();

  // Tilga qarab address ni olish
  const getAddress = () => {
    if (!data) return "-";
    const lang = i18n.language;
    if (lang === "uz") return data.address_latin;
    if (lang === "ru") return data.address_ru;
    if (lang === "cyrl") return data.address_cyril;
    return data.address_latin || "-";
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SEO {...SEO_CONFIG.contact} />
        <div className="animate-pulse space-y-5">
          <div className="h-10 w-64 rounded-lg bg-blue-700" />
          <div className="h-40 rounded-2xl bg-blue-700" />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SEO {...SEO_CONFIG.contact} noIndex />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("contact.notFound")}
          </h2>
        </div>
      </section>
    );
  }

  const socialLinks = data?.social_links ?? [];
  const address = getAddress();

  // Platform nomini formatlash
  const getPlatformLabel = (platform) => {
    const labels = {
      facebook: "Facebook",
      instagram: "Instagram",
      telegram: "Telegram",
      youtube: "YouTube",
    };
    return labels[platform] || platform;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <SEO {...SEO_CONFIG.contact} />

      {/* HEADER */}
      <div className="mb-4 flex items-center gap-3">
        <span className="h-7 w-1 rounded-full bg-slate-900" />
        <span className="text-sm font-semibold tracking-[0.12em] text-slate-900">
          {t("contact.badge")}
        </span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {t("contact.heading")}
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
        {t("contact.description")}
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* CONTACT INFO */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("contact.info")}
          </h2>

          <div className="mt-6 space-y-5">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <MapPin size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  {t("contact.address")}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Phone size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  {t("contact.phone")}
                </p>
                <a
                  href={`tel:${data.phone}`}
                  className="mt-1 block text-sm font-medium text-slate-900 hover:text-blue-600"
                >
                  {data.phone || "-"}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Mail size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  {t("contact.email")}
                </p>
                <a
                  href={`mailto:${data.email}`}
                  className="mt-1 block text-sm font-medium text-slate-900 hover:text-blue-600"
                >
                  {data.email || "-"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("contact.social")}
          </h2>

          <div className="mt-6 space-y-3">
            {socialLinks.map((item) => {
              const Icon = getSocialIcon(item.platform);

              return (
                <a
                  key={item.platform}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {getPlatformLabel(item.platform)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.url}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAP */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <MapPinned size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t("contact.location")}
            </h2>
            <p className="text-sm text-slate-500">
              {t("contact.locationDesc")}
            </p>
          </div>
        </div>

        <iframe
          title="Kutubxona joylashuvi"
          src={`
            https://www.google.com/maps?q=${
              data.latitude || 41.311081
            },${
              data.longitude || 69.240562
            }&output=embed
          `}
          className="h-[400px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}