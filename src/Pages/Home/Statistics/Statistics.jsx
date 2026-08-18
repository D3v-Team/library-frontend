// src/components/Statistics.jsx
import {
  BookOpen,
  CalendarDays,
  LibraryBig,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const statistics = [
  {
    id: 1,
    value: "25 000+",
    label: "books",
    description: "booksDesc",
    icon: BookOpen,
  },
  {
    id: 2,
    value: "8 500+",
    label: "readers",
    description: "readersDesc",
    icon: Users,
  },
  {
    id: 3,
    value: "3 200+",
    label: "resources",
    description: "resourcesDesc",
    icon: LibraryBig,
  },
  {
    id: 4,
    value: "150+",
    label: "events",
    description: "eventsDesc",
    icon: CalendarDays,
  },
];

export default function Statistics() {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-12 lg:py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-10 max-w-2xl sm:mb-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-6 w-1 bg-[#2563EB]" />
            <span className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              {t("statistics.badge")}
            </span>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
            {t("statistics.heading")}
            <br className="hidden sm:block" />
            <span className="text-black"> {t("statistics.headingSuffix")}</span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[#4B5563] sm:text-base">
            {t("statistics.description")}
          </p>
        </div>

        {/* Statistics cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.id}
                className="group relative flex min-h-[245px] flex-col overflow-hidden border border-[#E5E7EB] bg-[#FFFFFF] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-7"
              >
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-[#2563EB]" />

                {/* Icon */}
                <div className="flex h-11 w-11 items-center justify-center border border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB] transition-colors duration-300 group-hover:bg-[#2563EB] group-hover:text-[#FFFFFF]">
                  <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                </div>

                {/* Number */}
                <p className="mt-7 text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
                  {item.value}
                </p>

                {/* Label */}
                <h3 className="mt-3 text-base font-semibold text-[#111827]">
                  {t(`statistics.${item.label}`)}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm leading-5 text-[#6B7280]">
                  {t(`statistics.${item.description}`)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}