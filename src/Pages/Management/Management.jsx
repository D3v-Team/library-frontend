import { Mail, Phone, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../lib/useLocalized";
import { useGetDepartmentsQuery } from "../../store/services/departament";
import { BASE_URL } from "../../store/api";
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
/**
 * Xodim surati.
 *
 * Backend `member_photo` maydonini qaytaradi (Swagger:
 * Create/UpdateDepartmentDto, multipart, binary). Admin panelda u
 * ImageUploadField orqali yuklanadi, o'chirish esa alohida endpoint:
 * DELETE /departments/:id/remove-photo
 *
 * Surat yo'q bo'lsa kulrang bo'sh doira emas, tipografik plagin
 * ko'rinadi — ismning bosh harfi girih naqsh ustida.
 */
const photoOf = (person) => {
  const raw = person?.member_photo;
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `${BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

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
              const photo = photoOf(person);

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
                  <div className="flex items-start gap-4">
                    {/* Surat ataylab KICHIK: rahbariyat ro'yxati — ma'lumot
                        jadvali, portret galereyasi emas. 56px da ism va
                        lavozim asosiy bo'lib qoladi. */}
                    <span className="relative mt-0.5 h-20 w-20 shrink-0 overflow-hidden rounded-card border border-line bg-ink-deep">
                      {photo ? (
                        <img
                          src={photo}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <span aria-hidden="true" className="girih-tile absolute inset-0" />
                          <span className="absolute inset-0 flex items-center justify-center font-display text-[1.1rem] font-semibold text-gold/80">
                            {name?.trim().charAt(0)}
                          </span>
                        </>
                      )}
                    </span>

                  <div className="min-w-0">
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
