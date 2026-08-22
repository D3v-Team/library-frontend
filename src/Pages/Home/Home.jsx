// src/pages/Home/Home.jsx
import Hero from "./components/Hero";
import Announcements from "./Announcements/Announcements";
import Events from "./Events/Events";
import Media from "./Media/Media";
import NewBooks from "./NewBooks/NewBooks";
import Statistics from "./Statistics/Statistics";
import UseFullLinks from "./UseFullLinks/UseFullLinks";
import ContactHome from "./ContactHome";

import SEO from "../../seo/SEO";
import { SEO_CONFIG, SITE_NAME, getSiteUrl } from "../../seo/seoConfig";
import { useLazySection } from "../../hooks/useLazySection";

// Lazy wrapper — ref ga bog'langan placeholder,
// ko'ringuncha children render bo'lmaydi
function LazySection({ children, minHeight = "200px" }) {
  const { ref, visible } = useLazySection("0px 0px 600px 0px");
  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}

export default function Home() {
  const siteUrl = getSiteUrl();

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Library",
    name: SITE_NAME,
    url: siteUrl,
    description: SEO_CONFIG.home.description,
  };

  return (
    <div>
      <SEO {...SEO_CONFIG.home} jsonLd={homeJsonLd} />

      {/* Darhol render — above the fold */}
      <Hero />
      <Announcements />
      <NewBooks />

      <LazySection minHeight="280px">
        <Events />
      </LazySection>

      <LazySection minHeight="240px">
        <UseFullLinks />
      </LazySection>

      <LazySection minHeight="220px">
        <Statistics />
      </LazySection>

      <LazySection minHeight="280px">
        <Media />
      </LazySection>

      <LazySection minHeight="240px">
        <ContactHome />
      </LazySection>
    </div>
  );
}
