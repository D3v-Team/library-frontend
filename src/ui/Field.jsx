import { useId } from "react";

import cx from "../lib/cx";

/**
 * Forma maydoni uchun umumiy qobiq: label + xato + izoh.
 *
 * Audit topilmasi: hozirgi formalarda label ko'pincha `placeholder`
 * bilan almashtirilgan. Placeholder yozuv boshlanishi bilan
 * yo'qoladi — foydalanuvchi maydon nima uchun ekanini eslay olmaydi,
 * ekran o'qish dasturi esa uni umuman aytmaydi.
 *
 * `htmlFor` va `aria-describedby` avtomatik ulanadi.
 */
export default function Field({
  label,
  hint,
  error,
  required = false,
  className,
  children,
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="font-sans text-[0.8rem] font-semibold text-fg"
        >
          {label}
          {required && (
            <span className="ml-1 text-clay" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Bola elementga id va aria bog'lanishlari uzatiladi */}
      {typeof children === "function"
        ? children({
            id,
            "aria-describedby": cx(hintId, errorId) || undefined,
            "aria-invalid": error ? true : undefined,
            "aria-required": required || undefined,
          })
        : children}

      {hint && !error && (
        <p id={hintId} className="text-[0.78rem] text-fg-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-[0.78rem] text-clay">
          {error}
        </p>
      )}
    </div>
  );
}
