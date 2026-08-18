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
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          {ROUTES.map((r) => (
            <Route key={r.path} path={r.path} element={<r.component />} />
          ))}
        </Route>
        {/* ADMIN */}
        <Route element={<RoleGuard allow={["ADMIN", "SUPER_ADMIN"]} />}>
          <Route element={<MainLayout />}>
            {ADMIN_ROUTES.map((r) => (
              <Route key={r.path} path={r.path} element={<r.component />} />
            ))}
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}