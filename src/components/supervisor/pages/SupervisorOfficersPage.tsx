
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";
import { OfficersTab } from "@/components/supervisor/OfficersTab";
import { useToast } from "@/hooks/use-toast";
import { useSupervisorOfficers } from "@/hooks/supervisor/useSupervisorOfficers";
import { fetchStationOfficersProfiles } from "@/hooks/supervisor/modules/fetchStationOfficersProfiles";
import { OfficerProfile } from "@/components/officer/profile/ProfileContainer";
import { supabase } from "@/integrations/supabase/client";

const SupervisorOfficersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stationId, setStationId] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string>("");
  const [officerProfiles, setOfficerProfiles] = useState<OfficerProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { 
    officers, 
    stationName: hookStationName,
    stationId: hookStationId,
    refreshData 
  } = useSupervisorOfficers(user?.id);

  // If user is not logged in or not authorized, redirect
  useEffect(() => {
    if (!user || !["ocs", "commander", "administrator", "supervisor"].includes(user.role.toLowerCase())) {
      navigate('/dashboard');
      return;
    }

    // Get supervisor's station ID from localStorage or fetch it
    const getStationId = async () => {
      const storedStationId = localStorage.getItem('selected_station_id');
      
      if (storedStationId) {
        setStationId(storedStationId);
      } else if (user) {
        // Fetch from user profile
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('station_id')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (userData?.station_id) {
            setStationId(userData.station_id);
            localStorage.setItem('selected_station_id', userData.station_id);
          }
        } catch (error) {
          console.error("Error fetching station ID:", error);
        }
      }
    };
    
    getStationId();
  }, [user, navigate]);

  // Set station name from the hook once available
  useEffect(() => {
    if (hookStationName) {
      setStationName(hookStationName);
    }
    
    if (hookStationId && !stationId) {
      setStationId(hookStationId);
    }
  }, [hookStationName, hookStationId, stationId]);

  // Fetch officer profiles once we have the station ID
  useEffect(() => {
    const fetchOfficers = async () => {
      if (!stationId) return;
      
      setIsLoading(true);
      try {
        const profiles = await fetchStationOfficersProfiles(stationId);
        setOfficerProfiles(profiles);
      } catch (error) {
        console.error("Error fetching officer profiles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch officer profiles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOfficers();
  }, [stationId, toast]);

  if (!user) return null;

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
              <p className="text-gray-500">View and manage officers in {stationName || 'Loading...'}</p>
            </div>
            
            {/* Use either the officer profiles data or fall back to the officers data */}
            <OfficersTab 
              officers={officers}
              officerProfiles={officerProfiles}
              isLoading={isLoading}
              stationName={stationName}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorOfficersPage;
