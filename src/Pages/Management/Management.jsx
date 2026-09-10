import { Mail, Phone, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetDepartmentsQuery } from "../../store/services/departament";
import { EmptyState, Reveal, Skeleton } from "../../ui";
import { PageMeta, PageShell } from "../../patterns";
import SEO from "../../seo/SEO";

/**
 * Rahbariyat.
 *
 * Kontakt ma'lumotlari mono shriftda va ustunda tekislangan —
 * telefon raqamlarini solishtirish oson bo'ladi. Faol bo'lmagan
 * yozuvlar (`is_active === false`) public saytda ko'rinmaydi.
 */
export default function Management() {
  const { t } = useTranslation();
  const { pick } = useLocalized();

  const { data, isLoading, error } = useGetDepartmentsQuery({ page: 1, limit: 100 });
  const people = (data?.data ?? []).filter((p) => p.is_active !== false);

  return (
    <>
      <SEO title={t("management.heading")} description={t("management.description")} />

      <PageShell
        breadcrumbs={[{ label: t("management.heading") }]}
        eyebrow={t("management.badge")}
        title={t("management.heading")}
        lede={t("management.description")}
        meta={<PageMeta label={t("management.metaTotal")} value={people.length || "—"} />}
      >
        {error ? (
          <EmptyState title={t("management.error")} />
        ) : isLoading ? (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 border-b border-line-soft py-5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        ) : people.length === 0 ? (
          <EmptyState title={t("management.empty")} description={t("management.emptyHint")} />
        ) : (
          <Reveal as="ul" className="flex flex-col border-t border-line">
            {people.map((person) => {
              const name = pick(person, "full_name");
              const position = pick(person, "position");

              const contacts = [
                { icon: Phone, value: person.phone, href: `tel:${person.phone}` },
                { icon: Printer, value: person.fax },
                { icon: Mail, value: person.email, href: `mailto:${person.email}` },
              ].filter((c) => c.value);

              return (
                <li
                  key={person.id}
                  className="grid gap-4 border-b border-line-soft py-6 sm:grid-cols-[1.3fr_1fr] sm:gap-8"
                >
                  <div>
                    <h2 className="font-display text-[1.05rem] font-semibold text-fg">{name}</h2>

                    {position && (
                      <p className="mt-1 font-sans text-[0.85rem] text-fg-muted">{position}</p>
                    )}

                    {person.reception_days && (
                      <p className="mt-2 font-mono text-[0.75rem] text-fg-faint">
                        {t("management.reception")}: {person.reception_days}
                      </p>
                    )}
                  </div>

                  {contacts.length > 0 && (
                    <dl className="flex flex-col gap-1.5">
                      {contacts.map((c, i) => {
                        const Icon = c.icon;
                        return (
                          <div key={i} className="flex items-center gap-2.5">
                            <Icon
                              size={14}
                              strokeWidth={1.8}
                              aria-hidden="true"
                              className="shrink-0 text-gold-dim"
                            />
                            <dd className="font-mono text-[0.82rem] text-fg tabular">
                              {c.href ? (
                                <a
                                  href={c.href}
                                  className="transition-colors duration-1 ease-out-soft hover:text-accent"
                                >
                                  {c.value}
                                </a>
                              ) : (
                                c.value
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}
                </li>
              );
            })}
          </Reveal>
        )}
      </PageShell>
    </>
  );
}
