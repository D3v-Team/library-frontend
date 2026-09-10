import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { GirihSurface, Rule } from "../../../ui";
import GirihStar from "../../../design/motifs/GirihStar";

/**
 * 06 — Ma'rifat bloki. Signatura sirt. YANGI.
 *
 * Sahifadagi ikkinchi to'q sirt. Vazifasi — saytga MUASSASA VAZNI
 * berish: bu tijorat sayti emas, davlat kutubxonasi.
 *
 * Buyurtmachining "umumiy dizayn biroz homroq" mulohazasiga aynan
 * shu blok javob beradi: bir xil oq bo'limlar oqimini bo'lib,
 * sahifaga nafas va yakun beradi.
 *
 * Girih to'ri scroll bilan sekinroq siljiydi (naqsh 10) — sezilmaydigan
 * chuqurlik. Boshqa harakat yo'q.
 */
const LINKS = [
  { label: "home.maarifat.links.history", to: "/about" },
  { label: "home.maarifat.links.management", to: "/about/management" },
  { label: "home.maarifat.links.documents", to: "/about/documents" },
];

export default function MaarifatBand() {
  const { t } = useTranslation();

  return (
    // Bu blokda h2 yo'q — kontenti shior. Ekran o'qish dasturi
    // bo'limlar ro'yxatida uni topishi uchun aria-label beriladi.
    <GirihSurface as="section" tone="ink" parallax aria-label={t("home.maarifat.motto")}>
      <div className="mx-auto w-full max-w-container px-gut py-20 sm:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="text-gold" aria-hidden="true">
            <GirihStar size={22} />
          </span>

          {/* Logotip shiori — Spectral italic da */}
          <p className="font-display text-h2 font-medium italic leading-snug text-on-ink">
            {t("home.maarifat.motto")}
          </p>

          <Rule width="short" className="mx-auto" />

          <p className="max-w-measure font-sans text-[0.95rem] leading-relaxed text-on-ink/65">
            {t("home.maarifat.lede")}
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-3xl gap-px overflow-hidden rounded-card border border-on-ink/15 sm:grid-cols-3">
          {LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="flex h-full items-center justify-between gap-3 bg-on-ink/5 px-5 py-5 transition-colors duration-1 ease-out-soft hover:bg-on-ink/10"
              >
                <span className="font-display text-[0.95rem] font-medium text-on-ink">
                  {t(link.label)}
                </span>
                <ArrowRight
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="shrink-0 text-gold"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </GirihSurface>
  );
}
