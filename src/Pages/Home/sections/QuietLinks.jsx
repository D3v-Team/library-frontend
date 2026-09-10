import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLocalized } from "../../../lib/useLocalized";
import { useGetUsefulLinksQuery } from "../../../store/services/links";
import { safeHref } from "../../../utils/url";
import { EmptyState, Skeleton } from "../../../ui";
import { SectionHeader } from "../../../patterns";

/**
 * 08 — Foydali havolalar. Jim ro'yxat.
 *
 * Audit topilmasi: eski blokda har kartochka atrofida AYLANUVCHI
 * conic-gradient ramka bor edi — oltita element bir vaqtda
 * aylanardi. Bu ikkilamchi kontentni sahifadagi eng shovqinli
 * narsaga aylantirgan.
 *
 * Endi: hairline bilan ajratilgan ikki ustun, faqat hover javobi
 * (naqsh 2). Ikkilamchi kontent ikkilamchi ko'rinadi.
 */
export default function QuietLinks() {
  const { t } = useTranslation();
  const { pick } = useLocalized();

  const { data, isLoading, error } = useGetUsefulLinksQuery({ page: 1, limit: 12 });
  const links = data?.data ?? [];

  if (!isLoading && !error && links.length === 0) return null;

  return (
    <section className="border-t border-line-soft bg-paper-2">
      <div className="mx-auto w-full max-w-container px-gut py-16 sm:py-20">
        <SectionHeader
          eyebrow={t("usefulLinks.badge")}
          title={t("usefulLinks.heading")}
          lede={t("usefulLinks.description")}
        />

        <div className="mt-8">
          {error ? (
            <EmptyState title={t("usefulLinks.error")} />
          ) : isLoading ? (
            <div className="grid gap-x-10 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b border-line-soft py-4">
                  <Skeleton className="h-4 w-3/5" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="grid gap-x-10 border-t border-line sm:grid-cols-2">
              {links.map((link) => (
                <li key={link.id} className="border-b border-line-soft">
                  <a
                    href={safeHref(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 py-4 transition-colors duration-1 ease-out-soft hover:text-accent"
                  >
                    <span className="min-w-0 font-display text-[0.95rem] font-medium text-fg">
                      {pick(link, "title")}
                    </span>
                    <ArrowUpRight
                      size={15}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="shrink-0 text-fg-faint"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 font-sans text-[0.78rem] text-fg-faint">
          {t("usefulLinks.footer")}
        </p>
      </div>
    </section>
  );
}
