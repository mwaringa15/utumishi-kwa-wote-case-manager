
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";
import { CasesTab } from "@/components/supervisor/CasesTab";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Case, User } from "@/types";

const SupervisorCasesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchCasesData = async () => {
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

        // 2. Get cases for this station
        const { data: casesData, error: casesError } = await supabase
          .from('cases')
          .select(`
            id,
            report_id,
            assigned_officer_id,
            status,
            priority,
            created_at,
            updated_at,
            station,
            reports:report_id (
              id,
              title,
              description,
              status,
              created_at,
              location,
              category
            )
          `)
          .eq('station', stationId);

        if (casesError) throw casesError;

        // 3. Get officers for this station
        const { data: officersData, error: officersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status')
          .eq('station_id', stationId)
          .eq('role', 'Officer');

        if (officersError) throw officersError;

        // 4. Get officer names for assigned cases
        const officerMap: Record<string, string> = {};
        officersData.forEach(officer => {
          officerMap[officer.id] = officer.full_name || officer.email.split('@')[0];
        });

        // Format cases data
        const formattedCases = casesData.map(caseItem => {
          // Progress based on status
          const progressMapping: Record<string, any> = {
            'Submitted': 'Pending',
            'Under Investigation': 'In Progress',
            'Closed': 'Completed',
            'Rejected': 'Completed',
            'Submitted to Judiciary': 'Pending Review',
            'Under Court Process': 'In Progress',
            'Returned from Judiciary': 'In Progress'
          };
          
          return {
            id: caseItem.id,
            crimeReportId: caseItem.report_id,
            assignedOfficerId: caseItem.assigned_officer_id,
            assignedOfficerName: caseItem.assigned_officer_id ? officerMap[caseItem.assigned_officer_id] : undefined,
            progress: progressMapping[caseItem.status] || 'Pending',
            lastUpdated: caseItem.updated_at || caseItem.created_at,
            priority: caseItem.priority,
            station: caseItem.station,
            crimeReport: caseItem.reports ? {
              id: caseItem.reports.id,
              title: caseItem.reports.title,
              description: caseItem.reports.description,
              status: caseItem.reports.status,
              createdAt: caseItem.reports.created_at,
              location: caseItem.reports.location,
              crimeType: caseItem.reports.category
            } : undefined
          };
        });

        // Format officers data
        const formattedOfficers = officersData.map(officer => ({
          id: officer.id,
          name: officer.full_name || officer.email.split('@')[0],
          email: officer.email,
          role: officer.role,
          badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
          assignedCases: casesData.filter(c => c.assigned_officer_id === officer.id).length
        }));

        setCases(formattedCases);
        setOfficers(formattedOfficers);
      } catch (error) {
        console.error("Error fetching cases data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load cases data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCasesData();
  }, [user, toast]);

  // Handle case assignment
  const handleAssignCase = async (caseId: string, officerId: string, officerName: string) => {
    try {
      // Update the case in the database
      const { error } = await supabase
        .from('cases')
        .update({ 
          assigned_officer_id: officerId,
          status: 'Under Investigation', 
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;

      // Update the local state
      setCases(prevCases => prevCases.map(c => {
        if (c.id === caseId) {
          return { 
            ...c, 
            assignedOfficerId: officerId,
            assignedOfficerName: officerName,
            progress: 'In Progress' 
          };
        }
        return c;
      }));

      // Show success toast
      toast({
        title: "Case assigned",
        description: `Case successfully assigned to Officer ${officerName}`,
      });
    } catch (error) {
      console.error("Error assigning case:", error);
      toast({
        title: "Error assigning case",
        description: "Failed to assign the case to the officer",
        variant: "destructive",
      });
    }
  };

  // Handle submitting case to judiciary
  const handleSubmitToJudiciary = async (caseId: string) => {
    try {
      // Update the case in the database
      const { error } = await supabase
        .from('cases')
        .update({ 
          status: 'Submitted to Judiciary', 
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;

      // Update the local state
      setCases(prevCases => prevCases.map(c => {
        if (c.id === caseId) {
          return { ...c, progress: 'Pending Review' };
        }
        return c;
      }));

      // Show success toast
      toast({
        title: "Case submitted",
        description: "Case successfully submitted to judiciary for review",
      });
    } catch (error) {
      console.error("Error submitting case to judiciary:", error);
      toast({
        title: "Error submitting case",
        description: "Failed to submit the case to judiciary",
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
              <h1 className="text-2xl font-bold mt-4">Case Management</h1>
              <p className="text-gray-500">Manage and assign cases to officers</p>
            </div>
            
            <CasesTab 
              filteredCases={cases}
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
