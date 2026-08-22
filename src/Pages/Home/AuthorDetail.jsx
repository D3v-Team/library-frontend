// src/pages/Home/AuthorDetail.jsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGetAuthorByIdQuery } from "../../store/services/avtors.api";
import { BASE_URL } from "../../store/api";
import SEO from "../../seo/SEO";
import { SEO_CONFIG } from "../../seo/seoConfig";
import { truncateForMeta } from "../../seo/seoUtils";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

export default function AuthorDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const { data: author, isLoading, error } = useGetAuthorByIdQuery(id);

  const getFullName = () => {
    const lang = i18n.language;
    if (lang === "uz") return author?.full_name_latin;
    if (lang === "ru") return author?.full_name_ru;
    if (lang === "cyrl") return author?.full_name_cyril;
    return author?.full_name_latin || "Nomsiz";
  };

  const getNationality = () => {
    const lang = i18n.language;
    if (lang === "uz") return author?.nationality_latin;
    if (lang === "ru") return author?.nationality_ru;
    if (lang === "cyrl") return author?.nationality_cyril;
    return author?.nationality_latin || "";
  };

  const getBiography = () => {
    const lang = i18n.language;
    if (lang === "uz") return author?.biography_latin;
    if (lang === "ru") return author?.biography_ru;
    if (lang === "cyrl") return author?.biography_cyril;
    return author?.biography_latin || "";
  };

  const formatDate = (date) => {
    if (!date) return null;
    const locale = i18n.language === "ru" ? "ru-RU" : "uz-UZ";
    return new Date(date).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ===== SKELETON =====
  if (isLoading) {
    return (
      <section className="bg-white">
        <SEO {...SEO_CONFIG.authorDetail} />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-10 h-4 w-28 rounded bg-slate-300" />
            <div className="grid gap-10 lg:grid-cols-[400px_1fr] lg:gap-14">
              {/* Avatar */}
              <div className="aspect-square w-full max-w-[320px] rounded-2xl bg-slate-300 mx-auto lg:mx-0 lg:max-w-none" />
              {/* Info */}
              <div className="space-y-4">
                <div className="h-9 w-3/4 rounded-lg bg-slate-300" />
                <div className="h-5 w-1/3 rounded bg-slate-300" />
                <div className="h-4 w-40 rounded bg-slate-300" />
                <div className="h-4 w-48 rounded bg-slate-300" />
                <div className="pt-2 space-y-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`h-4 rounded bg-slate-300 ${i % 3 === 2 ? "w-4/5" : "w-full"}`} />
                  ))}
                </div>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                  <div className="h-4 w-28 rounded bg-slate-300" />
                  <div className="h-6 w-8 rounded bg-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ===== ERROR =====
  if (error || !author) {
    return (
      <section className="bg-white">
        <SEO
          title={t("authorDetail.notFound")}
          description={SEO_CONFIG.authorDetail.description}
          noIndex
        />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            to="/authors"
            className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            {t("authorDetail.back")}
          </Link>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-20 text-center">
            <User size={36} className="mx-auto mb-4 text-slate-300" />
            <p className="text-sm text-slate-500">{t("authorDetail.notFound")}</p>
          </div>
        </div>
      </section>
    );
  }

  // Ma'lumotlarni olish
  let imagePath = author.main_image_url || null;
  if (!imagePath && author.images?.length) {
    const mainImg = author.images.find((img) => img.is_main === true);
    imagePath = mainImg?.url || author.images[0]?.url || null;
  }
  const imageUrl = getImageUrl(imagePath);

  const fullName = getFullName();
  const nationality = getNationality();
  const biography = getBiography();
  const birthDate = formatDate(author.birth_date);
  const deathDate = formatDate(author.death_date);

  const birthYear = author.birth_date ? new Date(author.birth_date).getFullYear() : null;
  const deathYear = author.death_date ? new Date(author.death_date).getFullYear() : null;
  const years =
    birthYear && deathYear
      ? `${birthYear} – ${deathYear}`
      : birthYear
      ? `${birthYear}`
      : "";

  // ===== CONTENT =====
  return (
    <section className="bg-white">
      <SEO
        title={fullName}
        description={truncateForMeta(biography) || `${fullName} — ${t("authorDetail.defaultDesc")}`}
        image={imageUrl}
        path={`/authors/${id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: fullName,
          description: truncateForMeta(biography) || undefined,
          image: imageUrl || undefined,
          nationality: nationality || undefined,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Back */}
        <Link
          to="/authors"
          className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {t("authorDetail.back")}
        </Link>

        <div className={`grid gap-10 lg:gap-14 ${imageUrl ? "lg:grid-cols-[400px_1fr]" : ""}`}>
          {/* ── Chap: rasm ── */}
          {imageUrl && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="group block w-full overflow-hidden rounded-2xl bg-slate-100 shadow-md transition-transform duration-200 hover:scale-[1.02] focus:outline-none"
                aria-label={t("authorDetail.clickToZoom")}
              >
                <img
                  src={imageUrl}
                  alt={fullName}
                  loading="lazy"
                  className="w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">
                {t("authorDetail.clickToZoom")}
              </p>
            </div>
          )}

          {/* ── O'ng: kontent ── */}
          <div>
            {/* Sarlavha */}
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {fullName}
            </h1>

            {nationality && (
              <p className="mt-2 text-base text-slate-500">{nationality}</p>
            )}

            {/* Yillar */}
            {years && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Calendar size={16} className="shrink-0 text-blue-700" />
                <span>{years}</span>
              </div>
            )}

            {/* Tug'ilgan / vafot */}
            {(birthDate || deathDate) && (
              <p className="mt-1 text-sm text-slate-400">
                {birthDate && <span>{t("authorDetail.birth")}: {birthDate}</span>}
                {birthDate && deathDate && <span className="mx-2">•</span>}
                {deathDate && <span>{t("authorDetail.death")}: {deathDate}</span>}
              </p>
            )}

            <div className="mt-7 h-px w-full bg-slate-100" />

            {/* Biografiya */}
            {biography && (
              <div className="mt-7">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {t("authorDetail.biography")}
                </h2>
                <div className="whitespace-pre-line text-base leading-8 text-slate-600">
                  {biography}
                </div>
              </div>
            )}

            {/* Kitoblar soni */}
            {author.books_count != null && (
              <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
                <span className="text-sm text-slate-500">
                  {t("authorDetail.booksCount")}:
                </span>
                <span className="text-lg font-semibold text-slate-900">
                  {author.books_count}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== IMAGE MODAL ===== */}
      {showModal && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative max-h-[95vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              aria-label="Yopish"
            >
              <X size={20} />
            </button>
            <img
              src={imageUrl}
              alt={fullName}
              className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <p className="mt-3 text-center text-sm text-white/70">{fullName}</p>
          </div>
        </div>
      )}
    </section>
  );
}
