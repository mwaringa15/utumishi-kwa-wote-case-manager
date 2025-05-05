
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
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
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (session) {
          const supabaseUser = session.user;
          // Map Supabase user to our app's User type
          const appUser: User = {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
            email: supabaseUser.email || "",
            role: getRole(supabaseUser.email || ""),
            createdAt: supabaseUser.created_at
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const supabaseUser = session.user;
        // Map Supabase user to our app's User type
        const appUser: User = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
          email: supabaseUser.email || "",
          role: getRole(supabaseUser.email || ""),
          createdAt: supabaseUser.created_at
        };
        setUser(appUser);
      }
      setIsLoading(false);
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
    return "Officer";
  } else if (email.endsWith("@admin.police.go.ke")) {
    return "Administrator";
  } else if (email.endsWith("@commander.police.go.ke")) {
    return "Commander";
  } else if (email.endsWith("@ocs.police.go.ke")) {
    return "OCS";
  } else if (email.endsWith("@judiciary.go.ke")) {
    return "Judiciary";
  } else {
    return "Public";
  }
}
