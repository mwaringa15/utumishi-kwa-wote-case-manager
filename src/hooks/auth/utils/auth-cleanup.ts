
import { supabase } from "@/integrations/supabase/client";

/**
 * Cleans up all Supabase auth tokens in localStorage to prevent
 * authentication limbo states
 */
export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Also try to clean sessionStorage if available
  try {
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (err) {
    // Ignore errors accessing sessionStorage
    console.log("Could not access sessionStorage");
  }
};

/**
 * Attempts a global sign out from Supabase
 * Returns true if successful, false otherwise
 */
export const attemptGlobalSignOut = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      console.error("Error during global sign out:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception during global sign out:", err);
    return false;
  }
};
