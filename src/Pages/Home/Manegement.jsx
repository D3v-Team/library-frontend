// src/pages/Management.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Phone, Mail, Printer, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetDepartmentsQuery } from "../../store/services/departament";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

export default function Management() {
  const { t, i18n } = useTranslation();
  const [page] = useState(1);

  const { data, isLoading, error } = useGetDepartmentsQuery({
    page,
    limit: 20,
  });

  // Tilga qarab ism, lavozim va millatni olish
  const getFullName = (person) => {
    const lang = i18n.language;
    if (lang === "uz") return person.full_name_latin;
    if (lang === "ru") return person.full_name_ru;
    if (lang === "cyrl") return person.full_name_cyril;
    return person.full_name_latin || "Nomsiz";
  };

  const getPosition = (person) => {
    const lang = i18n.language;
    if (lang === "uz") return person.position_latin;
    if (lang === "ru") return person.position_ru;
    if (lang === "cyrl") return person.position_cyril;
    return person.position_latin || "";
  };

  const managers = (data?.data ?? [])
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.position_order ?? 0) - (b.position_order ?? 0));

  if (isLoading) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-10 border-b border-slate-200 pb-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700/40 animate-pulse" />
              <span className="h-6 w-48 animate-pulse rounded bg-blue-700/50" />
            </div>
            <div className="h-10 w-64 animate-pulse rounded bg-blue-700/50" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-blue-700/40" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-700 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-blue-700/60" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-blue-700/50" />
                  </div>
                </div>
                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-blue-700/40" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-blue-700/40" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-blue-700/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
            {t("management.error")}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <SEO {...SEO_CONFIG.management} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 border-b border-slate-200 pb-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-blue-700" />
            <span className="text-sm font-semibold tracking-[0.12em] text-blue-700">
              {t("management.badge")}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {t("management.heading")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            {t("management.description")}
          </p>
        </div>

        {/* Managers Grid */}
        {managers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <User className="mx-auto mb-3 text-slate-300" size={32} />
            <p className="text-sm text-slate-500">{t("management.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {managers.map((person) => {
              const fullName = getFullName(person);
              const position = getPosition(person);

              return (
                <article
                  key={person.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <User size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {fullName}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-blue-700">
                        {position}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                    {person.phone && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Phone size={16} className="text-slate-400" />
                        <span>{person.phone}</span>
                      </div>
                    )}
                    {person.email && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail size={16} className="text-slate-400" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                    {person.fax && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Printer size={16} className="text-slate-400" />
                        <span>{person.fax}</span>
                      </div>
                    )}
                    {person.reception_days && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <CalendarDays size={16} className="text-slate-400" />
                        <span>{person.reception_days}</span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}