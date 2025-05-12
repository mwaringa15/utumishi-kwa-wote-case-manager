
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkForDemoAccount } from "./utils/demo-accounts";
import { determineRoleFromEmail } from "./utils/role-utils";
import { cleanupAuthState, attemptGlobalSignOut } from "./utils/auth-cleanup";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string, password: string, stationId?: string) => {
    setIsLoading(true);
    
    try {
      console.log("Login attempt for:", email, "with station:", stationId);
      
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
        
        if (role === "Officer") {
          console.log("Police officer login detected");
          redirectPath = "/officer-dashboard";
        } else if (role === "Judiciary") {
          console.log("Judiciary login detected");
          redirectPath = "/judiciary-dashboard";
        } else if (role === "Supervisor") {
          console.log("Supervisor login detected");
          redirectPath = "/supervisor-dashboard";
        } else if (role === "Administrator" || role === "Commander" || role === "OCS") {
          console.log("Admin/Commander/OCS login detected");
          redirectPath = "/supervisor-dashboard";
        } else {
          console.log("Public user login detected");
        }
        
        console.log(`User role determined as: ${role}, redirecting to: ${redirectPath}`);
        
        // Sync user role using the edge function with station info if provided
        try {
          const syncData = {
            id: user.id,
            email: user.email,
            role: role
          };
          
          // Include station_id if provided
          if (stationId) {
            syncData['station_id'] = stationId;
          }
          
          const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-user', {
            body: syncData
          });
          
          if (syncError) {
            console.error("Error syncing user:", syncError);
            toast({
              title: "Profile Sync Error",
              description: "Login successful but failed to sync user profile. Please contact admin.",
              variant: "destructive",
            });
          } else {
            console.log("User synced successfully:", syncResult);
          }
        } catch (syncErr) {
          console.error("Error invoking sync-user function:", syncErr);
          toast({
            title: "Profile Sync Error",
            description: "Login successful but failed to sync user profile. Please contact admin.",
            variant: "destructive",
          });
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
