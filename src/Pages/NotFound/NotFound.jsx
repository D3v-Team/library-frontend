import { Link } from "react-router-dom";

import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <SEO {...SEO_CONFIG.notFound} noIndex />
      <span className="text-sm font-semibold tracking-[0.12em] text-slate-400">
        XATOLIK 404
      </span>

      <h1 className="mt-4 text-6xl font-semibold tracking-tight text-slate-900 sm:text-7xl">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Sahifa topilmadi
      </h2>

      <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
        Siz izlayotgan sahifa mavjud emas yoki ko‘chirilgan bo‘lishi mumkin.
        Havolani qayta tekshiring yoki bosh sahifaga qayting.
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        Bosh sahifaga qaytish
      </Link>
    </section>
  );
}
