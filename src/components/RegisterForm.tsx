
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  nationalId: z.string().min(6, "National ID must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

interface RegisterFormProps {
  onRegister?: (data: Omit<FormValues, "confirmPassword">) => void;
}

const RegisterForm = ({ onRegister }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      nationalId: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would register with Supabase
      const { confirmPassword, ...registerData } = data;
      console.log("Registration data:", registerData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      if (onRegister) {
        onRegister(registerData);
      } else {
        // Mock successful registration
        toast({
          title: "Registration successful!",
          description: "Your account has been created. You can now login.",
        });
        
        // Redirect to login page
        navigate("/login");
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was a problem creating your account",
        variant: "destructive",
      });
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nationalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID</FormLabel>
                  <FormControl>
                    <Input placeholder="ID number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 0712345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
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
                    placeholder="Create a strong password" 
                    type="password" 
                    {...field} 
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Confirm your password" 
                    type="password" 
                    {...field} 
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
