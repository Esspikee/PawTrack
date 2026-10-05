import { useTranslation } from "../i18n/useTranslation";
import { Navigate, useLocation } from "react-router-dom";
import StatusPanel from "./StatusPanel";
import { usePawTrack } from "../context/usePawTrack";
import { hasToken } from "../services/api";

function ProtectedRoute({ children }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { authenticated, currentUser, userLoading } = usePawTrack();

  if (!hasToken() || (!authenticated && !userLoading)) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (userLoading && !currentUser) {
    return (
      <main className="auth-screen">
        <StatusPanel message={t("Verificando sesion...")} />
      </main>
    );
  }

  return children;
}

export default ProtectedRoute;
