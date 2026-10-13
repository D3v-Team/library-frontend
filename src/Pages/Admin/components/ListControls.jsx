import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import useDebouncedValue from "../../../lib/useDebouncedValue";

export function StatusBadge({ active, activeLabel = "Faol", inactiveLabel = "Yashirin" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

/**
 * Qidiruv maydoni — DEBOUNCE ichida.
 *
 * Ota sahifa `onChange` ni faqat yozish to'xtagach (`delay` ms) oladi.
 * Ilgari har harf ota holatini o'zgartirib, darhol yangi so'rov
 * yuborardi (12 ta admin sahifada). Maydon esa yozuvni darhol ko'rsatadi
 * — kechikish faqat so'rovda. Tashqaridan `value` o'zgarsa (masalan,
 * tozalash) maydon ham yangilanadi.
 */
export function SearchInput({ value, onChange, placeholder = "Qidirish...", delay = 400 }) {
  const [term, setTerm] = useState(value ?? "");
  const debounced = useDebouncedValue(term, delay);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastSent = useRef(value ?? "");

  useEffect(() => {
    if (debounced === lastSent.current) return;
    lastSent.current = debounced;
    onChangeRef.current(debounced);
  }, [debounced]);

  useEffect(() => {
    const next = value ?? "";
    if (next !== lastSent.current) {
      lastSent.current = next;
      setTerm(next);
    }
  }, [value]);

  return (
    <div className="relative w-full sm:w-72">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-slate-900"
      />
    </div>
  );
}

export function FilterSelect({ value, onChange, options, placeholder = "Barchasi" }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-slate-900"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
