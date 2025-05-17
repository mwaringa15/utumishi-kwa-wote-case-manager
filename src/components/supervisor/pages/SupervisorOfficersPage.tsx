
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { OfficersTab } from "@/components/supervisor/OfficersTab";
import { useSupervisorOfficers } from "@/hooks/supervisor/useSupervisorOfficers";
import { OfficersPageHeader } from "@/components/supervisor/officers/OfficersPageHeader";
import { OfficersList } from "@/components/supervisor/officers/OfficersList";
import { useFetchStationData } from "@/components/supervisor/officers/useFetchStationData";

const SupervisorOfficersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    officers, 
    refreshData 
  } = useSupervisorOfficers(user?.id);

  const {
    stationId,
    stationName,
    supervisorProfile,
    availableOfficers,
    officerProfiles,
    isLoading
  } = useFetchStationData(user?.id);

  // If user is not logged in or not authorized, redirect
  useEffect(() => {
    if (!user || !["ocs", "commander", "administrator", "supervisor"].includes(user.role.toLowerCase())) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="flex-grow flex">
        <SidebarProvider>
          <SupervisorSidebar />
          <SidebarInset className="p-6">
            <OfficersPageHeader 
              stationName={stationName}
              supervisorProfile={supervisorProfile}
              availableOfficers={availableOfficers}
            />
            
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
