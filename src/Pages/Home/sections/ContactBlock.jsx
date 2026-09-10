import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../../lib/useLocalized";
import { useGetContactInfoQuery } from "../../../store/services/contact.info";
import { Button, Skeleton } from "../../../ui";
import { LocationMap, SectionHeader } from "../../../patterns";

/**
 * 09 — Aloqa.
 *
 * Audit topilmasi: eski ContactHome ma'lumot bo'lmasa `return null`
 * qilardi — sahifa jim-jitlik bilan tugab qolardi. Bundan tashqari
 * xuddi shu ma'lumot /contact sahifasida yana qo'lda yozilgan edi.
 *
 * Endi bu blok qisqa: manzil, telefon, pochta va to'liq sahifaga
 * havola. Ma'lumot yo'q bo'lsa ham sarlavha va havola qoladi.
 */
export default function ContactBlock() {
  const { t } = useTranslation();
  const { pick } = useLocalized();

  const { data, isLoading } = useGetContactInfoQuery();
  const address = pick(data, "address");

  const rows = [
    { key: "address", icon: MapPin, value: address },
    { key: "phone", icon: Phone, value: data?.phone, href: data?.phone && `tel:${data.phone}` },
    { key: "email", icon: Mail, value: data?.email, href: data?.email && `mailto:${data.email}` },
  ].filter((r) => r.value);

  return (
    <section className="mx-auto w-full max-w-container px-gut py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <SectionHeader
          eyebrow={t("contact.badge")}
          title={t("contact.heading")}
          lede={t("home.contact.lede")}
          action={
            <Button variant="secondary" to="/contact" iconEnd={<ArrowRight size={16} />}>
              {t("contact.more")}
            </Button>
          }
        />

        <dl className="flex flex-col border-t border-line">
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
                      <dd className="mt-1 font-display text-[0.98rem] leading-relaxed text-fg">
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
      </div>

      {/* Xarita — kutubxona jismoniy muassasa, joylashuv asosiy
          ma'lumotlardan biri. Koordinata admin panelidan keladi. */}
      <LocationMap
        latitude={data?.latitude}
        longitude={data?.longitude}
        address={address}
        title={t("contact.mapTitle")}
        className="mt-10"
      />
    </section>
  );
}
