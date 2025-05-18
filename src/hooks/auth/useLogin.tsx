
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
      
      // Convert email to lowercase for consistent processing
      const lowercaseEmail = email.toLowerCase();
      
      // Check for demo accounts first
      const demoAccount = checkForDemoAccount(lowercaseEmail, password);
      if (demoAccount) {
        // If it's a supervisor or officer demo account, assign a station
        if (["supervisor", "officer"].includes(demoAccount.user.role)) {
          // For demo accounts, store a default station ID if none was selected
          if (stationId) {
            localStorage.setItem('selected_station_id', stationId);
            
            // Get station name for display
            try {
              const { data } = await supabase
                .from('stations')
                .select('name')
                .eq('id', stationId)
                .single();
                
              if (data) {
                localStorage.setItem('selected_station_name', data.name);
                
                toast({
                  title: "Station Selected",
                  description: `You are now assigned to ${data.name}`,
                });
              }
            } catch (err) {
              console.error("Error fetching station name:", err);
            }
            
            console.log("Demo account: stored station ID", stationId);
          }
        }
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${lowercaseEmail.split("@")[0]}!`,
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
        email: lowercaseEmail,
        password
      });
      
      if (error) {
        console.error("Login error:", error.message);
        throw error;
      }

      const user = data.user;
      
      if (user) {
        // Determine role based on email domain - ensure lowercase
        const role = determineRoleFromEmail(lowercaseEmail);
        
        console.log(`User role determined as: ${role}`);
        
        // Important: For supervisors and officers, always update station assignment if provided
        if (stationId && ["supervisor", "officer"].includes(role.toLowerCase())) {
          console.log(`Updating ${role} station assignment to: ${stationId}`);
          
          // Store selected station ID in localStorage for persistence
          localStorage.setItem('selected_station_id', stationId);
          
          // Get station name for display
          const { data: stationData } = await supabase
            .from('stations')
            .select('name')
            .eq('id', stationId)
            .single();
            
          if (stationData) {
            localStorage.setItem('selected_station_name', stationData.name);
          }
          
          // Update user's station assignment in the database
          const { error: updateError } = await supabase
            .from('users')
            .update({ station_id: stationId })
            .eq('id', user.id);
            
          if (updateError) {
            console.error("Error updating station assignment:", updateError);
            toast({
              title: "Station Assignment Error",
              description: "Could not update your station assignment. Some features may be limited.",
              variant: "destructive",
            });
          } else {
            console.log("Station assignment updated successfully");
            toast({
              title: "Station Assignment Successful",
              description: `You have been assigned to ${stationData?.name || 'the selected station'}.`,
            });
          }
        }
        
        // Sync user role using the edge function with station info if provided
        try {
          const syncData: any = {
            id: user.id,
            email: lowercaseEmail,
            role: role
          };
          
          // Include station_id if provided
          if (stationId) {
            console.log(`Adding station ID ${stationId} to user sync data`);
            syncData.station_id = stationId;
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
          // Don't block login if sync fails
        }
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.email?.split("@")[0]}!`,
        });
        
        // Return user with role info for immediate redirection
        return { user: { ...user, role } };
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
