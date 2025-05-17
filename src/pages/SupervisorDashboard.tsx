
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar"; 
import { StatsOverview } from "@/components/supervisor/StatsOverview";
import { StationUnassignedCases } from "@/components/supervisor/StationUnassignedCases";
import { StationOfficers } from "@/components/supervisor/StationOfficers";
import { useStationData } from "@/hooks/supervisor/useStationData";
import { SupervisorDashboardHeader } from "@/components/supervisor/SupervisorDashboardHeader";
import { SupervisorStats } from "@/hooks/supervisor/types";

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stationData, loading, handleAssignCase } = useStationData(user);

  // If user is not logged in or not authorized, redirect
  useEffect(() => {
    if (!user || user.role !== "supervisor") {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user) return null;

  // Create default stats object if stationData.stats is not available
  const defaultStats: SupervisorStats = {
    totalCases: 0,
    pendingReports: 0,
    activeCases: 0,
    completedCases: 0,
    totalOfficers: 0
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="flex-grow flex">
        <SidebarProvider>
          <SupervisorSidebar />
          <SidebarInset className="p-6">
            <SupervisorDashboardHeader 
              user={user} 
              station={stationData?.station} 
            />
            
            {stationData && (
              <StatsOverview stats={stationData.stats || defaultStats} />
            )}
            
            {stationData && (
              <>
                <StationUnassignedCases 
                  station={stationData.station}
                  unassignedCases={stationData.unassignedCases}
                  officers={stationData.officers}
                  loading={loading}
                  onAssign={handleAssignCase}
                />
                
                <StationOfficers
                  station={stationData.station}
                  officers={stationData.officers}
                  loading={loading}
                />
              </>
            )}
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorDashboard;
