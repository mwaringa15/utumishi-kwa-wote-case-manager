
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkForDemoAccount } from "./utils/demo-accounts";
import { determineRoleFromEmail } from "./utils/role-utils";
import { cleanupAuthState, attemptGlobalSignOut } from "./utils/auth-cleanup";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Login attempt for:", email);
      
      // Check for demo accounts first
      const demoAccount = checkForDemoAccount(email, password);
      if (demoAccount) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${email.split("@")[0]}!`,
        });
        
        console.log("Successful demo login for user");
        return demoAccount;
      }
      
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Try global sign out (ignore any errors)
      await attemptGlobalSignOut();
      
      // Regular authentication flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error.message);
        throw error;
      }

      const user = data.user;
      
      if (user) {
        // Determine role based on email domain
        const role = determineRoleFromEmail(email);
        let redirectPath = "/dashboard";
        
        if (email.endsWith("@police.go.ke")) {
          console.log("Police officer login detected");
          redirectPath = "/officer-dashboard";
        } else if (email.endsWith("@judiciary.go.ke")) {
          console.log("Judiciary login detected");
          redirectPath = "/judiciary-dashboard";
        } else if (email.endsWith("@supervisor.go.ke")) {
          console.log("Supervisor login detected");
          redirectPath = "/supervisor-dashboard";
        } else if (email.endsWith("@admin.police.go.ke") || 
                   email.endsWith("@commander.police.go.ke") || 
                   email.endsWith("@ocs.police.go.ke")) {
          console.log("Admin/Commander/OCS login detected");
          redirectPath = "/supervisor-dashboard";
        } else {
          console.log("Public user login detected");
        }
        
        console.log(`User role determined as: ${role}, redirecting to: ${redirectPath}`);
        
        // Sync user role using the edge function
        try {
          const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-user', {
            body: {
              id: user.id,
              email: user.email,
              role: role
            }
          });
          
          if (syncError) {
            console.error("Error syncing user:", syncError);
          } else {
            console.log("User synced successfully:", syncData);
          }
        } catch (syncErr) {
          console.error("Error invoking sync-user function:", syncErr);
        }
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.email?.split("@")[0]}!`,
        });
        
        return { user: { ...user, role }, redirectPath };
      }
      
    } catch (error: any) {
      console.error("Login failed:", error.message);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    login
  };
}
