
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";
import { PendingReportsTab } from "@/components/supervisor/PendingReportsTab";
import { useSupervisorData } from "@/hooks/supervisor/useSupervisorData";

const SupervisorReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    pendingReports,
    officers,
    isLoading,
    handleCreateCase
  } = useSupervisorData(user);
  
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
              <h1 className="text-2xl font-bold mt-4">Pending Reports</h1>
              <p className="text-gray-500">Review and create cases from pending reports</p>
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
