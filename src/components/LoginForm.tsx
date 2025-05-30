import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  stationId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Station = {
  id: string;
  name: string;
};

interface LoginFormProps {
  onLogin: (email: string, password: string, stationId?: string) => Promise<any>;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      stationId: "",
    },
  });

  // Fetch stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data, error } = await supabase
          .from('stations')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error("Error fetching stations:", error);
          toast({
            title: "Error",
            description: "Failed to load stations. Please refresh the page.",
            variant: "destructive",
          });
        } else {
          setStations(data || []);
        }
      } catch (err) {
        console.error("Exception fetching stations:", err);
      } finally {
        setStationsLoading(false);
      }
    };

    fetchStations();
  }, [toast]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      console.log("Login attempt:", data);
      
      if (onLogin) {
        await onLogin(data.email, data.password, data.stationId || undefined);
        
        // Store the selected station name for display
        if (data.stationId) {
          const selectedStation = stations.find(station => station.id === data.stationId);
          if (selectedStation) {
            localStorage.setItem('selected_station_name', selectedStation.name);
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      // Error is already handled in the useAuth hook
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

          <FormField
            control={form.control}
            name="stationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select your station</FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={stationsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <div className="text-xs text-muted-foreground mt-1">
                  Officers and supervisors must select their station to view their assigned cases and reports
                </div>
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
              <p>Supervisor: supervisor@supervisor.go.ke / password123</p>
              <p>Judiciary: leah@judiciary.go.ke / password123</p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
