
import { useEffect, useCallback } from "react";
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
  
  // Fetch station data and officers for that station
  const {
    stationId,
    stationName,
    supervisorProfile,
    availableOfficers,
    officerProfiles,
    isLoading,
    refreshStationData
  } = useFetchStationData(user?.id);

  const { 
    officers, 
    refreshData,
    isLoading: officersLoading 
  } = useSupervisorOfficers(user?.id, stationId);

  // Function to refresh all officer data when a new officer is added
  const handleOfficerAdded = useCallback(() => {
    refreshData();
    refreshStationData();
  }, [refreshData, refreshStationData]);

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
              stationId={stationId}
              supervisorProfile={supervisorProfile}
              availableOfficers={availableOfficers}
              onOfficerAdded={handleOfficerAdded}
            />
            
            <OfficersTab 
              officers={officers}
              officerProfiles={officerProfiles}
              isLoading={isLoading || officersLoading}
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
