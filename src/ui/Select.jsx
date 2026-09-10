import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

import cx from "../lib/cx";

/**
 * Oddiy tanlash maydoni — brauzerning o'z <select> i ustida.
 *
 * Ataylab `react-select` emas: filtr panelidagi janr/muallif/yil
 * tanlovlari uchun brauzerning nativ ro'yxati mobilda ancha qulay
 * (tizim g'ildiragi) va klaviatura bilan ishlashi tekin keladi.
 */
const Select = forwardRef(function Select(
  { className, invalid, children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cx(
          "h-11 w-full appearance-none rounded-field border bg-paper-3 pl-3.5 pr-10",
          "font-sans text-[0.9rem] text-fg",
          "transition-colors duration-1 ease-out-soft",
          invalid ? "border-clay" : "border-line hover:border-gold-dim",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.8}
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-faint"
      />
    </div>
  );
});

export default Select;
