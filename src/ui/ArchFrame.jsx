import cx from "../lib/cx";

/**
 * Peshtoq ramkasi — saytning signatura shakli.
 *
 * Rasmni cho'qqili ravoq maskasiga soladi. Faqat RASM uchun:
 * tugma, input yoki matn blokiga qo'llanmaydi (aks holda shakl
 * ma'nosini yo'qotadi va bezakka aylanadi).
 *
 * `reveal` — naqsh 4: hover da parda pastdan yuqoriga ochiladi.
 *
 * Maska ta'rifi design/motifs/MotifDefs.jsx da, sahifada bir marta.
 */
export default function ArchFrame({
  soft = false,
  reveal = false,
  ratio = "3 / 4",
  className,
  children,
}) {
  return (
    <div className={cx(reveal && "u-arch", "relative", className)}>
      <div
        className="relative overflow-hidden bg-ink-deep"
        style={{
          aspectRatio: ratio,
          clipPath: `url(#${soft ? "peshtoq-soft" : "peshtoq-arch"})`,
        }}
      >
        {children}

        {reveal && (
          <span
            aria-hidden="true"
            className="u-arch-veil bg-paper-3"
          />
        )}
      </div>
    </div>
  );
}
