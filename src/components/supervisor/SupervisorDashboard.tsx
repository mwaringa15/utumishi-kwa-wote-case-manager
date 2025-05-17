
import { SupervisorDashboardProps } from "@/components/supervisor/types";
import SupervisorDashboardContent from "@/components/supervisor/SupervisorDashboardContent";
import { useStationData } from "@/hooks/supervisor/useStationData";
import { useAuth } from "@/hooks/useAuth";
import { useSupervisorOfficers } from "@/hooks/supervisor/useSupervisorOfficers";
import { OfficersTab } from "@/components/supervisor/OfficersTab";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const { stationData, loading, handleAssignCase } = useStationData(user);
  const { officers, isLoading: officersLoading, stationName } = useSupervisorOfficers(user?.id);

  if (window.location.pathname.includes('/supervisor-dashboard/officers')) {
    return (
      <div className="flex-grow flex">
        <SidebarProvider>
          <SupervisorSidebar />
          <SidebarInset className="p-6">
            <div className="mb-6">
              <BackButton />
              <h1 className="text-2xl font-bold mt-4">Officer Management</h1>
              <p className="text-gray-500">View and manage officers in {stationName}</p>
            </div>
            
            <OfficersTab 
              officers={officers}
              isLoading={officersLoading}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <SupervisorDashboardContent 
      user={user} 
      stationData={stationData} 
      loading={loading}
      onAssignCase={handleAssignCase}
    />
  );
};

export default SupervisorDashboard;
