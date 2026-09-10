import { Moon, Sun } from "lucide-react";

import { useTheme } from "../lib/useTheme";

/**
 * Yorug' / tungi rejim almashtirgichi.
 *
 * DIQQAT — hozircha header ga ULANMAGAN. Sayt komponentlari hali
 * `bg-white`, `text-slate-900` kabi qattiq yozilgan klasslarda ishlaydi;
 * tungi rejimni hoziroq yoqsak, sahifalar buzilib ko'rinadi.
 * Ulanish 3-bosqichda — header va footer tokenlarga o'tgandan keyin.
 *
 * Tokenlar va hook allaqachon tayyor, ya'ni har bir yangi komponent
 * shu daqiqadan boshlab ikkala mavzuda to'g'ri chiqadi.
 */
export default function ThemeToggle({ className = "" }) {
  const { resolved, toggle } = useTheme();
  const dark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
      title={dark ? "Yorug' rejim" : "Tungi rejim"}
      className={`
        inline-flex h-10 w-10 items-center justify-center rounded-field
        border border-line text-fg-muted
        transition-colors duration-1 ease-out-soft
        hover:border-gold hover:text-fg
        ${className}
      `}
    >
      {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
    </button>
  );
}
