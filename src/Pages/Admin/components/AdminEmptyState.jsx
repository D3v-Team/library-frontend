// src/Pages/Admin/components/AdminEmptyState.jsx
import { FolderOpen } from "lucide-react";

export default function AdminEmptyState({
  title = "Ma'lumot topilmadi",
  icon: Icon = FolderOpen,
  className = "",
  children,
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center ${className}`}
    >
      {Icon && <Icon className="mx-auto mb-3 text-slate-300" size={32} />}
      <p className="text-sm text-slate-500">{title}</p>
      {children}
    </div>
  );
}
