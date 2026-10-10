import { useMemo } from "react";

import {
  BOOK_SOURCE_FILTER,
  useGetAllBooksQuery,
  useGetBooksQuery,
} from "../../store/services/books.api";
import { isExcelBook } from "./bookHelpers";

/**
 * Kitoblar sahifasining ikki bo'limi uchun ma'lumot:
 *   catalog  — qo'lda kiritilgan (muqova, janr, tavsif)
 *   register — Excel importi (fond kartotekasi)
 *
 * Har bo'lim o'z sahifasini va umumiy sonini qaytaradi — sonlar
 * bo'lim tugmalarida ko'rinadi, shuning uchun ikkalasi ham kerak.
 *
 * Ikki rejim (`BOOK_SOURCE_FILTER`, books.api.js):
 *   server  — har bo'lim alohida so'raladi, sahifa hajmicha (20/24 ta)
 *   klient  — backend filtr qo'shguncha: hammasi olinib ajratiladi
 */
const meta = (res, pageSize) => {
  const total = res.data?.meta?.total ?? 0;
  return {
    items: res.data?.data ?? [],
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
};

export default function useShelfBooks({ filters, catalogPage, catalogSize, registerPage, registerSize }) {
  const server = BOOK_SOURCE_FILTER;

  /* ---------- Server rejimi ---------- */
  const catalogRes = useGetBooksQuery(
    { ...filters, page: catalogPage, limit: catalogSize, source: "manual" },
    { skip: !server },
  );
  const registerRes = useGetBooksQuery(
    { ...filters, page: registerPage, limit: registerSize, source: "excel" },
    { skip: !server },
  );

  /* ---------- Klient rejimi ---------- */
  const allRes = useGetAllBooksQuery(filters, { skip: server });

  const split = useMemo(() => {
    if (server) return null;
    const all = allRes.data?.data ?? [];
    return {
      catalog: all.filter((book) => !isExcelBook(book)),
      register: all.filter(isExcelBook),
    };
  }, [server, allRes.data]);

  if (server) {
    return {
      catalog: meta(catalogRes, catalogSize),
      register: meta(registerRes, registerSize),
      isLoading: catalogRes.isLoading || registerRes.isLoading,
      isFetching: catalogRes.isFetching || registerRes.isFetching,
      error: catalogRes.error || registerRes.error,
    };
  }

  const slice = (list, page, size) => ({
    items: list.slice((page - 1) * size, page * size),
    total: list.length,
    totalPages: Math.max(1, Math.ceil(list.length / size)),
  });

  return {
    catalog: slice(split?.catalog ?? [], catalogPage, catalogSize),
    register: slice(split?.register ?? [], registerPage, registerSize),
    isLoading: allRes.isLoading,
    isFetching: allRes.isFetching,
    error: allRes.error,
  };
}
