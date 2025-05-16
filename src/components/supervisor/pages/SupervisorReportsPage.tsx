
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";
import { PendingReportsTab } from "@/components/supervisor/PendingReportsTab";
import { useToast } from "@/hooks/use-toast";
import { useSupervisorReports } from "@/hooks/supervisor/useSupervisorReports";
import { createCaseFromReport } from "@/hooks/supervisor/stationUtils/createCaseFromReport";

const SupervisorReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    isLoading,
    pendingReports,
    officers,
    stationId,
    stationName,
    refreshData
  } = useSupervisorReports(user?.id);
  
  // Handle case creation
  const handleCreateCase = async (reportId: string, officerId: string, officerName: string) => {
    const success = await createCaseFromReport(reportId, officerId, officerName, stationId, toast);
    
    // If case was created successfully, refresh the reports list
    if (success) {
      refreshData();
    }
    
    return success;
  };
  
  // If user is not logged in or not authorized, redirect
  useEffect(() => {
    if (!user || !["ocs", "commander", "administrator", "supervisor"].includes(user.role.toLowerCase())) {
      navigate('/dashboard');
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
            <div className="mb-6">
              <BackButton />
              <h1 className="text-2xl font-bold mt-4">Reports for {stationName || "All Stations"}</h1>
              <p className="text-gray-500">
                {stationId 
                  ? `Review and create cases from pending reports at your station` 
                  : `Please select a station from your profile settings to view station-specific reports`
                }
              </p>
            </div>
            
            <PendingReportsTab 
              pendingReports={pendingReports}
              officers={officers}
              isLoading={isLoading}
              handleCreateCase={handleCreateCase}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorReportsPage;
