
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on initial render
  useEffect(() => {
    console.log("Auth provider initializing...");
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (session) {
          const supabaseUser = session.user;
          
          // Get user role and station ID from the edge function
          const fetchUserData = async () => {
            try {
              const { data, error } = await supabase.functions.invoke('get-station-id');
              
              if (error) {
                console.error("Error fetching user data:", error);
                return;
              }
              
              // Use the normalized role from the edge function
              const userRole = data.role as UserRole;
              
              console.log("User data from get-station-id:", data);
              
              // Map Supabase user to our app's User type with role from edge function
              const appUser: User = {
                id: supabaseUser.id,
                name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
                email: supabaseUser.email || "",
                role: userRole,
                createdAt: supabaseUser.created_at
              };
              
              setUser(appUser);
              setIsLoading(false);
            } catch (err) {
              console.error("Error in fetchUserData:", err);
              
              // Fallback to role determination based on email domain
              const lowercaseRole = getRole(supabaseUser.email || "").toLowerCase();
              const userRole = lowercaseRole as UserRole;
              
              const appUser: User = {
                id: supabaseUser.id,
                name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
                email: supabaseUser.email || "",
                role: userRole,
                createdAt: supabaseUser.created_at
              };
              
              setUser(appUser);
              setIsLoading(false);
            }
          };
          
          // Use setTimeout to avoid potential deadlocks with auth state change
          setTimeout(() => {
            fetchUserData();
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const supabaseUser = session.user;
        
        // Get user role and station ID from the edge function
        const fetchUserData = async () => {
          try {
            const { data, error } = await supabase.functions.invoke('get-station-id');
            
            if (error) {
              console.error("Error fetching user data:", error);
              return;
            }
            
            // Use the normalized role from the edge function
            const userRole = data.role as UserRole;
            
            console.log("Initial user data from get-station-id:", data);
            
            // Map Supabase user to our app's User type with role from edge function
            const appUser: User = {
              id: supabaseUser.id,
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
              email: supabaseUser.email || "",
              role: userRole,
              createdAt: supabaseUser.created_at
            };
            
            setUser(appUser);
            setIsLoading(false);
          } catch (err) {
            console.error("Error in initial fetchUserData:", err);
            
            // Fallback to role determination based on email domain
            const lowercaseRole = getRole(supabaseUser.email || "").toLowerCase();
            const userRole = lowercaseRole as UserRole;
            
            const appUser: User = {
              id: supabaseUser.id,
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
              email: supabaseUser.email || "",
              role: userRole,
              createdAt: supabaseUser.created_at
            };
            
            setUser(appUser);
            setIsLoading(false);
          }
        };
        
        fetchUserData();
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper to determine user role based on email domain
function getRole(email: string): User["role"] {
  if (email.endsWith("@police.go.ke")) {
    return "officer";
  } else if (email.endsWith("@admin.police.go.ke")) {
    return "administrator";
  } else if (email.endsWith("@commander.police.go.ke")) {
    return "commander";
  } else if (email.endsWith("@ocs.police.go.ke")) {
    return "ocs";
  } else if (email.endsWith("@judiciary.go.ke")) {
    return "judiciary";
  } else if (email.endsWith("@supervisor.go.ke")) {
    return "supervisor";
  } else {
    return "public";
  }
}
