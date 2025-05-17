
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
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

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
      setIsLoading(true);
      
      try {
        console.log("Initial station ID check:", { 
          userId: user?.id, 
          storedStationId: localStorage.getItem('selected_station_id') 
        });
        
        let effectiveStationId = localStorage.getItem('selected_station_id');
        
        if (!effectiveStationId && user) {
          // Fetch from user profile
          const { data: userData, error } = await supabase
            .from('users')
            .select('station_id')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (userData?.station_id) {
            effectiveStationId = userData.station_id;
            localStorage.setItem('selected_station_id', userData.station_id);
          }
        }
        
        console.log("Effective station ID:", effectiveStationId);
        setStationId(effectiveStationId);
        
        // Get station name
        if (effectiveStationId) {
          const { data: stationData, error: stationError } = await supabase
            .from('stations')
            .select('name')
            .eq('id', effectiveStationId)
            .single();
            
          if (stationError) throw stationError;
          
          if (stationData) {
            console.log("Station name found:", stationData.name);
            setStationName(stationData.name);
          }
        }
      } catch (error) {
        console.error("Error getting station ID:", error);
        toast({
          title: "Error",
          description: "Failed to get station information",
          variant: "destructive",
        });
      }
    };
    
    getStationId();
  }, [user, navigate, toast]);

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
              <div className="flex justify-between items-center mt-4">
                <div>
                  <h1 className="text-2xl font-bold">Officer Management</h1>
                  <p className="text-gray-500">View and manage officers in {stationName || 'Loading...'}</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Officer
                </Button>
              </div>
            </div>
            
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
