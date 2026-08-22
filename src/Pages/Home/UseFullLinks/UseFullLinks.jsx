import {
  ArrowUpRight,
  Building2,
  ExternalLink,
  Globe2,
  Landmark,
  Newspaper,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetUsefulLinksQuery } from "../../../store/services/links";

const iconMap = {
  Globe2,
  Landmark,
  Building2,
  ShieldCheck,
  Newspaper,
};

export default function UseFullLinks() {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error } =
    useGetUsefulLinksQuery({
      page: 1,
      limit: 10,
    });

  const usefulLinks = data?.data ?? [];

  // Tilga qarab title ni olish
  const getTitle = (link) => {
    const lang = i18n.language;

    if (lang === "uz") return link.title_latin;
    if (lang === "ru") return link.title_ru;
    if (lang === "cyrl") return link.title_cyril;

    return link.title_latin || "Nomsiz";
  };

  // ===== SKELETON LOADING =====
  if (isLoading) {
    return (
      <section className="bg-white py-16 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* HEADER SKELETON */}
          <div className="mb-10 border-b border-slate-200 pb-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1 animate-pulse rounded-full bg-slate-300" />

              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                <Globe2
                  size={17}
                  className="animate-pulse text-slate-400"
                />

                <span className="h-6 w-48 animate-pulse rounded bg-slate-300" />
              </div>
            </div>

            <div className="h-10 w-64 animate-pulse rounded bg-slate-300" />

            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-300" />
          </div>

          {/* CARDS SKELETON */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300"
              >
                <div className="absolute right-5 top-4 h-4 w-8 animate-pulse rounded bg-slate-300" />

                <div className="flex h-11 w-11 animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-slate-300" />

                <div className="mt-5 space-y-2 pr-6">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-300" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-300" />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-300" />
                  <div className="h-8 w-8 animate-pulse rounded-full bg-slate-300" />
                </div>

                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-slate-900 transition-all group-hover:w-full" />
              </div>
            ))}
          </div>

          {/* FOOTER SKELETON */}
          <div className="mt-6 flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-slate-300" />
            <div className="h-4 w-64 animate-pulse rounded bg-slate-300" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center text-red-500">
          {t("usefulLinks.error")}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
       <div className="mb-10  border-b border-slate-200 pb-7">
  <div className="mb-4 flex items-center gap-3">
    <span className="h-7 w-1 rounded-full bg-blue-700" />

    <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
      <Globe2 size={17} />
      {t("usefulLinks.badge")}
    </div>
  </div>

  <div className="flex items-center gap-4">
    <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
      {t("usefulLinks.heading")}
    </h2>


    <span className="hidden h-px flex-1 bg-slate-200 sm:block" />
  </div>

  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
    {t("usefulLinks.description")}
  </p>
</div>

        {/* CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {usefulLinks.map((link, index) => {
            const Icon =
              iconMap[link.icon] || Globe2;

            const title = getTitle(link);

            return (
            <a
  key={link.id}
  href={link.url}
  target="_blank"
  rel="noopener noreferrer"
  className="
    group
    relative
    overflow-hidden
    rounded-xl
    bg-white
    p-5
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-md
  "
>
  {/* =========================
      ANIMATED BORDER
  ========================== */}

  <span className="pointer-events-none absolute inset-0 rounded-xl">

    {/* Static border */}
    <span className="absolute inset-0 rounded-xl border border-slate-200" />

    {/* Rotating border */}
    <span className="absolute -inset-[1px] overflow-hidden rounded-xl">
      <span
        className="
          absolute
          left-1/2
          top-1/2
          h-[220%]
          w-[220%]
          animate-[borderSpin_5s_linear_infinite]
          bg-[conic-gradient(from_0deg,transparent_0deg,transparent_230deg,#2563EB_285deg,#2563EB_360deg)]
        "
      />
    </span>


    {/* Center cover */}
    <span className="absolute inset-[1.5px] rounded-[10px] bg-white" />

  </span>


  {/* =========================
      CARD CONTENT
  ========================== */}

  <span className="relative z-10 block">

    {/* NUMBER */}
    <span className="absolute right-5 top-4 text-xs font-semibold tracking-widest text-slate-300">
      {String(index + 1).padStart(2, "0")}
    </span>


    {/* ICON + TITLE */}

    <span className="flex items-center gap-4">

      {/* ICON */}
      <span
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-slate-200
          bg-white
          text-blue-700
          shadow-sm
          transition
          group-hover:bg-slate-900
          group-hover:text-white
        "
      >
        <Icon size={20} />
      </span>


      {/* TITLE */}
      <span className="pr-6">

        <span
          className="
            block
            text-base
            font-semibold
            leading-6
            text-slate-900
            transition
            group-hover:text-slate-900
          "
        >
          {title}
        </span>


        <span className="mt-1 block text-xs text-slate-400">
          {t("usefulLinks.source")}
        </span>

      </span>

    </span>

  </span>

</a>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <ExternalLink size={13} />

          {t("usefulLinks.footer")}
        </div>
      </div>

      {/* BORDER ANIMATION */}
      <style>
        {`
          @keyframes borderSpin {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }

            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }
        `}
      </style>
    </section>
  );
}