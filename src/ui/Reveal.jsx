import useReveal from "../lib/useReveal";

/**
 * Naqsh 1 — stagger reveal qobig'i.
 *
 * Bevosita bolalari ketma-ket chiqadi (45ms qadam), bir marta.
 *
 * Boshlang'ich holat KO'RINADIGAN: yashirish JS da qo'yiladi,
 * markupda emas. Sabab lib/useReveal.js izohida — JS yuklanmasa
 * kontent ko'rinib turishi kerak, aks holda sahifa qidiruv
 * tizimlari uchun ham bo'sh bo'ladi.
 */
export default function Reveal({
  as: As = "div",
  stagger = 45,
  group = true,
  className,
  children,
  ...rest
}) {
  const ref = useReveal({ stagger, group });

  return (
    <As ref={ref} className={className} {...rest}>
      {children}
    </As>
  );
}
