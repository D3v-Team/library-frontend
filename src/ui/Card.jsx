import { Link } from "react-router-dom";

import cx from "../lib/cx";

/**
 * Sirt kartochkasi.
 *
 * Audit topilmasi: hozir kartochkalar `rounded-2xl shadow-sm`,
 * `rounded-xl border`, `rounded-3xl shadow-lg` — uch xil tizim
 * aralash. Bu yerda ikki daraja: yassi (chegara) va ko'tarilgan (soya).
 *
 * `interactive` — faqat BOSILADIGAN kartochkada. Bosilmaydigan
 * kartochka hover da ko'tarilmaydi: harakat javob bo'lishi kerak,
 * bezak emas (naqsh 2).
 */
export default function Card({
  as: As = "div",
  to,
  href,
  interactive = false,
  elevated = false,
  className,
  children,
  ...rest
}) {
  const classes = cx(
    "rounded-card border bg-paper-2 border-line",
    elevated && "shadow-s1",
    interactive && "u-lift block",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <As className={classes} {...rest}>
      {children}
    </As>
  );
}
