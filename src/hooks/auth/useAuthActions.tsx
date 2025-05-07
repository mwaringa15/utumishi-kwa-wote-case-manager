
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/types";

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }

      const user = data.user;
      
      if (user) {
        // Determine role and redirect based on email domain
        let role = "public";
        let redirectPath = "/dashboard";
        
        if (email.endsWith("@judiciary.go.ke")) {
          role = "judiciary";
          redirectPath = "/judiciary-dashboard";
        } else if (email.endsWith("@police.go.ke")) {
          role = "officer";
          redirectPath = "/officer-dashboard";
        } else if (email.endsWith("@supervisor.go.ke")) {
          role = "supervisor";
          redirectPath = "/supervisor-dashboard";
        } else if (email.endsWith("@admin.police.go.ke") || 
                   email.endsWith("@commander.police.go.ke") || 
                   email.endsWith("@ocs.police.go.ke")) {
          role = "supervisor";
          redirectPath = "/supervisor-dashboard";
        }
        
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
        
        return { user, redirectPath };
      }
      
    } catch (error: any) {
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

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out",
        variant: "destructive",
      });
    }
  };

  // Register function
  const register = async (userData: { name: string; email: string; password: string; nationalId?: string; phone?: string; role?: UserRole }) => {
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
        let role = "public";
        
        if (userData.email.endsWith("@judiciary.go.ke")) {
          role = "judiciary";
        } else if (userData.email.endsWith("@police.go.ke")) {
          role = "officer";
        } else if (userData.email.endsWith("@supervisor.go.ke")) {
          role = "supervisor";
        } else if (userData.email.endsWith("@admin.police.go.ke") || 
                   userData.email.endsWith("@commander.police.go.ke") || 
                   userData.email.endsWith("@ocs.police.go.ke")) {
          role = "supervisor";
        }
        
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
    login,
    logout,
    register
  };
}
