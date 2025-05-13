
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";
import { OfficersTab } from "@/components/supervisor/OfficersTab";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

const SupervisorOfficersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [officers, setOfficers] = useState<User[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchOfficersData = async () => {
      setIsLoading(true);
      try {
        // 1. Get the user's station_id from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('station_id')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        
        const stationId = userData?.station_id;
        if (!stationId) {
          toast({
            title: "Station not found",
            description: "You are not assigned to any station",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // 2. Get officers for this station
        const { data: officersData, error: officersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status, station_id')
          .eq('station_id', stationId)
          .eq('role', 'Officer');

        if (officersError) throw officersError;

        // Get the station name
        const { data: stationData } = await supabase
          .from('stations')
          .select('name')
          .eq('id', stationId)
          .single();

        // Count assigned cases for each officer
        const officerCaseCounts: Record<string, number> = {};
        
        for (const officer of officersData) {
          const { count, error } = await supabase
            .from('cases')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_officer_id', officer.id)
            .not('status', 'eq', 'Completed');
            
          if (!error) {
            officerCaseCounts[officer.id] = count || 0;
          }
        }

        // Format officers data
        const formattedOfficers = officersData.map(officer => ({
          id: officer.id,
          name: officer.full_name || officer.email.split('@')[0],
          email: officer.email,
          role: officer.role,
          station: stationData?.name || 'Unknown Station',
          status: officer.status || 'on_duty',
          badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
          assignedCases: officerCaseCounts[officer.id] || 0
        }));

        setOfficers(formattedOfficers);
      } catch (error) {
        console.error("Error fetching officers data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load officers data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfficersData();
  }, [user, toast]);
  
  // If user is not logged in or not authorized, redirect
  if (!user || !["OCS", "Commander", "Administrator", "Supervisor"].includes(user.role)) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="flex-grow flex">
        <SidebarProvider>
          <SupervisorSidebar />
          <SidebarInset className="p-6">
            <div className="mb-6">
              <BackButton />
              <h1 className="text-2xl font-bold mt-4">Officer Management</h1>
              <p className="text-gray-500">View and manage officers in your station</p>
            </div>
            
            <OfficersTab 
              officers={officers}
              isLoading={isLoading}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorOfficersPage;
