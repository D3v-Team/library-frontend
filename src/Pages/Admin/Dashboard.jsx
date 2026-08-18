import { Link } from "react-router-dom";
import { ADMIN_MENU } from "../../app/navigation/adminMenu.config";

export default function Dashboard() {
  const sections = ADMIN_MENU.filter((item) => item.path !== "/admin");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Boshqaruv paneli
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sayt kontentini shu yerdan boshqarasiz. Backend ulangach, har bir
          bo‘lim real ma'lumotlar bilan ishlaydi.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform duration-200 group-hover:scale-105">
                <Icon size={20} strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Boshqarish uchun kiring
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
