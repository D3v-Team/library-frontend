import { forwardRef } from "react";

import cx from "../lib/cx";

const Textarea = forwardRef(function Textarea(
  { className, invalid, rows = 5, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cx(
        "w-full resize-y rounded-field border bg-paper-3 px-3.5 py-2.5",
        "font-sans text-[0.9rem] leading-relaxed text-fg placeholder:text-fg-faint",
        "transition-colors duration-1 ease-out-soft",
        invalid ? "border-clay" : "border-line hover:border-gold-dim",
        className,
      )}
      {...rest}
    />
  );
});

export default Textarea;
