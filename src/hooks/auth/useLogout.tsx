
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { cleanupAuthState, attemptGlobalSignOut } from "./utils/auth-cleanup";

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Starting logout process...");
      
      // Clean up all Supabase auth tokens
      cleanupAuthState();
      
      // Attempt global sign out from Supabase
      await attemptGlobalSignOut();
      
      console.log("Logout successful");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Force page reload to clear all application state
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    logout
  };
}
