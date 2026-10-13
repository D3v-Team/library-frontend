import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, ExternalLink, FileText, Play, Trash2, Upload } from "lucide-react";

import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import Skeleton from "../../../ui/Skeleton";
import { BASE_URL } from "../../../store/api";
import {
  useDeleteMediaItemMutation,
  useGetMediaAlbumByIdQuery,
  useUpdateMediaItemOrderMutation,
} from "../../../store/services/media";
import apiError from "../../../lib/apiError";

/**
 * Albom elementlari — ko'rish, tartiblash, o'chirish.
 *
 * Ilgari admin albomga fayl QO'SHA olardi, lekin ichidagi elementlarni
 * ko'ra, o'chira yoki tartiblay olmasdi — endpointlar bor edi, UI yo'q edi.
 *
 * Element shakli (GET /media-albums/{id}): { id, url, file_name, file_size,
 * thumbnail, order }. Video — YouTube havolasi; rasm va taqdimot — /media/... yo'li.
 *
 * Tartib: elementlarning `order` qiymatlari ko'pincha bir xil (0) bo'ladi.
 * Shuning uchun siljitishda butun ro'yxat yangi indekslar bilan qayta
 * raqamlanadi va faqat o'zgargan elementlar PATCH qilinadi.
 */
const mediaUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//.test(url) || url.startsWith("blob:")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

/** YouTube havolasidan video ID (watch?v=, youtu.be/, shorts/, embed/) */
function youtubeId(url) {
  const m = String(url ?? "").match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

function ItemPreview({ item, type }) {
  if (type === "VIDEO") {
    const id = youtubeId(item.url);
    const thumb = item.thumbnail ? mediaUrl(item.thumbnail) : id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    return (
      <div className="relative h-full w-full">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/70 text-white">
            <Play size={18} />
          </span>
        </span>
      </div>
    );
  }

  if (type === "PRESENTATION") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-slate-500">
        <FileText size={28} />
        <span className="line-clamp-2 break-all text-center text-xs">{item.file_name || "Taqdimot"}</span>
      </div>
    );
  }

  return (
    <img src={mediaUrl(item.url)} alt={item.file_name || ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
  );
}

export default function MediaItemsManager({ album, open, onClose, onAddItems }) {
  const { data, isLoading, isFetching, error, refetch } = useGetMediaAlbumByIdQuery(album?.id, {
    skip: !open || !album?.id,
  });
  const [deleteItem, { isLoading: isDeleting }] = useDeleteMediaItemMutation();
  const [updateOrder] = useUpdateMediaItemOrderMutation();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [moving, setMoving] = useState(false);

  const type = data?.type ?? album?.type;
  const items = useMemo(
    () => [...(data?.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data],
  );

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];

    // Faqat yangi indeksi eski `order` dan farq qiladiganlar yuboriladi
    const changes = next
      .map((item, i) => ({ item, order: i }))
      .filter(({ item, order }) => item.order !== order);

    setMoving(true);
    try {
      await Promise.all(
        changes.map(({ item, order }) =>
          updateOrder({ albumId: album.id, itemId: item.id, order }).unwrap(),
        ),
      );
    } catch (err) {
      toast.error(apiError(err, "Tartibni o‘zgartirib bo‘lmadi"));
    } finally {
      setMoving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem({ albumId: album.id, itemId: deleteTarget.id }).unwrap();
      toast.success("Element o‘chirildi");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiError(err, "Elementni o‘chirishda xatolik"));
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={album?.title_latin || "Albom"}
        description={`Albom elementlari${items.length ? ` · ${items.length} ta` : ""}`}
        size="lg"
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onAddItems}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Upload size={15} />
            Fayl qo‘shish
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full" rounded="card" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
            Elementlarni yuklashda xatolik.{" "}
            <button type="button" onClick={refetch} className="font-medium underline">
              Qayta urinish
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
            Bu albomda hali element yo‘q. «Fayl qo‘shish» orqali qo‘shing.
          </p>
        ) : (
          <ul className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${isFetching || moving ? "opacity-60" : ""}`}>
            {items.map((item, i) => (
              <li key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <ItemPreview item={item} type={type} />
                  <span className="absolute left-2 top-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 px-2 py-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0 || moving}
                      aria-label="Oldinga surish"
                      title="Oldinga surish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1 || moving}
                      aria-label="Orqaga surish"
                      title="Orqaga surish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div className="flex gap-1">
                    {item.url && (
                      <a
                        href={mediaUrl(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ochish"
                        title="Ochish"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      aria-label="O‘chirish"
                      title="O‘chirish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Elementni o‘chirish"
        description="Element albomdan butunlay o‘chiriladi."
      />
    </>
  );
}
