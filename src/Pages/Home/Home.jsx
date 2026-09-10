import HeroBand from "./sections/HeroBand";
import FondRail from "./sections/FondRail";
import NewsEditorial from "./sections/NewsEditorial";
import EventsCalendar from "./sections/EventsCalendar";
import MaarifatBand from "./sections/MaarifatBand";
import MediaMasonry from "./sections/MediaMasonry";
import QuietLinks from "./sections/QuietLinks";
import ContactBlock from "./sections/ContactBlock";

import SEO from "../../seo/SEO";
import { SEO_CONFIG, SITE_NAME, getSiteUrl } from "../../seo/seoConfig";
import { useLazySection } from "../../hooks/useLazySection";

/**
 * Bosh sahifa — vidjetlar ro'yxatidan hikoyaga.
 *
 * Eski tuzilma 8 ta mustaqil vidjet edi: har birida o'z sarlavha
 * bloki, uch xil kartochka uslubi va o'z animatsiyasi. Yangi oqim
 * bitta savolga javob beradi: bu saytga kirgan odam nima qilmoqchi?
 * — kitob topmoqchi.
 *
 *   01 Peshtoq hero        signatura sirt + haqiqiy statistika
 *   02 Fond relsi          marquee o'rniga boshqariladigan rels
 *   03 Yangiliklar         redaksion ierarxiya: yetakchi + qatorlar
 *   04 Tadbirlar           taqvim ohangi, oy lentasi bilan
 *   05 Ma'rifat bloki      ikkinchi signatura sirt
 *   06 Media               masonry teaser, karusel emas
 *   07 Foydali havolalar   jim ro'yxat, aylanuvchi ramkalar yo'q
 *   08 Aloqa               qisqa blok + to'liq sahifaga havola
 *
 * Alohida qidiruv bloki OLIB TASHLANDI: qidiruv header da doimiy
 * turadi va hero dagi "Katalogdan izlash" ham shu ishni bajaradi —
 * uchinchi nusxa sahifani cho'zib, hero ni ekrandan siqib chiqarardi.
 *
 * Ikki to'q sirt (01 va 05) sahifani uch bo'lakka ajratadi.
 */

/** Ko'ringuncha render qilinmaydi — pastdagi bloklar uchun */
function LazySection({ children, minHeight = "320px" }) {
  const { ref, visible } = useLazySection("0px 0px 600px 0px");

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}

export default function Home() {
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Library",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SEO_CONFIG.home.description,
  };

  return (
    <>
      <SEO {...SEO_CONFIG.home} jsonLd={homeJsonLd} />

      {/* Darhol render — ekranning yuqori qismi */}
      <HeroBand />
      <FondRail />

      <LazySection minHeight="420px">
        <NewsEditorial />
      </LazySection>

      <LazySection minHeight="420px">
        <EventsCalendar />
      </LazySection>

      <LazySection minHeight="380px">
        <MaarifatBand />
      </LazySection>

      <LazySection minHeight="420px">
        <MediaMasonry />
      </LazySection>

      <LazySection minHeight="320px">
        <QuietLinks />
      </LazySection>

      <LazySection minHeight="320px">
        <ContactBlock />
      </LazySection>
    </>
  );
}
