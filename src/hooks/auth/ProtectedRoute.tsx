
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  element, 
  allowedRoles = [], 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kenya-green"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const role = user.role;
    if (role === "officer") {
      return <Navigate to="/officer-dashboard" replace />;
    } else if (role === "judiciary") {
      return <Navigate to="/judiciary-dashboard" replace />;
    } else if (role === "supervisor") {
      return <Navigate to="/supervisor-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return element;
}
