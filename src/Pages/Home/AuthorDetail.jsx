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

  // Tilga qarab ma'lumotlarni tanlash
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

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  if (isLoading) {
    return (
      <section className="bg-white py-16">
        <SEO {...SEO_CONFIG.authorDetail} />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
              <div className="h-64 w-64 rounded-2xl bg-slate-200" />
              <div className="flex-1 space-y-4">
                <div className="h-10 w-3/4 rounded bg-blue-700" />
                <div className="h-6 w-1/3 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
                <div className="h-32 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !author) {
    return (
      <section className="bg-white py-16">
        <SEO
          title={t("authorDetail.notFound")}
          description={SEO_CONFIG.authorDetail.description}
          noIndex
        />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
            {t("authorDetail.notFound")}
          </div>
        </div>
      </section>
    );
  }

  // Rasmni olish
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
    <section className="bg-white py-16">
      <SEO
        title={fullName}
        description={
          truncateForMeta(biography) ||
          `${fullName} — ${t("authorDetail.defaultDesc")}`
        }
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

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/authors"
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          {t("authorDetail.back")}
        </Link>

        <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Image - clickable */}
          <div className="shrink-0">
            <div
              className="overflow-hidden rounded-2xl bg-slate-100 shadow-lg cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              onClick={openModal}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={fullName}
                  loading="lazy"
                  className="h-64 w-64 object-cover sm:h-72 sm:w-72 lg:h-80 lg:w-80"
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center text-slate-300 sm:h-72 sm:w-72 lg:h-80 lg:w-80">
                  <User size={56} />
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400 lg:text-left">
              {t("authorDetail.clickToZoom")}
            </p>
          </div>

          {/* Information */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              {fullName}
            </h1>

            {nationality && (
              <p className="mt-2 text-lg text-slate-600">{nationality}</p>
            )}

            {years && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500 lg:justify-start">
                <Calendar size={18} className="text-blue-700" />
                <span>{years}</span>
              </div>
            )}

            {(birthDate || deathDate) && (
              <div className="mt-1 text-sm text-slate-400">
                {birthDate && (
                  <span>
                    {t("authorDetail.birth")}: {birthDate}
                  </span>
                )}
                {birthDate && deathDate && <span className="mx-2">•</span>}
                {deathDate && (
                  <span>
                    {t("authorDetail.death")}: {deathDate}
                  </span>
                )}
              </div>
            )}

            {biography && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                  {t("authorDetail.biography")}
                </h3>
                <div className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                  {biography}
                </div>
              </div>
            )}

            {author.books_count !== undefined && (
              <div className="mt-6 flex items-center justify-center gap-3 border-t border-slate-100 pt-6 lg:justify-start">
                <span className="text-sm font-medium text-slate-500">
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
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative max-h-[95vh] max-w-[95vw]">
            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute -right-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition-colors hover:bg-slate-100"
            >
              <X size={22} />
            </button>

            {/* Image */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={fullName}
                className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              />
            ) : (
              <div className="flex h-80 w-80 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
                <User size={80} />
              </div>
            )}

            {/* Image caption */}
            <p className="mt-3 text-center text-sm text-white/80">
              {fullName}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}