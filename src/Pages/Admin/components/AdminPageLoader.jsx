export default function AdminPageLoader() {
  return (
    <div className="w-full space-y-6 animate-pulse" aria-busy="true" aria-label="Sahifa yuklanmoqda">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
          <div className="h-4 w-72 rounded-md bg-slate-200/70" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-slate-200" />
      </div>

      {/* Search / Filter bar skeleton */}
      <div className="h-10 w-full max-w-sm rounded-lg bg-slate-200" />

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
          >
            <div className="h-36 w-full rounded-xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 rounded-md bg-slate-200" />
              <div className="h-4 w-1/2 rounded-md bg-slate-100" />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-100" />
                <div className="h-8 w-8 rounded-lg bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
