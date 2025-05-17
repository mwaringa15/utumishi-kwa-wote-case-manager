
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";
import { determineRoleFromEmail } from "./utils/role-utils";

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const register = async (userData: { 
    name: string; 
    email: string; 
    password: string; 
    nationalId?: string; 
    phone?: string; 
    role?: UserRole;
    stationId?: string;  // Added stationId parameter
  }) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      const user = data.user;
      
      if (user) {
        // Determine role based on email domain
        let role = determineRoleFromEmail(userData.email);
        
        // Ensure the role is always stored as lowercase
        const normalizedRole = typeof role === 'string' ? role.toLowerCase() : role;
        
        // Sync user role using the edge function
        try {
          const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-user', {
            body: {
              id: user.id,
              email: user.email,
              role: normalizedRole,
              station_id: userData.stationId || null  // Pass stationId to sync-user function
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
      }
      
      toast({
        title: "Registration successful",
        description: `Account created for ${userData.email}`,
      });
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    register
  };
}
