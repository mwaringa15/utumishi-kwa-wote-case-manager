
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";
import { CasesTab } from "@/components/supervisor/CasesTab";
import { useSupervisorData } from "@/hooks/supervisor/useSupervisorData";

const SupervisorCasesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    filteredCases,
    officers,
    isLoading,
    handleAssignCase,
    handleSubmitToJudiciary
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
              <h1 className="text-2xl font-bold mt-4">Case Management</h1>
              <p className="text-gray-500">Manage and assign cases to officers</p>
            </div>
            
            <CasesTab 
              filteredCases={filteredCases}
              officers={officers}
              isLoading={isLoading}
              handleAssignCase={handleAssignCase}
              handleSubmitToJudiciary={handleSubmitToJudiciary}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorCasesPage;
