
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { getRedirectPathForRole } from "@/hooks/auth/utils/role-utils";

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (user) {
      const redirectPath = getRedirectPathForRole(user.role);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <LoginForm onLogin={login} />
      </div>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
