
import React, { createContext, ReactNode } from 'react';
import { AuthProvider as OriginalAuthProvider } from '@/hooks/auth';

// Re-export AuthProvider from hooks/auth
export const AuthContext = createContext({});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <OriginalAuthProvider>{children}</OriginalAuthProvider>;
};
