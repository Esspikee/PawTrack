import { Navigate, useLocation } from "react-router-dom";
import StatusPanel from "./StatusPanel";
import { usePawTrack } from "../context/usePawTrack";
import { hasToken } from "../services/api";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { authenticated, userLoading } = usePawTrack();

  if (!hasToken() || (!authenticated && !userLoading)) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (userLoading) {
    return (
      <main className="auth-screen">
        <StatusPanel message="Verificando sesion..." />
      </main>
    );
  }

  return children;
}

export default ProtectedRoute;
