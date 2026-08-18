import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ADMIN_MENU } from "../../../app/navigation/adminMenu.config";

function getCurrentLabel(pathname) {
  const match = ADMIN_MENU.find((item) =>
    item.end ? pathname === item.path : pathname.startsWith(item.path)
  );
  return match?.label ?? "Admin panel";
}

export default function AdminHeader({ onOpenMobile }) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Menyuni ochish"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        <Menu size={20} />
      </button>

      <span className="truncate text-sm font-semibold text-slate-900">
        {getCurrentLabel(location.pathname)}
      </span>
    </header>
  );
}
