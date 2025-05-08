
// This file is provided for backward compatibility
// It re-exports from the refactored location
// In the future, update imports to use "@/hooks/auth" directly

import { AuthProvider, useAuth as useAuthOriginal, withAuth } from "@/hooks/auth";
import { useAuthActions } from "@/hooks/auth/useAuthActions";

// Combine the hooks for backwards compatibility
const useExtendedAuth = () => {
  const authState = useAuthOriginal();
  const authActions = useAuthActions();
  
  return {
    ...authState,
    ...authActions
  };
};

// Re-export with the same name for backward compatibility
export { AuthProvider, useExtendedAuth as useAuth, withAuth };
