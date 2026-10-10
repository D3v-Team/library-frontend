import { Plus } from "lucide-react";

export default function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
  // Asosiy tugma yonidagi qo'shimcha amallar (masalan, "Excel yuklash")
  extraActions,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {(actionLabel || extraActions) && (
        <div className="flex flex-wrap items-center gap-2">
          {extraActions}

          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="
                inline-flex w-fit items-center gap-2
                rounded-lg
                border border-slate-200
                bg-white
                px-4 py-2.5
                text-sm font-semibold
                text-slate-700
                shadow-sm
                transition-all duration-200
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-900
                active:scale-[0.98]
              "
            >
              <Plus size={16} strokeWidth={2} />

              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
