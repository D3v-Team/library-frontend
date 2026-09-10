import cx from "../lib/cx";
import GirihStar from "../design/motifs/GirihStar";

/**
 * Bo'sh holat — "boylik retsepti" ning eng muhim qoidasi.
 *
 * Audit topilmasi: hozir API bo'sh qaytarsa sahifa oq ekran bo'ladi
 * yoki komponent `return null` qiladi (Hero, Announcements,
 * ContactHome). Foydalanuvchi sayt buzilganini o'ylaydi.
 *
 * Bu yerda: naqsh, aniq matn va CHIQISH YO'LI. `actions` bo'sh
 * bo'lsa ham matn tushuntiradi — lekin taklif berish har doim yaxshi.
 */
export default function EmptyState({
  title,
  description,
  actions,
  icon,
  className,
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-card border border-line",
        "bg-paper-2 px-6 py-14 text-center",
        className,
      )}
    >
      {/* Girih to'ri — bo'sh joyni "ataylab bo'sh" ga aylantiradi */}
      <span
        aria-hidden="true"
        className="girih-tile pointer-events-none absolute inset-0 opacity-45"
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-3">
        <span className="text-gold" aria-hidden="true">
          {icon ?? <GirihStar size={20} />}
        </span>

        <h3 className="text-h3 font-semibold text-fg">{title}</h3>

        {description && (
          <p className="font-sans text-[0.9rem] leading-relaxed text-fg-muted">
            {description}
          </p>
        )}

        {actions && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
