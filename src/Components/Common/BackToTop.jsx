import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Yuqoriga qaytish"
      /* Ostidagi "Online murojaat" tugmasi bilan JUFTLIK: ikkalasi
         ham siyoh zamin + tilla ikonka, hover da teskari. Ilgari bu
         oq/kulrang edi va yonidagi tugmadan butunlay farq qilardi. */
      className={`fixed bottom-20 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink bg-ink text-gold shadow-s2 transition-all duration-2 ease-out-soft hover:border-gold hover:bg-gold hover:text-ink-deep ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp size={19} strokeWidth={2} />
    </button>
  );
}