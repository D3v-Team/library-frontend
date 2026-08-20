import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import PublicLayout from "../layout/PublicLayout";
import MainLayout from "../layout/MainLayout";
import RoleGuard from "./RoleGuard";
import { ROUTES, ADMIN_ROUTES } from "./routes.config";
import Login from "../../Components/Common/Login";
import Loading from "../../Components/Other/UI/Loadings/Loading";

export default function AppRouter() {
  return (
    <Routes>
      {/* AUTH */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        }
      />

      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        {ROUTES.map((r) => (
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