
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate } from "react-router-dom";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onLogin?: (email: string, password: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would authenticate with Supabase
      console.log("Login attempt:", data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (onLogin) {
        onLogin(data.email, data.password);
      } else {
        // Demo login - automatically redirect based on email domain
        let role = "Public";
        if (data.email.endsWith("@police.go.ke")) {
          role = "Officer";
          navigate("/officer-dashboard");
        } else {
          navigate("/dashboard");
        }
        
        toast({
          title: "Logged in successfully!",
          description: `Welcome back! You are logged in as: ${role}`,
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-kenya-black">Login to KPCMS</h2>
        <p className="text-gray-500 mt-1">Enter your credentials to access your account</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    type="email" 
                    {...field} 
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your password" 
                    type="password" 
                    {...field} 
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between items-center">
            <Link to="/forgot-password" className="text-sm text-kenya-green hover:underline">
              Forgot password?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-kenya-green hover:bg-kenya-green/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-kenya-green hover:underline">
                Register here
              </Link>
            </p>
          </div>
          
          {/* Demo Accounts Info */}
          <div className="border-t pt-4 mt-6">
            <p className="text-sm text-gray-500 text-center mb-2">Demo Accounts:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Public User: public@example.com / password123</p>
              <p>Police Officer: officer@police.go.ke / password123</p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
