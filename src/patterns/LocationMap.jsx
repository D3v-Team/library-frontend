import { MapPin } from "lucide-react";

import cx from "../lib/cx";

/**
 * Kutubxona joylashuvi — Google Maps embed.
 *
 * Koordinatalar admin panelidan keladi (`/contact/info` →
 * `latitude` / `longitude`). Bosh sahifada ham, Aloqa sahifasida ham
 * kerak bo'lgani uchun bitta joyda — ilgari ikkalasida qo'lda
 * takrorlangan edi.
 *
 * MUHIM: koordinata bo'lmasa xarita CHIZILMAYDI.
 * Eski kodda `data.latitude || 41.311081` degan zaxira qiymat bor edi —
 * bu Toshkent shahar markazi. Ya'ni koordinata kiritilmagan holatda
 * sayt kutubxonani butunlay boshqa shaharda ko'rsatardi. Bo'sh joy
 * noto'g'ri manzildan yaxshi.
 */
export default function LocationMap({
  latitude,
  longitude,
  address,
  title,
  height = "clamp(240px,32vh,340px)",
  className,
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return (
    <div className={cx("relative overflow-hidden rounded-card border border-line bg-paper-3", className)}>
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${lat},${lng}&hl=uz&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block w-full border-0"
        style={{ height }}
      />

      {/* Manzil yorlig'i — xarita ustida, qog'oz sirtda */}
      {address && (
        <div className="pointer-events-none absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-2.5 rounded-field border border-line bg-page/95 px-3 py-2 shadow-s1 backdrop-blur">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-field bg-ink text-gold">
            <MapPin size={14} strokeWidth={1.9} />
          </span>
          <span className="min-w-0 truncate font-display text-[0.88rem] font-medium text-fg">
            {address}
          </span>
        </div>
      )}
    </div>
  );
}
