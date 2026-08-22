import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import PublicLayout from "../layout/PublicLayout";
import MainLayout from "../layout/MainLayout";
import RoleGuard from "./RoleGuard";
import { ROUTES, ADMIN_ROUTES } from "./routes.config";
import Loading from "../../Components/Other/UI/Loadings/Loading";

export default function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC (Login ham routes.config da lazy import qilingan) */}
      <Route element={<PublicLayout />}>
        {ROUTES.map((r) => (
          <Route
            key={r.path}
            path={r.path}
            element={
              <Suspense fallback={null}>
                <r.component />
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* AUTH — Login routes.config da lazy, shu yerda alohida chiqaramiz */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<Loading />}>
            {(() => {
              const LoginRoute = ROUTES.find((r) => r.path === "/login");
              return LoginRoute ? <LoginRoute.component /> : null;
            })()}
          </Suspense>
        }
      />

      {/* ADMIN */}
      <Route element={<RoleGuard allow={["ADMIN", "SUPER_ADMIN"]} />}>
        <Route element={<MainLayout />}>
          {ADMIN_ROUTES.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={
                <Suspense fallback={<Loading />}>
                  <r.component />
                </Suspense>
              }
            />
          ))}
        </Route>
      </Route>
    </Routes>
  );
}
