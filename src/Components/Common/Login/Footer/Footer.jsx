// src/components/Footer.jsx
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  Youtube,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetContactInfoQuery } from "../../../../store/services/contact.info";
import logo from "../../../../Images/logo.png";

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

export default function Footer() {
  const { t, i18n } = useTranslation();

  const { data: contactInfo } = useGetContactInfoQuery();

  const socialLinks = contactInfo?.social_links ?? [];

  // Tilga qarab address ni olish
  const getAddress = () => {
    if (!contactInfo) return "-";
    const lang = i18n.language;
    if (lang === "uz") return contactInfo.address_latin;
    if (lang === "ru") return contactInfo.address_ru;
    if (lang === "cyrl") return contactInfo.address_cyril;
    return contactInfo.address_latin || "-";
  };

  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div>
            <Link to="/" className="inline-flex items-center">
              <img
                src={logo}
                alt="Chinoz axborot-kutubxona markazi"
                className="h-16 w-auto object-contain"
              />
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
              {t("footer.brand")}
            </p>

            {/* SOCIAL */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((item) => {
                const Icon = getSocialIcon(item.platform);

                return (
                  <a
                    key={item.platform}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-500 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t("footer.navigation")}
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.nav.home")}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.nav.about")}
                </Link>
              </li>
              <li>
                <Link to="/authors" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.nav.authors")}
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.nav.books")}
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.nav.news")}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.nav.events")}
                </Link>
              </li>
              {/* <li>
                <Link to="/media" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.nav.media")}
                </Link>
              </li> */}
            </ul>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t("footer.servicesTitle")}
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/services/faq" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.services.faq")}
                </Link>
              </li>
              {/* <li>
                <Link to="/contact" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.services.contact")}
                </Link>
              </li> */}
              <li>
                <Link to="/about/documents" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.services.documents")}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-slate-500 transition hover:text-blue-600">
                  {t("footer.services.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t("footer.contact")}
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-blue-600" />
                <p className="text-sm leading-5 text-slate-500">
                  {getAddress()}
                </p>
              </div>

              {contactInfo?.phone && (
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center gap-3 text-sm text-slate-500 transition hover:text-blue-600"
                >
                  <Phone size={18} className="shrink-0 text-blue-600" />
                  {contactInfo.phone}
                </a>
              )}

              {contactInfo?.email && (
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-3 text-sm text-slate-500 transition hover:text-blue-600"
                >
                  <Mail size={18} className="shrink-0 text-blue-600" />
                  {contactInfo.email}
                </a>
              )}

              {/* <Link
                to="/contact"
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                {t("footer.contactPage")}
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="text-xs text-slate-500">
            {t("footer.copyright")}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/privacy-policy" className="text-xs text-slate-500 transition hover:text-blue-600">
              {t("footer.privacy")}
            </Link>
            <Link to="/about/documents" className="text-xs text-slate-500 transition hover:text-blue-600">
              {t("footer.documents")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}