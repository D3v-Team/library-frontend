import { useEffect, useRef, useState } from "react";

import useDebouncedValue from "./useDebouncedValue";

/**
 * URL dagi qidiruv parametri uchun kiritish maydoni holati.
 *
 * Maydon o'z holatida turadi, URL ga (`commit`) esa yozish to'xtagach
 * `delay` ms o'tib tushadi — har harfga yangi so'rov ketmaydi.
 * URL tashqaridan o'zgarsa (header qidiruvi, "Tozalash", orqaga
 * tugmasi) maydon ham yangilanadi; o'zimiz yozgan qiymat esa
 * foydalanuvchi yozayotgan matnni buzmaydi.
 *
 *   const [term, setTerm] = useDebouncedSearchParam(search, (q) => update({ q }));
 */
export default function useDebouncedSearchParam(value, commit, delay = 400) {
  const [term, setTerm] = useState(value);
  const debounced = useDebouncedValue(term, delay);
  const pushed = useRef(value);
  const commitRef = useRef(commit);
  commitRef.current = commit;

  useEffect(() => {
    const next = debounced.trim();
    if (next === value) return;
    pushed.current = next;
    commitRef.current(next);
    // faqat debounced qiymat o'zgarganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    if (value !== pushed.current) {
      pushed.current = value;
      setTerm(value);
    }
  }, [value]);

  return [term, setTerm];
}
