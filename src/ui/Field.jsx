import { useId } from "react";

import cx from "../lib/cx";


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
