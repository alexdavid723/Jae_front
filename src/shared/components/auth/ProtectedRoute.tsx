import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[]; // roles permitidos
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const userData = localStorage.getItem("user");
  if (!userData) {
    // Usuario no autenticado
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(userData);
  
  if (roles && !roles.includes(user.role)) {
    // Usuario autenticado pero no tiene el rol necesario
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
