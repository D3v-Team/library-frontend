import cx from "../lib/cx";

/**
 * Signatura sirt — to'q siyoh zamin + girih naqsh to'ri.
 *
 * "Boylik retsepti" ning birinchi qoidasi: har sahifada KAMIDA
 * BITTA shunday sirt bo'ladi. Bu buyurtmachining "dizayn homroq"
 * mulohazasini eng tez hal qiladigan vosita — sahifaga vazn va
 * yakun beradi. Hozir butun sayt bir xil oq, shuning uchun hech
 * narsa ajralib turmaydi.
 *
 * Naqsh qoidasi: opasitet 13% dan oshmaydi, hech qachon
 * animatsiya qilinmaydi. Yagona istisno — scroll parallaksi
 * (naqsh 10), u `parallax` bilan yoqiladi.
 */
export default function GirihSurface({
  as: As = "div",
  tone = "deep",
  parallax = false,
  className,
  children,
  ...rest
}) {
  return (
    <As
      className={cx(
        "relative overflow-hidden",
        tone === "deep" ? "bg-ink-deep" : "bg-ink",
        "text-on-ink",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cx(
          "girih-tile pointer-events-none absolute inset-0",
          parallax && "u-parallax-tile",
        )}
      />
      <div className="relative">{children}</div>
    </As>
  );
}
