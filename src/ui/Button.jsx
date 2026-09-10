import { forwardRef } from "react";
import { Link } from "react-router-dom";

import cx from "../lib/cx";

/**
 * Yagona tugma.
 *
 * Audit topilmasi: saytda tugmalar har joyda qo'lda yozilgan —
 * `rounded-lg`, `rounded-xl`, `rounded-full` aralash, hover rangi
 * har xil, fokus halqasi ko'p joyda yo'q.
 *
 * `to` bersangiz <Link>, `href` bersangiz <a>, aks holda <button>.
 * Shu tufayli "havola ko'rinishidagi tugma" muammosi yo'q:
 * navigatsiya doim haqiqiy havola bo'ladi (o'rta tugma, yangi oynada
 * ochish, ekran o'qish dasturi — hammasi ishlaydi).
 */

const VARIANTS = {
  // Birlamchi harakat — sahifada bittadan ortiq bo'lmasligi kerak
  primary:
    "bg-ink text-on-ink border-ink hover:bg-ink-soft hover:border-ink-soft",
  // Ikkilamchi — chegara bilan
  secondary:
    "bg-transparent text-fg border-line hover:border-gold hover:text-ink",
  // Uchlamchi — chegarasiz
  ghost:
    "bg-transparent text-fg-muted border-transparent hover:bg-paper-3 hover:text-fg",
  // Tilla — to'q sirtdagi BIRLAMCHI amal (hero CTA).
  // Alohida variant kerak edi: ilgari hero da `variant="primary"` ustiga
  // `className="bg-gold ... hover:bg-on-ink"` yozilgan edi. Ikki to'plam
  // bir xil xususiyatni belgilaydi va CSS da qaysi biri keyin turgani
  // g'alaba qiladi — klass atributidagi tartib emas. Natijada hover da
  // zamin ham, matn ham `on-ink` bo'lib, yozuv ko'rinmay qolgan edi.
  // Hover da SIYOH ga o'tadi, so'ngan tillaga emas: gold-dim (#8F7233)
  // ustidagi och matn faqat 4.0:1 kontrast berardi (AA uchun 4.5 kerak).
  // Siyoh zaminda esa 14.7:1 — matn har qanday ekranda o'qiladi.
  gold:
    "bg-gold text-ink-deep border-gold hover:bg-ink hover:border-ink hover:text-on-ink",
  // To'q sirt ustida (hero, footer)
  onInk:
    "bg-transparent text-on-ink border-on-ink/35 hover:border-gold hover:text-gold",
  // Buzg'unchi harakat
  danger:
    "bg-transparent text-clay border-clay/40 hover:bg-clay hover:text-on-ink hover:border-clay",
};

const SIZES = {
  sm: "h-9 px-3.5 text-[0.8rem] gap-1.5",
  md: "h-11 px-5 text-[0.875rem] gap-2",
  lg: "h-12 px-7 text-[0.95rem] gap-2.5",
};

const Button = forwardRef(function Button(
  {
    variant = "secondary",
    size = "md",
    to,
    href,
    type = "button",
    disabled = false,
    loading = false,
    iconStart,
    iconEnd,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = cx(
    "inline-flex items-center justify-center whitespace-nowrap",
    "rounded-field border font-sans font-semibold",
    "transition-colors duration-1 ease-out-soft",
    // Fokus halqasi global (design/base.css) — bu yerda takrorlanmaydi
    SIZES[size] || SIZES.md,
    VARIANTS[variant] || VARIANTS.secondary,
    (disabled || loading) && "pointer-events-none opacity-45",
    className,
  );

  const content = (
    <>
      {iconStart}
      {children}
      {iconEnd}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || undefined} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
});

export default Button;
