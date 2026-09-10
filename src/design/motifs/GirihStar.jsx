/**
 * Girih — sakkiz burchakli yulduz.
 *
 * Bo'lim sarlavhalari va eyebrow larda takrorlanadigan belgi.
 * Ikonka emas, naqsh: rangni `currentColor` dan oladi va o'lchami
 * matn bilan birga o'sadi.
 */
export default function GirihStar({ size = 12, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Ikki kvadrat 45° burilib kesishadi — girihning eng sodda shakli */}
      <path
        d="M6 0 L12 6 L6 12 L0 6 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M1.7 1.7 H10.3 V10.3 H1.7 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
      />
    </svg>
  );
}
