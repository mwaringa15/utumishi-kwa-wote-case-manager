
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";
import { PendingReportsTab } from "@/components/supervisor/PendingReportsTab";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CrimeReport, User } from "@/types";

const SupervisorReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchReportsData = async () => {
      setIsLoading(true);
      try {
        // 1. Get the user's station_id from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('station_id')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        
        const stationId = userData?.station_id;
        if (!stationId) {
          toast({
            title: "Station not found",
            description: "You are not assigned to any station",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // 2. Get pending reports for this station
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .eq('station_id', stationId)
          .eq('status', 'Pending');

        if (reportsError) throw reportsError;

        // 3. Get officers for case assignment
        const { data: officersData, error: officersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status')
          .eq('station_id', stationId)
          .eq('role', 'Officer');

        if (officersError) throw officersError;

        // Format officers data
        const formattedOfficers = officersData.map(officer => ({
          id: officer.id,
          name: officer.full_name || officer.email.split('@')[0],
          email: officer.email,
          role: officer.role,
          badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
          assignedCases: 0 // Placeholder
        }));

        // Format reports
        const formattedReports = reportsData.map(report => ({
          id: report.id,
          title: report.title,
          description: report.description,
          status: report.status,
          createdAt: report.created_at,
          crimeType: report.category,
          location: report.location
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

    fetchReportsData();
  }, [user, toast]);

  // Handle case creation
  const handleCreateCase = async (reportId: string, officerId: string, officerName: string) => {
    try {
      // Create a new case in the database
      const { data: userData } = await supabase
        .from('users')
        .select('station_id')
        .eq('id', user?.id)
        .single();

      const stationId = userData?.station_id;

      const { data, error } = await supabase
        .from('cases')
        .insert({
          report_id: reportId,
          assigned_officer_id: officerId,
          status: 'In Progress',
          station: stationId
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
