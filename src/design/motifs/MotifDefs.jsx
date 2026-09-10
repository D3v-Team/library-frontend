/**
 * Naqsh ta'riflari — sahifada BIR MARTA chiziladi (PublicLayout).
 *
 * SVG `clipPath` ni CSS dan `clip-path: url(#id)` bilan chaqirish
 * uchun u hujjatda mavjud bo'lishi kerak. Har komponent o'z nusxasini
 * chizsa id lar takrorlanadi va brauzer birinchisini oladi — shuning
 * uchun ta'riflar bitta joyda.
 *
 * `clipPathUnits="objectBoundingBox"` — koordinatalar 0..1 oralig'ida,
 * ya'ni maska har qanday o'lchamdagi elementga cho'ziladi.
 */
export default function MotifDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      // Hujjat oqimidan butunlay chiqarib tashlanadi
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* Peshtoq — cho'qqili ravoq. Signatura shakl: rasm ramkasi
            uchun, tugma yoki input uchun emas. */}
        <clipPath id="peshtoq-arch" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.38 C0,0.20 0.30,0.055 0.5,0 C0.70,0.055 1,0.20 1,0.38 L1,1 Z" />
        </clipPath>

        {/* Yumshoq ravoq — kartochka va muqova uchun, tepasi yassiroq */}
        <clipPath id="peshtoq-soft" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.30 C0,0.13 0.22,0 0.5,0 C0.78,0 1,0.13 1,0.30 L1,1 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
