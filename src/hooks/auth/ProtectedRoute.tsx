
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { UserRole } from "@/types";
import { getRedirectPathForRole } from "./utils/role-utils";

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
  
  // Normalize current user role to lowercase
  const currentRole = user.role.toLowerCase() as UserRole;
  
  // Normalize allowed roles to lowercase for comparison
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase() as UserRole);
  
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(currentRole)) {
    // Get proper redirect path based on user's role
    const redirectPath = getRedirectPathForRole(currentRole);
    return <Navigate to={redirectPath} replace />;
  }
  
  return element;
}
