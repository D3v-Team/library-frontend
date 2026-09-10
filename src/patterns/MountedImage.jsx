import cx from "../lib/cx";

/**
 * Rasm — qog'oz mat ustida, arxiv passportasi kabi.
 *
 * Nima uchun kerak: detail sahifalarida rasmni qat'iy nisbatga
 * solish HAR IKKI tomondan yomon chiqadi.
 *   · `aspect-[16/9] w-full` — rasm juda katta bo'lib ketadi
 *   · `h-[clamp(...)] w-full` — kengligi uzun, balandligi kalta
 *     lenta chiqadi va portret rasm butunlay kesiladi
 * Ikkalasini ham sinab ko'rdik.
 *
 * Yechim: rasmni KESMAYMIZ. U o'z nisbatini saqlaydi, faqat
 * balandligi cheklanadi (`maxHeight`). Qolgan joy iliq qog'oz
 * mat bo'lib turadi — kutubxona arxividagi passportaga o'ralgan
 * fotosurat kabi. Landshaft rasm kenglikni to'ldiradi, portret
 * rasm markazda tik turadi; ikkalasi ham buzilmaydi.
 */
export default function MountedImage({ src, alt = "", maxHeight = 420, caption, className }) {
  if (!src) return null;

  return (
    <figure className={cx("overflow-hidden rounded-card border border-line bg-paper-3", className)}>
      <div className="flex items-center justify-center p-3 sm:p-4">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="block w-auto max-w-full rounded-field object-contain shadow-s1"
          style={{ maxHeight: `${maxHeight}px` }}
        />
      </div>

      {caption && (
        <figcaption className="border-t border-line bg-paper-2 px-4 py-2.5 font-sans text-[0.8rem] text-fg-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
