import { useMemo } from "react";

import { useGetBooksQuery, useGetCatalogBooksQuery } from "../../store/services/books.api";
import { isExcelBook } from "./bookHelpers";

/**
 * Kitoblar sahifasining ikki tortmasi uchun ma'lumot:
 *   catalog  — qo'lda kiritilgan (muqova, janr, tavsif)
 *   register — Excel importi (fond kartotekasi)
 *
 * So'rovlar soni (ilgari butun fond 100 tadan olinardi — 4 643 kitobda
 * 47 ta so'rov, qidiruvda har harfga yana shuncha):
 *   katalog   — 1 so'rov (getCatalogBooks, odatda bitta sahifa)
 *   kartoteka — 1 so'rov, faqat u ochiq bo'lganda, 20 tadan
 *   sonlar    — katalog so'rovining o'zidan (grandTotal - total)
 *
 * Kartoteka alifbo tartibida (`name_latin`) — kartoteka shkafi kabi.
 * `published_date` bo'yicha EMAS: Excel kitoblarining yili bir xil
 * (null), bunday tartib aniqlanmagan va sahifalar orasida kitoblar
 * takrorlanardi (o'lchab tekshirilgan). Server sahifasiga oz sonli
 * katalog kitobi aralashib qolsa, ular klientda olib tashlanadi.
 */
export default function useShelfBooks({
  filters,
  shelfParam,
  catalogPage,
  catalogSize,
  registerPage,
  registerSize,
}) {
  const catalogRes = useGetCatalogBooksQuery(filters);

  const grandTotal = catalogRes.data?.meta?.grandTotal ?? 0;
  const catalogTotal = catalogRes.data?.meta?.total ?? 0;
  const registerTotal = Math.max(0, grandTotal - catalogTotal);

  /* Ochiq tortma. Parametr yo'q bo'lsa — katalog; lekin katalog bo'sh,
     kartotekada esa kitob bo'lsa, tashrifchi bo'sh sahifa ko'rmasin. */
  const shelf =
    shelfParam === "kartoteka" ||
    (!shelfParam && catalogRes.data && catalogTotal === 0 && registerTotal > 0)
      ? "register"
      : "catalog";
  const registerOpen = shelf === "register";

  // Janr tanlansa kartoteka bo'sh (Excel kitoblarida janr yo'q) — so'rov ham kerak emas
  const registerRes = useGetBooksQuery(
    {
      ...filters,
      page: registerPage,
      limit: registerSize,
      sortBy: "name_latin",
      sortOrder: "asc",
    },
    { skip: !registerOpen || filters.genre_id || (catalogRes.data && registerTotal === 0) },
  );

  const catalog = useMemo(() => {
    const all = catalogRes.data?.data ?? [];
    return {
      items: all.slice((catalogPage - 1) * catalogSize, catalogPage * catalogSize),
      total: catalogTotal,
      totalPages: Math.max(1, Math.ceil(catalogTotal / catalogSize)),
    };
  }, [catalogRes.data, catalogTotal, catalogPage, catalogSize]);

  const register = useMemo(
    () => ({
      items: (registerRes.data?.data ?? []).filter(isExcelBook),
      total: registerTotal,
      // Server sahifalari BUTUN fond bo'yicha (katalog kitoblari ham ichida)
      totalPages: Math.max(
        1,
        registerRes.data?.meta?.totalPages ?? Math.ceil(grandTotal / registerSize),
      ),
    }),
    [registerRes.data, registerTotal, grandTotal, registerSize],
  );

  return {
    shelf,
    catalog,
    register,
    isLoading: catalogRes.isLoading || (registerOpen && registerRes.isLoading),
    isFetching: catalogRes.isFetching || registerRes.isFetching,
    error: catalogRes.error || registerRes.error,
  };
}
