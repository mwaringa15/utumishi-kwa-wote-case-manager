
import { useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Show warning toast if supervisor has no station selected
  useEffect(() => {
    if (user && user.role.toLowerCase() === "supervisor" && !stationId && !isLoading) {
      toast({
        title: "No Station Selected",
        description: "You don't have a station assigned. Please contact an administrator or log in again.",
        variant: "destructive",
      });
    }
  }, [user, stationId, isLoading, toast]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="flex-grow flex">
        <SidebarProvider>
          <SupervisorSidebar />
          <SidebarInset className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <BackButton />
                <h1 className="text-2xl font-bold mt-4">Reports for {stationName || "All Stations"}</h1>
                <p className="text-gray-500">
                  {stationId 
                    ? `Review and create cases from pending reports at your station` 
                    : `Please select a station from the login page to view station-specific reports`
                  }
                </p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={refreshData} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {/* Show prominent warning if no station is selected for supervisor role */}
            {user.role.toLowerCase() === "supervisor" && !stationId && !isLoading && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Station Selected</AlertTitle>
                <AlertDescription>
                  Due to the new security policy, supervisors can only see reports from their assigned station.
                  Please log in again and select a station, or contact an administrator to assign you to a station.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Show loading state */}
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <PendingReportsTab 
                pendingReports={pendingReports}
                officers={officers}
                isLoading={isLoading}
                handleCreateCase={handleCreateCase}
              />
            )}
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorReportsPage;
