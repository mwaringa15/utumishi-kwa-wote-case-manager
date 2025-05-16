
import { useState, useEffect } from "react";
import { Case, User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchStationDetails } from "@/hooks/supervisor/stationUtils/fetchStationDetails";
import { assignCaseToOfficer } from "@/hooks/supervisor/stationUtils/assignCaseToOfficer";
import { SupervisorStats } from "@/hooks/supervisor/types";

export function useSupervisorCases(userId?: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [stats, setStats] = useState<SupervisorStats>({
    totalCases: 0,
    openCases: 0,
    assignedCases: 0,
    closedCases: 0
  });
  
  useEffect(() => {
    if (!userId) return;
    
    const fetchCasesData = async () => {
      setIsLoading(true);
      try {
        // Fetch the supervisor's station details
        const stationDetails = await fetchStationDetails({ 
          supabase, 
          userId, 
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

        // Get cases from this station
        let casesQuery = supabase
          .from('cases')
          .select('*');
        
        // Filter by station unless user is admin or commander
        if (stationDetails.userRole !== 'Administrator' && stationDetails.userRole !== 'Commander') {
          casesQuery = casesQuery.eq('station', stationDetails.stationId);
        }
        
        const { data: casesData, error: casesError } = await casesQuery;
        
        if (casesError) throw casesError;
        
        // Get related data for the cases
        const reportIds = casesData.map(c => c.report_id).filter(Boolean);
        const officerIds = casesData.map(c => c.assigned_officer_id).filter(Boolean);
        
        // Get reports data
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .in('id', reportIds);
        
        if (reportsError) throw reportsError;
        
        // Create a lookup for reports
        const reportsById: Record<string, any> = {};
        reportsData.forEach(report => {
          if (report.id) {
            reportsById[report.id] = report;
          }
        });
        
        // Get officers data
        const { data: officersDataById, error: officersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status, station_id')
          .in('id', officerIds);
        
        if (officersError) throw officersError;
        
        // Create a lookup for officers
        const officerNamesById: Record<string, string> = {};
        officersDataById.forEach(officer => {
          if (officer.id) {
            officerNamesById[officer.id] = officer.full_name;
          }
        });
        
        // Format the cases data
        const formattedCases = casesData.map((c: any) => ({
          id: c.id,
          crimeReportId: c.report_id,
          assignedOfficerId: c.assigned_officer_id,
          assignedOfficerName: c.assigned_officer_id ? officerNamesById[c.assigned_officer_id] || "Unknown" : "Unassigned",
          progress: c.status,
          status: c.status,
          lastUpdated: c.updated_at,
          priority: c.priority,
          station: c.station,
          crimeReport: reportsById[c.report_id] ? {
            id: reportsById[c.report_id].id,
            title: reportsById[c.report_id].title,
            description: reportsById[c.report_id].description,
            status: reportsById[c.report_id].status,
            createdById: reportsById[c.report_id].reporter_id,
            createdAt: reportsById[c.report_id].created_at,
            location: reportsById[c.report_id].location,
            crimeType: reportsById[c.report_id].category,
          } : undefined,
        }));
        
        // Get all officers for this station
        const { data: stationOfficersData, error: stationOfficersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status, station_id')
          .eq('station_id', stationDetails.stationId)
          .eq('role', 'Officer');
        
        if (stationOfficersError) throw stationOfficersError;
        
        // Count assigned cases for each officer
        const officersWithCaseCounts = await Promise.all(
          (stationOfficersData || []).map(async (officer: any) => {
            const { count, error: countError } = await supabase
              .from('cases')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_officer_id', officer.id)
              .not('status', 'in', '("Closed", "Rejected")');
              
            if (countError) console.error("Error fetching officer case count:", countError);
            
            return {
              id: officer.id,
              name: officer.full_name || officer.email.split('@')[0],
              email: officer.email,
              role: officer.role,
              status: officer.status,
              assignedCases: count || 0,
            };
          })
        );
        
        // Calculate stats for the dashboard
        const statsData = {
          totalCases: formattedCases.length,
          openCases: formattedCases.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
          assignedCases: formattedCases.filter(c => c.assignedOfficerId).length,
          closedCases: formattedCases.filter(c => c.status === 'Closed').length
        };
        
        setCases(formattedCases);
        setOfficers(officersWithCaseCounts);
        setStats(statsData);
      } catch (error: any) {
        console.error("Error fetching cases data:", error);
        toast({
          title: "Error loading data",
          description: error.message || "Failed to load cases data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCasesData();
  }, [userId, toast]);
  
  // Handle assigning case to officer
  const handleAssignCase = async (caseId: string, officerId: string) => {
    const success = await assignCaseToOfficer({ caseId, officerId, supabase, toast });
    
    // Update local state if assignment was successful
    if (success) {
      setCases(prevCases => prevCases.map(c => 
        c.id === caseId 
          ? { 
            ...c, 
            assignedOfficerId: officerId,
            assignedOfficerName: officers.find(o => o.id === officerId)?.name || "Unknown"
          }
          : c
      ));
    }
    
    return success;
  };
  
  // Handle submitting case to judiciary
  const handleSubmitToJudiciary = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'Under Review' })
        .eq('id', caseId);
      
      if (error) throw error;
      
      // Update local state
      setCases(prevCases => prevCases.map(c => 
        c.id === caseId ? { ...c, status: 'Under Review', progress: 'Under Review' } : c
      ));
      
      toast({
        title: "Case Submitted",
        description: "Case has been sent to the judiciary for review",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error submitting case to judiciary:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit case to judiciary",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    isLoading,
    cases,
    officers,
    stats,
    handleAssignCase,
    handleSubmitToJudiciary
  };
}
