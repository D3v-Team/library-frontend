import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import PublicLayout from "../layout/PublicLayout";
import MainLayout from "../layout/MainLayout";
import RoleGuard from "./RoleGuard";
import { ROUTES, ADMIN_ROUTES } from "./routes.config";
import Loading from "../../Components/Other/UI/Loadings/Loading";
import AdminPageLoader from "../../Pages/Admin/components/AdminPageLoader";
import LoginPage from "../../Components/Common/Login";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<Loading />}>
            <LoginPage />
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
              <Suspense fallback={null}>
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
                <Suspense fallback={<AdminPageLoader />}>
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
