
import React from 'react';
import { ProtectedRoute as AuthProtectedRoute } from '@/hooks/auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <AuthProtectedRoute element={<>{children}</>} />;
};

export default ProtectedRoute;
