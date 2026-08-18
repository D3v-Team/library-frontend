import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../Components/Other/Sidebar/Sidebar";
import AdminHeader from "../../Components/Other/Header/AdminHeader";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`
          min-h-screen
          transition-all duration-300

          ${collapsed ? "md:pl-20" : "md:pl-[270px]"}
        `}
      >
        <AdminHeader
          collapsed={collapsed}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main
          className="
          p-4
          sm:p-6
          lg:p-8
        "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
