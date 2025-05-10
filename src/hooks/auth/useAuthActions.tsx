
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
      console.log("Login attempt for:", email);
      
      // Check for demo accounts first
      if (email === "leah@judiciary.go.ke" && password === "password123") {
        // Allow demo judiciary login to bypass actual authentication
        toast({
          title: "Login successful",
          description: "Welcome back, Leah (Judiciary)!",
        });
        
        console.log("Successful demo login for judiciary user");
        return { 
          user: { 
            id: "demo-judiciary-id",
            email: "leah@judiciary.go.ke", 
            role: "Judiciary" 
          }, 
          redirectPath: "/judiciary-dashboard" 
        };
      }
      
      if (email === "officer@police.go.ke" && password === "password123") {
        // Allow demo police officer login to bypass actual authentication
        toast({
          title: "Login successful",
          description: "Welcome back, Officer!",
        });
        
        console.log("Successful demo login for police officer");
        return { 
          user: { 
            id: "demo-officer-id",
            email: "officer@police.go.ke", 
            role: "Officer" 
          }, 
          redirectPath: "/officer-dashboard" 
        };
      }

      if (email === "supervisor@supervisor.go.ke" && password === "password123") {
        // Add demo supervisor login
        toast({
          title: "Login successful",
          description: "Welcome back, Supervisor!",
        });
        
        console.log("Successful demo login for supervisor user");
        return { 
          user: { 
            id: "demo-supervisor-id",
            email: "supervisor@supervisor.go.ke", 
            role: "Supervisor" 
          }, 
          redirectPath: "/supervisor-dashboard" 
        };
      }
      
      if (email === "public@example.com" && password === "password123") {
        // Allow demo public user login to bypass actual authentication
        toast({
          title: "Login successful",
          description: "Welcome back, Public User!",
        });
        
        console.log("Successful demo login for public user");
        return { 
          user: { 
            id: "demo-public-id",
            email: "public@example.com", 
            role: "Public" 
          }, 
          redirectPath: "/dashboard" 
        };
      }
      
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
        // Determine redirect path based on email domain
        let redirectPath = "/dashboard";
        let role = "Public";
        
        if (email.endsWith("@police.go.ke")) {
          console.log("Police officer login detected");
          redirectPath = "/officer-dashboard";
          role = "Officer";
        } else if (email.endsWith("@judiciary.go.ke")) {
          console.log("Judiciary login detected");
          redirectPath = "/judiciary-dashboard";
          role = "Judiciary";
        } else if (email.endsWith("@supervisor.go.ke")) {
          console.log("Supervisor login detected");
          redirectPath = "/supervisor-dashboard";
          role = "Supervisor";
        } else if (email.endsWith("@admin.police.go.ke") || 
                   email.endsWith("@commander.police.go.ke") || 
                   email.endsWith("@ocs.police.go.ke")) {
          console.log("Admin/Commander/OCS login detected");
          redirectPath = "/supervisor-dashboard";
          role = determineRoleFromEmail(email);
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

  // Helper function to determine role from email domain
  const determineRoleFromEmail = (email: string): UserRole => {
    if (email.endsWith("@admin.police.go.ke")) {
      return "Administrator";
    } else if (email.endsWith("@commander.police.go.ke")) {
      return "Commander";
    } else if (email.endsWith("@ocs.police.go.ke")) {
      return "OCS";
    }
    return "Public";
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
