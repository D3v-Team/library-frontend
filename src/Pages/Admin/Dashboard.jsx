import { BookOpen, Inbox, MessageCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { ADMIN_MENU } from "../../app/navigation/adminMenu.config";
import Skeleton from "../../ui/Skeleton";
import { useGetOnlineRequestsQuery } from "../../store/services/requests";
import { useGetContactMessagesQuery } from "../../store/services/message";
import { useGetBooksQuery } from "../../store/services/books.api";
import { useGetAuthorsQuery } from "../../store/services/avtors.api";

/**
 * Boshqaruv paneli.
 *
 * Ilgari faqat bo'limlarga havolalar edi va "Backend ulangach…" degan
 * vaqtinchalik matn turardi. Endi tepada adminga kerakli sonlar: kutib
 * turgan ishlar (yangi so'rovlar, o'qilmagan xabarlar) va fond hajmi.
 * Har son — bitta `limit: 1` so'rov, faqat `meta.total` o'qiladi.
 */
function StatCard({ to, icon: Icon, label, query, accent }) {
  const total = query.data?.meta?.total;

  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
          accent && total > 0 ? "bg-green-600 text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        {query.isLoading ? (
          <Skeleton className="mt-1 h-6 w-14" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums text-slate-900">
            {query.isError || total == null ? "—" : total.toLocaleString("ru-RU")}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const sections = ADMIN_MENU.filter((item) => item.path !== "/admin");

  const newRequests = useGetOnlineRequestsQuery({ page: 1, limit: 1, status: "NEW" });
  // Barcha xabarlar: `is_read` filtri backendda ishlamaydi
  const messages = useGetContactMessagesQuery({ page: 1, limit: 1 });
  const books = useGetBooksQuery({ page: 1, limit: 1 });
  const authors = useGetAuthorsQuery({ page: 1, limit: 1 });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Boshqaruv paneli</h1>
        <p className="mt-1 text-sm text-slate-500">Sayt kontenti va kelib tushgan murojaatlar.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard to="/admin/request" icon={Inbox} label="Yangi so‘rovlar" query={newRequests} accent />
        <StatCard to="/admin/message" icon={MessageCircle} label="Xabarlar" query={messages} />
        <StatCard to="/admin/books" icon={BookOpen} label="Fonddagi kitoblar" query={books} />
        <StatCard to="/admin/avtors" icon={Users} label="Mualliflar" query={authors} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Bo‘limlar</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-200">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <span className="truncate text-sm font-semibold text-slate-900">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
