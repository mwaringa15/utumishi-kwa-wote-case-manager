
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";
import { OfficersTab } from "@/components/supervisor/OfficersTab";
import { useToast } from "@/hooks/use-toast";
import { useStationData } from "@/hooks/supervisor/useStationData";
import { fetchOfficers } from "@/hooks/supervisor/modules/fetchOfficers";
import { useState, useEffect as useReactEffect } from "react";

const SupervisorOfficersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stationData, loading } = useStationData(user);
  const [isLoading, setIsLoading] = useState(true);
  const [officers, setOfficers] = useState([]);

  // If user is not logged in or not authorized, redirect
  useEffect(() => {
    if (!user || !["ocs", "commander", "administrator", "supervisor"].includes(user.role.toLowerCase())) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load officers directly using the fetchOfficers function
  useReactEffect(() => {
    const getOfficers = async () => {
      setIsLoading(true);
      try {
        // Get station ID either from stationData or localStorage
        const stationId = stationData?.stationId || localStorage.getItem('selected_station_id');
        if (stationId) {
          const officersData = await fetchOfficers(stationId);
          setOfficers(officersData);
        }
      } catch (error) {
        console.error("Error fetching officers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch officers for this station",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getOfficers();
  }, [stationData, toast]);

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
              <p className="text-gray-500">View and manage officers in {stationData?.station || 'Loading...'}</p>
            </div>
            
            <OfficersTab 
              officers={officers}
              isLoading={isLoading || loading}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorOfficersPage;
