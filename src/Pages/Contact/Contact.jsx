import { ArrowRight, Facebook, Globe, Instagram, Mail, MapPin, Phone, Send, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetContactInfoQuery } from "../../store/services/contact.info";
import { safeHref } from "../../utils/url";
import { Button, EmptyState, GirihSurface, Skeleton } from "../../ui";
import { LocationMap, PageShell, SectionHeader } from "../../patterns";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

/**
 * Aloqa sahifasi.
 *
 * Audit topilmasi: bu sahifa router da bor edi, lekin header va
 * footer dan izohga olingani uchun faqat URL bilan ochilardi
 * (3-bosqichda navigatsiyaga qaytarildi). Bundan tashqari xuddi shu
 * ma'lumot bosh sahifadagi ContactHome da yana qo'lda yozilgan edi —
 * ikkalasi ham hozir bitta manbadan (`useGetContactInfoQuery`)
 * oziqlanadi va bir xil ko'rinadi.
 */
const socialIcon = (platform) =>
  ({ facebook: Facebook, instagram: Instagram, telegram: Send, youtube: Youtube })[platform] ?? Globe;

export default function Contact() {
  const { t } = useTranslation();
  const { pick } = useLocalized();

  const { data, isLoading, error } = useGetContactInfoQuery();

  const address = pick(data, "address");
  const social = data?.social_links ?? [];

  const rows = [
    { key: "address", icon: MapPin, value: address },
    { key: "phone", icon: Phone, value: data?.phone, href: data?.phone && `tel:${data.phone}`, mono: true },
    { key: "email", icon: Mail, value: data?.email, href: data?.email && `mailto:${data.email}` },
  ].filter((r) => r.value);

  return (
    <>
      <SEO {...SEO_CONFIG.contact} />

      <PageShell
        breadcrumbs={[{ label: t("header.contact") }]}
        eyebrow={t("contact.badge")}
        title={t("contact.heading")}
        lede={t("home.contact.lede")}
      >
        {error ? (
          <EmptyState
            title={t("contact.notFound")}
            description={t("contact.errorHint")}
            actions={
              <Button size="sm" variant="primary" onClick={() => window.location.reload()}>
                {t("media.retry")}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {/* ---------- Aloqa ma'lumotlari ---------- */}
            <div>
              <SectionHeader eyebrow={t("contact.info")} title={t("contact.info")} as="h2" />

              <dl className="mt-8 flex flex-col border-t border-line">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border-b border-line-soft py-5">
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))
                  : rows.map((row) => {
                      const Icon = row.icon;

                      return (
                        <div
                          key={row.key}
                          className="flex items-start gap-4 border-b border-line-soft py-5"
                        >
                          <Icon
                            size={17}
                            strokeWidth={1.8}
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-gold-dim"
                          />

                          <div className="min-w-0">
                            <dt className="font-sans text-[0.72rem] uppercase tracking-[0.1em] text-fg-faint">
                              {t(`contact.${row.key}`)}
                            </dt>
                            <dd
                              className={`mt-1 leading-relaxed text-fg ${
                                row.mono ? "font-mono text-[0.92rem] tabular" : "font-display text-[0.98rem]"
                              }`}
                            >
                              {row.href ? (
                                <a
                                  href={row.href}
                                  className="transition-colors duration-1 ease-out-soft hover:text-accent"
                                >
                                  {row.value}
                                </a>
                              ) : (
                                row.value
                              )}
                            </dd>
                          </div>
                        </div>
                      );
                    })}
              </dl>

              {social.length > 0 && (
                <div className="mt-10">
                  <h3 className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-gold-dim">
                    {t("contact.social")}
                  </h3>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {social.map((item) => {
                      const Icon = socialIcon(item.platform);

                      return (
                        <a
                          key={item.platform}
                          href={safeHref(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={item.platform}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-field border border-line text-fg-muted transition-colors duration-1 ease-out-soft hover:border-gold hover:text-fg"
                        >
                          <Icon size={18} strokeWidth={1.8} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ---------- Xarita + xizmatlarga yo'l ---------- */}
            <div className="flex flex-col gap-8">
              <LocationMap
                latitude={data?.latitude}
                longitude={data?.longitude}
                address={address}
                title={t("contact.mapTitle")}
                height="clamp(260px,36vh,380px)"
              />

              <GirihSurface as="aside" tone="deep" className="rounded-card p-8 sm:p-10">
              <h2 className="font-display text-h3 font-semibold text-on-ink">
                {t("contact.ctaTitle")}
              </h2>

              <p className="mt-3 max-w-measure font-sans text-[0.9rem] leading-relaxed text-on-ink/65">
                {t("contact.ctaLede")}
              </p>

              <ul className="mt-8 flex flex-col gap-px overflow-hidden rounded-card border border-on-ink/15">
                {[
                  { label: t("books.heading"), to: "/books" },
                  { label: t("header.faq"), to: "/faq" },
                  { label: t("header.documents"), to: "/about/documents" },
                ].map((link) => (
                  <li key={link.to}>
                    {/* Button emas, oddiy Link: `variant="onInk"` ning
                        `bg-transparent` i bu yerdagi `bg-on-ink/5` bilan
                        to'qnashardi va qaysi biri g'alaba qilishi CSS
                        tartibiga bog'liq bo'lib qolardi. */}
                    <Link
                      to={link.to}
                      className="flex items-center justify-between gap-3 bg-on-ink/5 px-5 py-4 font-display text-[0.95rem] font-medium text-on-ink transition-colors duration-1 ease-out-soft hover:bg-on-ink/10 hover:text-gold"
                    >
                      {link.label}
                      <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-gold" />
                    </Link>
                  </li>
                ))}
              </ul>
              </GirihSurface>
            </div>
          </div>
        )}
      </PageShell>
    </>
  );
}
