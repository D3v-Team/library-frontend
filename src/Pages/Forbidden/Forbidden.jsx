import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <span className="text-sm font-semibold tracking-[0.12em] text-slate-400">
        XATOLIK 403
      </span>

      <h1 className="mt-4 text-6xl font-semibold tracking-tight text-slate-900 sm:text-7xl">
        403
      </h1>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Kirish taqiqlangan
      </h2>

      <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
        Ushbu sahifani ko‘rish uchun sizda yetarli huquq yo‘q.
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        Bosh sahifaga qaytish
      </Link>
    </section>
  );
}
