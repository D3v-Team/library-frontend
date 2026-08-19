// src/pages/Author.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Calendar, BookOpen, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetAuthorsQuery } from "../../store/services/avtors.api";
import { BASE_URL } from "../../store/api";
import Pagination from "../Admin/components/Pagination";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

export default function Author() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error } = useGetAuthorsQuery({
    page,
    limit: 12,
    sortBy: "full_name_latin",
    sortOrder: "asc",
  });

  const authors = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

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
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-[5/5] animate-pulse bg-blue-700" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-blue-700/60" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-blue-700/50" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-blue-700/40" />
                  <div className="h-4 w-full animate-pulse rounded bg-blue-700/40" />
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
            {t("author.error")}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <SEO {...SEO_CONFIG.authors} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 border-b border-slate-200 pb-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-blue-700" />
            <span className="text-sm font-semibold tracking-[0.12em] text-blue-700">
              {t("author.badge")}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {t("author.pageTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            {t("author.description")}
          </p>
        </div>

        {/* Authors Grid */}
        {authors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <User className="mx-auto mb-3 text-slate-300" size={32} />
            <p className="text-sm text-slate-500">
              {t("author.empty")}
            </p>
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${
                isFetching ? "opacity-60" : "opacity-100"
              }`}
            >
              {authors.map((author) => {
                // Rasmni to'g'ri olish
                let imagePath = author.main_image_url || null;
                if (!imagePath && author.images?.length) {
                  const mainImg = author.images.find(img => img.is_main === true);
                  imagePath = mainImg?.url || author.images[0]?.url || null;
                }

                const imageUrl = getImageUrl(imagePath);

                const fullName =
                  author.full_name_latin ||
                  author.full_name_cyril ||
                  author.full_name_ru ||
                  t("author.unknownName");
                const nationality =
                  author.nationality_latin ||
                  author.nationality_cyril ||
                  author.nationality_ru ||
                  "";
                const birthYear = author.birth_date
                  ? new Date(author.birth_date).getFullYear()
                  : null;
                const deathYear = author.death_date
                  ? new Date(author.death_date).getFullYear()
                  : null;
                const years =
                  birthYear && deathYear
                    ? `${birthYear} – ${deathYear}`
                    : birthYear
                    ? `${birthYear}`
                    : "";

                return (
                  <Link
                    key={author.id}
                    to={`/authors/${author.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image with overlay */}
                    <div className="relative aspect-[5/5] overflow-hidden bg-slate-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={fullName}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <User size={56} />
                        </div>
                      )}
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      {/* "Batafsil" button on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-5 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg">
                          {t("author.details")}
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="line-clamp-1 text-xl font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                        {fullName}
                      </h2>
                      {nationality && (
                        <p className="mt-1 text-sm text-slate-500">
                          {nationality}
                        </p>
                      )}
                      {years && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar size={14} />
                          <span>{years}</span>
                        </div>
                      )}
                      {author.biography_latin && (
                        <p className="mt-3 line-clamp-3 text-sm text-slate-500">
                          {author.biography_latin}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}