import { useEffect, useState } from "react";

/**
 * Qiymatni kechiktirib qaytaradi: foydalanuvchi `delay` ms davomida
 * yozishni to'xtatgandagina yangilanadi. Qidiruvda har harf uchun
 * so'rov ketmasligi uchun.
 */
export default function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
