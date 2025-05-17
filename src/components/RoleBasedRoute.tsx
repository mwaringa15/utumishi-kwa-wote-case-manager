
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { getRedirectPathForRole } from '@/hooks/auth/utils/role-utils';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const currentRole = user.role.toLowerCase() as UserRole;
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase() as UserRole);
  
  if (!normalizedAllowedRoles.includes(currentRole)) {
    const redirectPath = getRedirectPathForRole(currentRole);
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

export default RoleBasedRoute;
