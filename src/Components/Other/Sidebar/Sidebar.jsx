import { NavLink, useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, X } from "lucide-react";
import Logo from "../../../Images/logo.png";
import { ADMIN_MENU } from "../../../app/navigation/adminMenu.config";
import { useAppDispatch } from "../../../store/hooks";
import { logout as logoutAction } from "../../../store/slices/auth.slice";
import { useLogoutMutation } from "../../../store/services/auth.api";


function LogoutButton({ collapsed }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutRequest] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      // Best-effort — invalidate the session on the server if we can,
      // but a failed/offline request should never block logging out
      // locally.
      await logoutRequest().unwrap();
    } catch {
      /* ignore */
    }

    dispatch(logoutAction());
    navigate("/login", { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      title={collapsed ? "Chiqish" : ""}
      className={`
      flex w-full items-center gap-3 rounded-xl px-3 py-3
      text-sm font-medium text-red-600 transition-colors duration-200
      hover:bg-red-50
      ${collapsed ? "justify-center" : ""}
      `}
    >
      <LogOut size={20} strokeWidth={2} className="shrink-0" />
      {!collapsed && <span>Chiqish</span>}
    </button>
  );
}


function MenuItems({ collapsed, onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
      {ADMIN_MENU.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            title={collapsed ? item.label : ""}
            className={({ isActive }) =>
              `
              group flex items-center gap-3 rounded-xl px-3 py-3
              text-sm font-medium transition-all duration-200
              ${
                collapsed
                  ? "justify-center"
                  : ""
              }
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }
              `
            }
          >
            <Icon
              size={20}
              strokeWidth={2}
              className="shrink-0"
            />

            {!collapsed && (
              <span className="truncate">
                {item.label}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}


export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
        hidden md:flex fixed left-0 top-0 bottom-0 z-40
        flex-col bg-white border-r border-slate-200
        transition-all duration-300
        ${
          collapsed
            ? "w-20"
            : "w-[270px]"
        }
        `}
      >

        {/* Brand */}
        <div className="
          flex h-20 items-center justify-between
          border-b border-slate-100 px-4
        ">

          {!collapsed && (
            <div className="flex items-center gap-3">

              <img
                src={Logo}
                alt="Logo"
                className="
                h-10 w-10
                rounded-lg
                object-contain
                "
              />

              <div>
                <h2 className="
                  text-sm
                  font-bold
                  text-slate-900
                ">
                  Kutubxona
                </h2>

                <p className="
                  text-xs
                  text-slate-400
                ">
                  Admin panel
                </p>
              </div>

            </div>
          )}


          {collapsed && (
            <img
              src={Logo}
              alt="Logo"
              className="
              mx-auto
              h-10
              w-10
              object-contain
              "
            />
          )}


          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="
              flex h-8 w-8
              items-center justify-center
              rounded-lg
              text-slate-500
              hover:bg-slate-100
              "
            >
              <ChevronLeft size={18}/>
            </button>
          )}

        </div>


        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="
            mx-auto mt-4
            flex h-8 w-8
            items-center justify-center
            rounded-lg
            text-slate-500
            hover:bg-slate-100
            "
          >
            <ChevronLeft
              size={18}
              className="rotate-180"
            />
          </button>
        )}


        <MenuItems
          collapsed={collapsed}
        />

        <div className="border-t border-slate-100 p-3">
          <LogoutButton collapsed={collapsed} />
        </div>

      </aside>



      {/* Mobile Overlay */}
      <div
        onClick={onCloseMobile}
        className={`
        fixed inset-0 z-40
        bg-black/40
        transition-opacity
        md:hidden
        ${
          mobileOpen
          ? "opacity-100"
          : "pointer-events-none opacity-0"
        }
        `}
      />



      {/* Mobile Sidebar */}
      <aside
        className={`
        fixed left-0 top-0 bottom-0
        z-50
        flex w-[75%]
        max-w-sm
        flex-col
        bg-white
        shadow-2xl
        transition-transform
        duration-300
        md:hidden

        ${
          mobileOpen
          ? "translate-x-0"
          : "-translate-x-full"
        }
        `}
      >

        <div className="
        flex h-20
        items-center
        justify-between
        border-b
        border-slate-100
        px-5
        ">

          <div className="flex items-center gap-3">

            <img
              src={Logo}
              alt="Logo"
              className="h-10 w-10 object-contain"
            />

            <div>
              <h2 className="
              text-sm
              font-bold
              text-slate-900
              ">
                Kutubxona
              </h2>

              <p className="
              text-xs
              text-slate-400
              ">
                Admin panel
              </p>

            </div>

          </div>


          <button
            onClick={onCloseMobile}
            className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            hover:bg-slate-100
            "
          >
            <X size={20}/>
          </button>

        </div>


        <MenuItems
          collapsed={false}
          onNavigate={onCloseMobile}
        />

        <div className="border-t border-slate-100 p-3">
          <LogoutButton collapsed={false} />
        </div>

      </aside>

    </>
  );
}