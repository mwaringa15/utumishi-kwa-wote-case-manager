
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, "id" | "createdAt">) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on page load
  useEffect(() => {
    const storedUser = localStorage.getItem("kpcms-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("kpcms-user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login function - in a real app, this would authenticate with your backend
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Mock authentication - in a real app, you'd verify credentials with Supabase
      await new Promise(resolve => setTimeout(resolve, 800));

      // Demo login logic
      let role: UserRole = "Public";
      if (email.endsWith("@police.go.ke")) {
        role = "Officer";
      } else if (email.endsWith("@admin.police.go.ke")) {
        role = "Administrator";
      } else if (email.endsWith("@commander.police.go.ke")) {
        role = "Commander";
      }
      
      const newUser: User = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0],
        email,
        role,
        createdAt: new Date().toISOString(),
      };
      
      // Save user in localStorage for persisting the session
      localStorage.setItem("kpcms-user", JSON.stringify(newUser));
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("kpcms-user");
    setUser(null);
  };

  // Register function - in a real app, this would create the user in your backend
  const register = async (userData: Omit<User, "id" | "createdAt">) => {
    setIsLoading(true);
    
    try {
      // Mock registration - in a real app, you'd register with Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Auto-login after registration
      await login(userData.email, "password"); // Normally you wouldn't do this
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function withAuth<T>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!user) {
      return <div>You must be logged in to view this page.</div>;
    }
    
    return <Component {...props} />;
  };
}
