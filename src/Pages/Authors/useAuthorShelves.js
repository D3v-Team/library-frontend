import { useMemo } from "react";

import { useLocalized } from "../../lib/useLocalized";
import {
  useGetAuthorsQuery,
  useGetProfiledAuthorsQuery,
} from "../../store/services/avtors.api";
import { isIndexAuthor } from "./authorHelpers";

export const AUTHOR_SORTS = {
  az: { sortBy: "full_name_latin", sortOrder: "asc" },
  za: { sortBy: "full_name_latin", sortOrder: "desc" },
  new: { sortBy: "created_at", sortOrder: "desc" },
};

/**
 * Mualliflar sahifasining ikki tortmasi:
 *   profiles — qo'lda kiritilganlar (tarjimai hol, surat) — portret kartochkalar
 *   index    — Excel importidan (faqat ism) — ixcham ko'rsatkich
 *
 * So'rovlar: profillar — 1 ta (oz, hammasi olinadi, saralash klientda);
 * ko'rsatkich — 1 ta, faqat u ochiq bo'lganda, sahifa hajmicha.
 * Ko'rsatkich soni profillar so'rovidan: grandTotal - total.
 */
export default function useAuthorShelves({
  search,
  sortKey,
  shelfParam,
  profilesPage,
  profilesSize,
  indexPage,
  indexSize,
}) {
  const { pick } = useLocalized();

  const profiledRes = useGetProfiledAuthorsQuery({ search: search || undefined });
  const grandTotal = profiledRes.data?.meta?.grandTotal ?? 0;
  const profilesTotal = profiledRes.data?.meta?.total ?? 0;
  const indexTotal = Math.max(0, grandTotal - profilesTotal);

  // Parametr yo'q, profillar bo'sh, ko'rsatkichda esa bor — bo'sh sahifa ko'rsatmaymiz
  const shelf =
    shelfParam === "korsatkich" ||
    (!shelfParam && profiledRes.data && profilesTotal === 0 && indexTotal > 0)
      ? "index"
      : "profiles";

  const indexRes = useGetAuthorsQuery(
    { page: indexPage, limit: indexSize, search, ...AUTHOR_SORTS[sortKey] },
    { skip: shelf !== "index" || (profiledRes.data && indexTotal === 0) },
  );

  const profiles = useMemo(() => {
    const list = [...(profiledRes.data?.data ?? [])];
    if (sortKey === "new") {
      list.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    } else {
      list.sort((a, b) => pick(a, "full_name").localeCompare(pick(b, "full_name")));
      if (sortKey === "za") list.reverse();
    }
    return {
      items: list.slice((profilesPage - 1) * profilesSize, profilesPage * profilesSize),
      total: profilesTotal,
      totalPages: Math.max(1, Math.ceil(profilesTotal / profilesSize)),
    };
  }, [profiledRes.data, profilesTotal, sortKey, pick, profilesPage, profilesSize]);

  const index = useMemo(
    () => ({
      // Server sahifasiga oz sonli profilli muallif aralashib qolsa — chiqarib tashlanadi
      items: (indexRes.data?.data ?? []).filter(isIndexAuthor),
      total: indexTotal,
      totalPages: Math.max(1, indexRes.data?.meta?.totalPages ?? Math.ceil(grandTotal / indexSize)),
    }),
    [indexRes.data, indexTotal, grandTotal, indexSize],
  );

  return {
    shelf,
    profiles,
    index,
    isLoading: profiledRes.isLoading || (shelf === "index" && indexRes.isLoading),
    isFetching: profiledRes.isFetching || indexRes.isFetching,
    error: profiledRes.error || indexRes.error,
  };
}
