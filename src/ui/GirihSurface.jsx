import cx from "../lib/cx";
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
