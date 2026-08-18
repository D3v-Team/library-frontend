// src/pages/Media.jsx
import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Images,
  Play,
  FolderOpen,
  Image,
  ExternalLink,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetMediaAlbumsQuery } from "../../../store/services/media";
import { BASE_URL } from "../../../store/api";

// ================= HELPERS =================
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

const getMediaType = (type) => {
  const types = {
    PHOTO: "Fotogalereya",
    VIDEO: "Video",
    PRESENTATION: "Taqdimot",
  };
  return types[type] || "Media";
};

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
    /(?:youtube\.com\/v\/)([^?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&controls=1&modestbranding=1`;
};

const formatUrl = (url) => {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname;
  } catch {
    return url;
  }
};

export default function Media() {
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState("VIDEO");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // ================= API HOOKS =================
  const {
    data: albumsData,
    isLoading,
    error,
    refetch,
  } = useGetMediaAlbumsQuery({
    page: 1,
    limit: 100,
    type: activeTab,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Tilga qarab title ni olish
  const getTitle = (album) => {
    const lang = i18n.language;
    if (lang === "uz") return album.title_latin;
    if (lang === "ru") return album.title_ru;
    if (lang === "cyrl") return album.title_cyril;
    return album.title_latin || "Nomsiz";
  };

  // Tilga qarab description ni olish
  const getDescription = (album) => {
    const lang = i18n.language;
    if (lang === "uz") return album.title_uz || "";
    if (lang === "ru") return album.title_ru || "";
    if (lang === "cyrl") return album.title_cyril || "";
    return album.title_ru || album.title_cyril || "";
  };

  // ================= DERIVED DATA =================
  const albums = albumsData?.data ?? albumsData?.records ?? [];
  
  const items = albums.map((album) => {
    const firstItem = album.items?.[0];
    const videoUrl = firstItem?.url || null;
    const videoId = getYouTubeVideoId(videoUrl);
    const embedUrl = getYouTubeEmbedUrl(videoUrl);

    return {
      id: album.id,
      title: getTitle(album),
      description: getDescription(album),
      image: getImageUrl(album.cover_image || album.cover_url),
      type: album.type,
      is_public: album.is_public,
      created_at: album.created_at,
      video_url: videoUrl,
      video_id: videoId,
      embed_url: embedUrl,
      items: album.items || [],
      creator: album.creator,
      ...album,
    };
  });

  const currentItem = items[activeIndex] || items[0];

  // ================= HANDLERS =================
  const changeTab = useCallback((tab) => {
    setActiveTab(tab);
    setActiveIndex(0);
    setSelectedVideo(null);
    setIsVideoPlaying(false);
  }, []);

  const nextItem = useCallback(() => {
    if (items.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % items.length);
    setSelectedVideo(null);
    setIsVideoPlaying(false);
  }, [items.length]);

  const prevItem = useCallback(() => {
    if (items.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    setSelectedVideo(null);
    setIsVideoPlaying(false);
  }, [items.length]);

  const handlePlayVideo = useCallback((item) => {
    if (item.video_url) {
      setSelectedVideo(item);
      setIsVideoPlaying(true);
    }
  }, []);

  const closeVideo = useCallback(() => {
    setSelectedVideo(null);
    setIsVideoPlaying(false);
  }, []);

  // ================= EFFECTS =================
  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  // Til o'zgarganda slaydni yangilash
  useEffect(() => {
    setActiveIndex((prev) => prev);
  }, [i18n.language]);

  // ================= RENDER =================
  return (
    <section className="bg-slate-50 py-16 sm:py-12 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-blue-700" />
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-700">
                <Images size={17} />
                <span>{t("media.badge")}</span>
              </div>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t("media.heading")}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {t("media.description")}
            </p>
          </div>

          <div className="flex w-fit rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => changeTab("VIDEO")}
              className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "VIDEO"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Play size={15} />
              {t("media.videos")}
            </button>

            <button
              type="button"
              onClick={() => changeTab("PHOTO")}
              className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "PHOTO"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Images size={15} />
              {t("media.photos")}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
            <div className="min-h-[360px] animate-pulse rounded-2xl bg-blue-700 sm:min-h-[460px]" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="min-h-[170px] animate-pulse rounded-xl bg-blue-700"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
            {t("media.error")}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FolderOpen className="mx-auto mb-3 text-slate-400" size={48} />
            <p className="text-sm text-slate-500">
              {activeTab === "VIDEO" ? t("media.noVideos") : t("media.noPhotos")}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
            {/* MAIN MEDIA */}
            <div className="group relative min-h-[360px] overflow-hidden rounded-2xl bg-slate-900 sm:min-h-[460px]">
              {/* VIDEO PLAYER */}
              {selectedVideo && (
                <div className="absolute inset-0 z-10">
                  <iframe
                    src={selectedVideo.embed_url}
                    title={selectedVideo.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ pointerEvents: 'auto' }}
                  />
                  
                  <button
                    type="button"
                    onClick={closeVideo}
                    className="absolute right-4 top-4 z-20 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black/90"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              {/* IMAGE BACKGROUND */}
              {!selectedVideo && currentItem?.image && (
                <img
                  key={`${activeTab}-${currentItem.id}`}
                  src={currentItem.image}
                  alt={currentItem.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover animate-[mediaFade_500ms_ease-out]"
                />
              )}

              {!selectedVideo && !currentItem?.image && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <Image size={64} className="text-slate-600" />
                </div>
              )}

              {/* GRADIENT OVERLAY */}
              {!selectedVideo && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              )}

              {/* PLAY BUTTON */}
              {!selectedVideo && activeTab === "VIDEO" && currentItem?.video_url && (
                <button
                  type="button"
                  onClick={() => handlePlayVideo(currentItem)}
                  aria-label={t("media.play")}
                  className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-blue-700 shadow-xl transition-transform duration-300 hover:scale-105"
                >
                  <Play size={24} fill="currentColor" className="ml-1" />
                </button>
              )}

              {/* INFO */}
              {!selectedVideo && (
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-300">
                    {getMediaType(activeTab)}
                  </span>

                  <h3 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    {currentItem?.title || "Nomsiz"}
                  </h3>

                  {activeTab === "VIDEO" && currentItem?.video_url && (
                    <a
                      href={currentItem.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 hover:underline"
                    >
                      <ExternalLink size={14} />
                      {formatUrl(currentItem.video_url)}
                    </a>
                  )}

                  {currentItem?.description && (
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                      {currentItem.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {items
                .filter((_, index) => index !== activeIndex)
                .slice(0, 2)
                .map((item) => {
                  const isVideo = item.type === "VIDEO";
                  
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveIndex(items.findIndex((i) => i.id === item.id));
                        setSelectedVideo(null);
                        setIsVideoPlaying(false);
                      }}
                      className="group flex min-h-[170px] overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all duration-300 hover:border-slate-300 hover:shadow-md"
                    >
                      <div className="relative w-[42%] shrink-0 overflow-hidden bg-slate-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-slate-200">
                            <Image size={24} className="text-slate-400" />
                          </div>
                        )}

                        {isVideo && (
                          <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-blue-700 shadow">
                            <Play size={13} fill="currentColor" />
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                            {getMediaType(item.type)}
                          </span>

                          <h4 className="mt-2 text-base font-semibold leading-6 text-slate-900 transition-colors group-hover:text-blue-700">
                            {item.title}
                          </h4>

                          {isVideo && item.video_url && (
                            <span className="mt-1 block text-xs text-slate-400 truncate">
                              {formatUrl(item.video_url)}
                            </span>
                          )}
                        </div>

                        <ArrowRight
                          size={17}
                          className="text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-700"
                        />
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {!isLoading && !error && items.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
            <span className="text-sm text-slate-400">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevItem}
                disabled={items.length <= 1}
                aria-label={t("media.prev")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-all hover:border-blue-700 hover:bg-blue-700 hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={nextItem}
                disabled={items.length <= 1}
                aria-label={t("media.next")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-all hover:border-blue-700 hover:bg-blue-700 hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* <Link
              to="/media"
              className="group hidden items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700 sm:flex"
            >
              {t("media.all")}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link> */}
          </div>
        )}
      </div>

      <style>{`
        @keyframes mediaFade {
          from {
            opacity: 0;
            transform: scale(1.015);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}