// src/pages/Management.jsx
import { Mail, Phone, Printer, CalendarDays, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetDepartmentsQuery } from "../../store/services/departament";

export default function Management() {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error } = useGetDepartmentsQuery({
    page: 1,
    limit: 20,
  });

  const managers = (data?.data ?? [])
    .filter((item) => item.is_active)
    .sort((a, b) => a.position_order - b.position_order);

  // Tilga qarab ismni olish
  const getFullName = (person) => {
    const lang = i18n.language;
    if (lang === "uz") return person.full_name_latin;
    if (lang === "ru") return person.full_name_ru;
    if (lang === "cyrl") return person.full_name_cyril;
    return person.full_name_latin || "Nomsiz";
  };

  // Tilga qarab lavozimni olish
  const getPosition = (person) => {
    const lang = i18n.language;
    if (lang === "uz") return person.position_latin;
    if (lang === "ru") return person.position_ru;
    if (lang === "cyrl") return person.position_cyril;
    return person.position_latin || "";
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-xl bg-red-50 px-6 py-12 text-center text-sm text-red-600">
          {t("management.error")}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-7 w-1 rounded-full bg-blue-700" />
          <span className="text-xs font-semibold tracking-[0.15em] text-blue-700">
            {t("management.badge")}
          </span>
        </div>

        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          {t("management.heading")}
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
          {t("management.description")}
        </p>
      </div>

      {/* CARDS */}
      {managers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-6 py-16 text-center text-sm text-slate-500">
          {t("management.empty")}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {managers.map((person) => {
            const fullName = getFullName(person);
            const position = getPosition(person);

            return (
              <article
                key={person.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <UserRound size={22} />
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
    </section>
  );
}