
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/RegisterForm";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAuthActions } from "@/hooks/auth/useAuthActions";

const RegisterPage = () => {
  const { user } = useAuth();
  const { register } = useAuthActions();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <RegisterForm onRegister={register} />
      </div>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;
