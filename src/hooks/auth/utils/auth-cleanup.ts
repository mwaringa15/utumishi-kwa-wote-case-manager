
import { supabase } from "@/integrations/supabase/client";

/**
 * Thoroughly clean up all Supabase auth state in local storage
 * to prevent auth issues when logging in/out
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  try {
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Ignore errors if sessionStorage is not available
  }
};

/**
 * Attempt a global sign out - we ignore any errors since this is a best-effort operation
 */
export const attemptGlobalSignOut = async () => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    console.warn("Global sign out attempt failed:", err);
    // We ignore errors here since this is just a best-effort operation
  }
};
