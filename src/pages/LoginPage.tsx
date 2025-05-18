
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { getRedirectPathForRole } from "@/hooks/auth/utils/role-utils";
import { Toaster } from "@/components/ui/toaster";

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (user) {
      const redirectPath = getRedirectPathForRole(user.role);
      console.log("LoginPage: User detected, redirecting to", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string, stationId?: string) => {
    try {
      console.log("LoginPage handleLogin with stationId:", stationId);
      
      // Store selected station data for immediate access
      if (stationId) {
        localStorage.setItem('selected_station_id', stationId);
      }
      
      // Important: Store login result to use for redirection
      const result = await login(email, password, stationId);
      
      // Force immediate redirection without waiting for auth state changes
      if (result && result.user) {
        const redirectPath = getRedirectPathForRole(result.user.role);
        console.log("LoginPage handleLogin: Redirecting to", redirectPath);
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error("Login error in LoginPage:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <LoginForm onLogin={handleLogin} />
      </div>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default LoginPage;
