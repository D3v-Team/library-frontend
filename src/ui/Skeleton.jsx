import cx from "../lib/cx";

/**
 * Yuklanish holati.
 *
 * Audit topilmasi: hozir hamma joyda `animate-pulse bg-slate-300` —
 * iliq zaminda bu to'q kulrang blok bo'lib ko'rinadi, ya'ni sahifa
 * yuklanmoqda emas, buzilgandek taassurot beradi.
 *
 * Bu yerda naqsh 12: cho'kkan sirt (--paper-3) ustidan o'tadigan
 * yengil tilla shu'la.
 *
 * MUHIM: skeleton haqiqiy kontentning O'LCHAMINI takrorlashi kerak,
 * aks holda kontent kelganda sahifa sakraydi (layout shift).
 */
/* Klass nomlari TO'LIQ yozilishi kerak: Tailwind manba kodini matn
   sifatida skanerlaydi, `rounded-${x}` kabi yig'ilgan nomni topa
   olmaydi va u CSS ga umuman tushmaydi. */
const ROUNDED = {
  field: "rounded-field",
  card: "rounded-card",
  panel: "rounded-panel",
  full: "rounded-full",
  none: "rounded-none",
};

export default function Skeleton({ className, rounded = "field", ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={cx("block u-shimmer", ROUNDED[rounded] || ROUNDED.field, className)}
      {...rest}
    />
  );
}

/** Ko'p qatorli matn uchun — oxirgi qatori qisqaroq, tabiiy ko'rinadi */
export function SkeletonText({ lines = 3, className }) {
  return (
    <span className={cx("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: i === lines - 1 ? "62%" : "100%" }}
        />
      ))}
    </span>
  );
}
