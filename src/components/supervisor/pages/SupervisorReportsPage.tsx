
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
import { supabase } from "@/integrations/supabase/client";
import { CrimeReport, User, UserRole, CrimeStatus } from "@/types";
import { fetchStationDetails } from "@/hooks/supervisor/stationUtils/fetchStationDetails";
import { assignCaseToOfficer } from "@/hooks/supervisor/stationUtils/assignCaseToOfficer";

const SupervisorReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [stationId, setStationId] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string>("");
  
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch the supervisor's station details
        const stationDetails = await fetchStationDetails({ 
          supabase, 
          userId: user.id, 
          toast 
        });

        if (!stationDetails) {
          toast({
            title: "Station not found",
            description: "You are not assigned to any station",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        setStationId(stationDetails.stationId);
        setStationName(stationDetails.stationName);

        // Modified query to get pending reports for this station that don't have associated cases
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .eq('station_id', stationDetails.stationId)
          .eq('status', 'Pending')
          .not('id', 'in', supabase
            .from('cases')
            .select('report_id')
          );

        if (reportsError) throw reportsError;

        // Get officers for case assignment - only get officers from the same station
        const { data: officersData, error: officersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status')
          .eq('station_id', stationDetails.stationId)
          .eq('role', 'officer');  // Using lowercase role

        if (officersError) throw officersError;

        // Format officers data
        const formattedOfficers: User[] = officersData.map(officer => ({
          id: officer.id,
          name: officer.full_name || officer.email.split('@')[0],
          email: officer.email,
          role: "Officer" as UserRole,  // Type casting to UserRole
          badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
          assignedCases: 0 // Placeholder
        }));

        // Format reports
        const formattedReports: CrimeReport[] = reportsData.map(report => ({
          id: report.id,
          title: report.title,
          description: report.description,
          status: report.status as CrimeStatus,
          createdAt: report.created_at,
          crimeType: report.category,
          location: report.location,
          createdById: report.reporter_id || user.id,
          category: report.category
        }));

        setOfficers(formattedOfficers);
        setPendingReports(formattedReports);
      } catch (error) {
        console.error("Error fetching reports data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load reports data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Handle case creation
  const handleCreateCase = async (reportId: string, officerId: string, officerName: string) => {
    try {
      if (!stationId) {
        toast({
          title: "Station ID Missing",
          description: "Cannot create case without a valid station ID",
          variant: "destructive",
        });
        return;
      }

      // Create a new case in the database
      const { data, error } = await supabase
        .from('cases')
        .insert({
          report_id: reportId,
          assigned_officer_id: officerId,
          status: 'Under Investigation',
          station: stationId,
          priority: 'medium'
        })
        .select();

      if (error) throw error;

      // Update report status
      await supabase
        .from('reports')
        .update({ status: 'Under Investigation' })
        .eq('id', reportId);

      // Remove the report from the local state
      setPendingReports(prev => prev.filter(report => report.id !== reportId));

      // Show success toast
      toast({
        title: "Case created",
        description: `Case successfully created and assigned to Officer ${officerName}`,
      });
    } catch (error) {
      console.error("Error creating case:", error);
      toast({
        title: "Error creating case",
        description: "Failed to create the case from this report",
        variant: "destructive",
      });
    }
  };
  
  // If user is not logged in or not authorized, redirect
  if (!user || !["ocs", "commander", "administrator", "supervisor"].includes(user.role.toLowerCase())) {
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
              <h1 className="text-2xl font-bold mt-4">Reports for {stationName}</h1>
              <p className="text-gray-500">Review and create cases from pending reports at your station</p>
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
