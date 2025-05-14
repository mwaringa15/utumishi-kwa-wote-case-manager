import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast"; // Updated import path
import { Link, useNavigate } from "react-router-dom";
import { PersonalInfoFields } from "./auth/PersonalInfoFields";
import { CredentialFields } from "./auth/CredentialFields";
import { 
  registerFormSchema, 
  RegisterFormValues, 
  RegisterFormProps,
  determineUserRole 
} from "./auth/register-form-schema";

const RegisterForm = ({ onRegister }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // toast usage is fine
  const navigate = useNavigate();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      nationalId: "",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      console.log("Registration data:", data);
      
      // Determine role based on email domain
      const role = determineUserRole(data.email);
      
      if (onRegister) {
        const { confirmPassword, ...registerData } = data;
        
        // Add user to supabase auth with proper type - ensuring required fields are passed explicitly
        await onRegister({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          nationalId: registerData.nationalId,
          phone: registerData.phone,
          role
        });
        
        // Navigate to login
        toast({ // toast usage is fine
          title: "Registration successful!",
          description: "Your account has been created. You can now login.",
        });
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      // Error is handled in useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-kenya-black">Create Account</h2>
        <p className="text-gray-500 mt-1">Register to access the KPCMS platform</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PersonalInfoFields control={form.control} />
          <CredentialFields control={form.control} />
          
          <Button 
            type="submit" 
            className="w-full bg-kenya-green hover:bg-kenya-green/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Register"}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-kenya-green hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
