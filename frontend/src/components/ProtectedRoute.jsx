import { Navigate, useLocation } from "react-router-dom";
import { hasToken } from "../services/api";

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!hasToken()) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
