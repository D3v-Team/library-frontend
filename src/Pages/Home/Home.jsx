// src/pages/Home/Home.jsx

import Hero from "./components/Hero";
import Announcements from "./Announcements/Announcements";
import Events from "./Events/Events";
import Media from "./Media/Media";
import NewBooks from "./NewBooks/NewBooks";
import Statistics from "./Statistics/Statistics";
import UseFullLinks from "./UseFullLinks/UseFullLinks";

import SEO from "../../seo/SEO";
import { SEO_CONFIG, SITE_NAME, getSiteUrl } from "../../seo/seoConfig";
import Contact from "../Contact/Contact";
import ContactHome from "./ContactHome";

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

      <Hero />

      <Announcements />

      <NewBooks />

      <Events />

      <UseFullLinks />

      <Statistics />

      <Media />
      <ContactHome />
    </div>
  );
}
