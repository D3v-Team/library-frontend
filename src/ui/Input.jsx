import { forwardRef } from "react";

import cx from "../lib/cx";

/** Matn kiritish maydoni. Cho'kkan sirt (--paper-3) + tilla fokus. */
const Input = forwardRef(function Input({ className, invalid, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cx(
        "h-11 w-full rounded-field border bg-paper-3 px-3.5",
        "font-sans text-[0.9rem] text-fg placeholder:text-fg-faint",
        "transition-colors duration-1 ease-out-soft",
        invalid ? "border-clay" : "border-line hover:border-gold-dim",
        className,
      )}
      {...rest}
    />
  );
});

export default Input;
