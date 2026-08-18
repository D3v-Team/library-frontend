// src/pages/Documents.jsx
import { useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetDocumentsQuery } from "../../store/services/documents.api";
import { BASE_URL } from "../../store/api";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";

export default function Documents() {
  const { t, i18n } = useTranslation();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data, isLoading, isFetching, error } = useGetDocumentsQuery({
    page,
    limit: 10,
    search,
    category: category || undefined,
  });

  const items = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  // Tilga qarab title ni olish
  const getTitle = (doc) => {
    const lang = i18n.language;
    if (lang === "uz") return doc.title_latin;
    if (lang === "ru") return doc.title_ru;
    if (lang === "cyrl") return doc.title_cyril;
    return doc.title_latin || "Nomsiz";
  };

  // Kategoriyalarni i18n qilish
  const getCategories = () => {
    return [
      { value: "", label: t("documents.categories.all") },
      { value: "LAW", label: t("documents.categories.law") },
      { value: "DECISION", label: t("documents.categories.decision") },
      { value: "ORDER", label: t("documents.categories.order") },
      { value: "REPORT", label: t("documents.categories.report") },
    ];
  };

  // Kategoriya label'ini olish
  const getCategoryLabel = (categoryValue) => {
    const categories = getCategories();
    const found = categories.find((c) => c.value === categoryValue);
    return found?.label || categoryValue;
  };

  const CATEGORIES = getCategories();

  // Sanani formatlash
  const formatDate = (date) => {
    if (!date) return "";
    const locale = i18n.language === "ru" ? "ru-RU" : "uz-UZ";
    return new Date(date).toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <SEO {...SEO_CONFIG.documents} />
      <div className="mb-4 flex items-center gap-3">
        <span className="h-7 w-1 rounded-full bg-blue-700" />
        <span className="text-sm font-semibold tracking-[0.12em] text-blue-700">
          {t("documents.badge")}
        </span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {t("documents.heading")}
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
        {t("documents.description")}
      </p>

      {/* Category tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setCategory(c.value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === c.value
                ? "bg-slate-900 text-blue-700 hover:bg-slate-800"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-5 w-full sm:w-80">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t("documents.search")}
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-slate-900"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-blue-700" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
          {t("documents.error")}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <FileText className="mx-auto mb-3 text-slate-300" size={28} />
          <p className="text-sm text-slate-500">
            {search || category
              ? t("documents.notFound")
              : t("documents.empty")}
          </p>
        </div>
      ) : (
        <div
          className={`mt-8 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {items.map((doc) => {
            const title = getTitle(doc);
            const categoryLabel = getCategoryLabel(doc.category);
            const date = formatDate(doc.created_at);

            return (
              <div
                key={doc.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                        {categoryLabel}
                      </span>
                      {doc.created_at && <span>{date}</span>}
                    </div>
                  </div>
                </div>

                {doc.file_url && (
                  <a
                    href={`${BASE_URL}${doc.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.file_name}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-700 hover:text-blue-700"
                  >
                    <Download size={15} />
                    {t("documents.download")}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i + 1)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                page === i + 1
                  ? "bg-slate-900 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}