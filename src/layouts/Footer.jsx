import { Facebook, Globe, Instagram, Mail, MapPin, Phone, Send, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cx from "../lib/cx";
import { useLocalized } from "../lib/useLocalized";
import { useGetContactInfoQuery } from "../store/services/contact.info";
import { safeHref } from "../utils/url";
import { NAV_GROUPS, NAV_LEGAL } from "./navigation";
import GirihStar from "../design/motifs/GirihStar";
import GirihSurface from "../ui/GirihSurface";
import logo from "../Images/logo.png";

/**
 * PESHTOQ — sayt poyi.
 *
 * Ikki vazifa bajaradi:
 *
 *  1. TO'LIQ SAYT XARITASI. Guruhlar navigation.js dan o'qiladi,
 *     ya'ni header bilan bir manbadan. Ilgari footer o'z ro'yxatini
 *     qo'lda tutgani uchun /contact va /media izohga olingan holda
 *     qolib ketgan, /services/faq esa header dagi /faq dan farq
 *     qilardi. Endi havolasiz sahifa qolishi mumkin emas.
 *
 *  2. SIGNATURA SIRT. To'q siyoh + girih naqsh — "boylik retsepti" ning
 *     birinchi qoidasi. Ilgari footer oq edi va sahifa shunchaki
 *     tugab qolardi; endi saytning vizual yakuni bor.
 */
export default function Footer() {
  const { t } = useTranslation();
  const { pick } = useLocalized();

  const { data: contactInfo } = useGetContactInfoQuery();
  const socialLinks = contactInfo?.social_links ?? [];
  const address = pick(contactInfo, "address");

  const socialIcon = (platform) =>
    ({
      facebook: Facebook,
      instagram: Instagram,
      telegram: Send,
      youtube: Youtube,
    })[platform] ?? Globe;

  const linkCls =
    "font-sans text-[0.84rem] text-on-ink/60 transition-colors duration-1 ease-out-soft hover:text-gold";

  return (
    <GirihSurface as="footer" tone="deep" className="mt-auto">
      <div className="mx-auto w-full max-w-container px-gut pb-10 pt-14 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_2.4fr]">
          {/* ---------- Brend ---------- */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              {/* <img
                src={logo}
                alt=""
                width="56"
                height="56"
                className="h-14 w-auto object-contain"
              /> */}
              <span className="flex flex-col leading-tight">
                <span className="font-display text-[1rem] font-semibold text-on-ink">
                  {t("brand.short")}
                </span>
                <span className="font-sans text-[0.68rem] uppercase tracking-[0.13em] text-gold">
                  {t("brand.kind")}
                </span>
              </span>
            </Link>

            <p className="mt-6 max-w-xs font-sans text-[0.85rem] leading-relaxed text-on-ink/60">
              {t("footer.brand")}
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-7 flex items-center gap-2">
                {socialLinks.map((item) => {
                  const Icon = socialIcon(item.platform);

                  return (
                    <a
                      key={item.platform}
                      href={safeHref(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.platform}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-field border border-on-ink/20 text-on-ink/70 transition-colors duration-1 ease-out-soft hover:border-gold hover:text-gold"
                    >
                      <Icon size={17} strokeWidth={1.8} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---------- Sayt xaritasi: header bilan bir manbadan ---------- */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {NAV_GROUPS.map((group) => (
              <nav key={group.id} aria-label={t(group.label)}>
                <h3 className="inline-flex items-center gap-2 font-sans text-eyebrow font-semibold uppercase text-gold">
                  <GirihStar size={10} />
                  {t(group.label)}
                </h3>

                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.items.map((item) => (
                    <li key={item.path || item.action}>
                      {/* Modal ochadigan bandlar footer da havola bo'la olmaydi —
                          ular header dan ishlaydi, shuning uchun bu yerda
                          eng yaqin haqiqiy sahifaga yo'naltiriladi. */}
                      {item.action ? (
                        <Link to="/contact" className={linkCls}>
                          {t(item.label)}
                        </Link>
                      ) : (
                        <Link to={item.path} className={linkCls}>
                          {t(item.label)}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* ---------- Bog'lanish ---------- */}
        <div className="mt-12 grid gap-6 border-t border-on-ink/15 pt-8 sm:grid-cols-3">
          {address && (
            <div className="flex items-start gap-3">
              <MapPin size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-gold" />
              <p className="font-sans text-[0.85rem] leading-relaxed text-on-ink/70">
                {address}
              </p>
            </div>
          )}

          {contactInfo?.phone && (
            <a
              href={`tel:${contactInfo.phone}`}
              className="flex items-center gap-3 font-sans text-[0.85rem] text-on-ink/70 transition-colors duration-1 ease-out-soft hover:text-gold"
            >
              <Phone size={17} strokeWidth={1.8} className="shrink-0 text-gold" />
              <span className="tabular">{contactInfo.phone}</span>
            </a>
          )}

          {contactInfo?.email && (
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-3 font-sans text-[0.85rem] text-on-ink/70 transition-colors duration-1 ease-out-soft hover:text-gold"
            >
              <Mail size={17} strokeWidth={1.8} className="shrink-0 text-gold" />
              {contactInfo.email}
            </a>
          )}
        </div>
      </div>

      {/* ---------- Pastki qator ---------- */}
      <div className="border-t border-on-ink/15">
        <div
          className={cx(
            "mx-auto flex w-full max-w-container flex-col gap-3 px-gut py-5",
            "sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <p className="font-sans text-[0.76rem] text-on-ink/45">{t("footer.copyright")}</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {NAV_LEGAL.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="font-sans text-[0.76rem] text-on-ink/45 transition-colors duration-1 ease-out-soft hover:text-gold"
              >
                {t(item.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </GirihSurface>
  );
}
