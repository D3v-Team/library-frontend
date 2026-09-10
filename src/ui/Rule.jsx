import cx from "../lib/cx";

/**
 * Tilla hairline — bo'lim boshlanishining belgisi.
 *
 * Naqsh 5: `Reveal` ichida bo'lsa chapdan o'ngga chiziladi
 * (`transform: scaleX`), aks holda shunchaki turadi.
 *
 * Nega bezak emas: bu chiziq sahifadagi ritmni ko'rsatadi —
 * har bo'lim qayerdan boshlanganini ko'z darhol topadi.
 */
export default function Rule({ width = "full", className }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "u-rule block h-px bg-gold",
        width === "short" ? "w-9" : width === "half" ? "w-1/2" : "w-full",
        className,
      )}
    />
  );
}
