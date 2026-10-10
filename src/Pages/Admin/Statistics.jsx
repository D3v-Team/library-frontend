import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, BookOpen, Library, RotateCcw, Sparkles, Users } from "lucide-react";

import AdminPageHeader from "./components/AdminPageHeader";
import AdminPageLoader from "./components/AdminPageLoader";
import FormField from "./components/FormField";

import {
  useGetStatisticsQuery,
  useUpdateStatisticsMutation,
} from "../../store/services/statistics.api";
import apiError from "../../lib/apiError";

/**
 * Raqamli ma'lumotlar — bosh sahifadagi "Kutubxona raqamlarda" bo'limi.
 *
 * Bitta yozuv: yaratish/o'chirish yo'q, faqat tahrirlash. Backendga
 * faqat o'zgargan maydonlar JSON da, son ko'rinishida yuboriladi.
 */
const GROUPS = [
  {
    title: "Umumiy kitob fondi",
    icon: Library,
    fields: [
      { key: "total_books_copies", label: "Nusxada" },
      { key: "total_books_titles", label: "Nomda" },
    ],
  },
  {
    title: "Badiiy adabiyotlar",
    icon: BookOpen,
    fields: [
      { key: "fiction_books_copies", label: "Nusxada" },
      { key: "fiction_books_titles", label: "Nomda" },
    ],
  },
  {
    title: "Sohaga oid adabiyotlar",
    icon: Sparkles,
    fields: [
      { key: "specialized_books_copies", label: "Nusxada" },
      { key: "specialized_books_titles", label: "Nomda" },
    ],
  },
  {
    title: "Faoliyat ko‘rsatkichlari",
    icon: Users,
    fields: [
      { key: "total_readers", label: "Kitobxonlar soni" },
      { key: "electronic_resources", label: "Elektron resurslar soni" },
      { key: "annual_events", label: "Yillik tadbirlar soni" },
    ],
  },
];

const KEYS = GROUPS.flatMap((g) => g.fields.map((f) => f.key));

const toForm = (stats) =>
  Object.fromEntries(KEYS.map((k) => [k, stats?.[k] != null ? String(stats[k]) : ""]));

const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export default function Statistics() {
  const { data, isLoading, error, refetch } = useGetStatisticsQuery();
  const [updateStatistics, { isLoading: isSaving }] = useUpdateStatisticsMutation();

  const stats = data?.data ?? data;
  const initial = useMemo(() => toForm(stats), [stats]);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  // Server javobi kelganda (yoki saqlangandan keyin) formani yangilaymiz
  useEffect(() => {
    setForm(initial);
    setErrors({});
  }, [initial]);

  const changed = KEYS.filter((k) => form[k] !== initial[k]);

  const n = (k) => (form[k] === "" ? null : Number(form[k]));

  /* Yumshoq tekshiruv: badiiy + sohaga oid = umumiy bo'lishi kutiladi.
     Bloklamaydi — fondda boshqa turdagi nashrlar ham bo'lishi mumkin. */
  const mismatch = ["copies", "titles"]
    .map((kind) => {
      const total = n(`total_books_${kind}`);
      const sum = (n(`fiction_books_${kind}`) ?? 0) + (n(`specialized_books_${kind}`) ?? 0);
      if (total == null || sum === 0 || total === sum) return null;
      return { kind: kind === "copies" ? "nusxa" : "nom", total, sum };
    })
    .filter(Boolean);

  const handleChange = (key, value) => {
    // Faqat raqam — manfiy va kasr son yo'q
    const clean = value.replace(/[^\d]/g, "");
    setForm((prev) => ({ ...prev, [key]: clean }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (changed.length === 0) {
      toast.error("Hech qanday o‘zgarish kiritilmagan");
      return;
    }

    const nextErrors = {};
    changed.forEach((k) => {
      if (form[k] === "") nextErrors[k] = "Qiymat kiriting";
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = Object.fromEntries(changed.map((k) => [k, Number(form[k])]));

    try {
      await updateStatistics(payload).unwrap();
      toast.success("Raqamli ma’lumotlar yangilandi");
    } catch (err) {
      toast.error(apiError(err, "Saqlashda xatolik yuz berdi"));
    }
  };

  if (isLoading) return <AdminPageLoader />;

  return (
    <div>
      <AdminPageHeader
        title="Raqamli ma’lumotlar"
        description="Bosh sahifadagi “Kutubxona raqamlarda” bo‘limida ko‘rinadigan ko‘rsatkichlar."
      />

      {error ? (
        <div className="rounded-xl bg-red-50 px-6 py-10 text-center text-red-600">
          Ma’lumotlarni yuklashda xatolik.
          <button
            type="button"
            onClick={refetch}
            className="ml-2 font-medium underline underline-offset-2"
          >
            Qayta urinish
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            {GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <section
                  key={group.title}
                  className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
                    group.fields.length > 2 ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon size={16} />
                    </span>
                    <h2 className="text-sm font-semibold text-slate-900">{group.title}</h2>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      group.fields.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"
                    }`}
                  >
                    {group.fields.map((field) => (
                      <div key={field.key}>
                        <FormField
                          label={field.label}
                          inputMode="numeric"
                          value={form[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          error={errors[field.key]}
                          placeholder="0"
                          className={form[field.key] !== initial[field.key] ? "border-amber-300 bg-amber-50/40" : ""}
                        />
                        <p className="mt-1 text-xs text-slate-400">
                          {form[field.key] !== "" ? fmt(form[field.key]) : "—"}
                          {form[field.key] !== initial[field.key] && initial[field.key] !== "" && (
                            <span className="ml-1.5 text-amber-600">(avval: {fmt(initial[field.key])})</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {mismatch.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                {mismatch.map((m) => (
                  <p key={m.kind}>
                    Badiiy + sohaga oid ({fmt(m.sum)} {m.kind}) umumiy fonddan ({fmt(m.total)} {m.kind}) farq qiladi.
                  </p>
                ))}
                <p className="mt-0.5 text-xs text-amber-700">
                  Bu xato emas, faqat eslatma — tekshirib ko‘ring.
                </p>
              </div>
            </div>
          )}

          <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">
              {changed.length > 0
                ? `${changed.length} ta maydon o‘zgartirildi`
                : stats?.updated_at
                  ? `Oxirgi yangilanish: ${new Date(stats.updated_at).toLocaleString("ru-RU")}`
                  : "O‘zgarish yo‘q"}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm(initial);
                  setErrors({});
                }}
                disabled={changed.length === 0 || isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw size={14} />
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={changed.length === 0 || isSaving}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isSaving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
