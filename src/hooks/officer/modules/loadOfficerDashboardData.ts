
import { Case, CaseProgress, CaseStatus, CrimeReport, User, OfficerStats } from "@/types";
import { UseToastReturn } from "@/hooks/use-toast"; 
import { supabase } from "@/integrations/supabase/client";
import { getUserStationId } from "@/hooks/supervisor/modules/getUserStationId";

interface LoadDataParams {
  user: User | null;
  setAssignedCases: React.Dispatch<React.SetStateAction<Case[]>>;
  setPendingReports: React.Dispatch<React.SetStateAction<CrimeReport[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStats: React.Dispatch<React.SetStateAction<OfficerStats>>;
  toast: UseToastReturn['toast'];
}

export const loadOfficerDashboardData = async ({
  user,
  setAssignedCases,
  setPendingReports,
  setIsLoading,
  setStats,
  toast,
}: LoadDataParams): Promise<void> => {
  if (!user) {
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  try {
    // Get the officer's station ID from localStorage
    const stationId = localStorage.getItem('selected_station_id');
    console.log("Officer dashboard using station ID:", stationId);
    
    if (!stationId) {
      console.warn("No station ID found for officer. Data may be incomplete.");
    }

    // Fetch assigned cases for the officer
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
        reports (
          id,
          title,
          description,
          category,
          status,
          created_at,
          reporter_id,
          location
        )
      `)
      .eq('assigned_officer_id', user.id);
      
    if (casesError) {
      console.error("Error fetching assigned cases:", casesError);
      throw casesError;
    }

    // Format cases data
    const formattedCases: Case[] = casesData.map((caseItem: any) => ({
      id: caseItem.id,
      crimeReportId: caseItem.report_id,
      assignedOfficerId: user.id,
      progress: caseItem.status as CaseProgress,
      status: caseItem.status as CaseStatus,
      lastUpdated: caseItem.updated_at,
      priority: caseItem.priority || 'medium',
      crimeReport: caseItem.reports ? {
        id: caseItem.reports.id,
        title: caseItem.reports.title,
        description: caseItem.reports.description,
        status: caseItem.reports.status,
        createdById: caseItem.reports.reporter_id,
        createdAt: caseItem.reports.created_at,
        location: caseItem.reports.location,
        crimeType: caseItem.reports.category
      } : undefined
    }));

    // Fetch pending reports for the officer's station
    let reportsQuery = supabase
      .from('reports')
      .select('*')
      .eq('status', 'Pending');
    
    // Filter by station if available
    if (stationId) {
      reportsQuery = reportsQuery.eq('station_id', stationId);
    }
    
    const { data: pendingReportsData, error: reportsError } = await reportsQuery;
    
    if (reportsError) {
      console.error("Error fetching pending reports:", reportsError);
      throw reportsError;
    }
    
    // Check which reports already have cases
    const { data: existingReportIds, error: reportIdError } = await supabase
      .from('cases')
      .select('report_id');
    
    if (reportIdError) {
      console.error("Error fetching existing report IDs:", reportIdError);
      throw reportIdError;
    }
    
    // Extract the report_ids as an array
    const reportIdsWithCases = existingReportIds.map(item => item.report_id);
    
    // Filter out reports that already have cases
    const reportsWithoutCases = pendingReportsData.filter(report => 
      !reportIdsWithCases.includes(report.id)
    );
    
    // Format reports data
    const formattedReports: CrimeReport[] = reportsWithoutCases.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      createdById: r.reporter_id,
      createdAt: r.created_at,
      location: r.location,
      category: r.category,
      crimeType: r.category,
    }));

    // Set the data in state
    setAssignedCases(formattedCases);
    setPendingReports(formattedReports);

    // Set statistics based on the fetched data
    setStats({
      activeCases: formattedCases.filter(c => c.status !== 'Closed' && c.status !== 'Rejected').length,
      pendingReports: formattedReports.length,
      closedCases: formattedCases.filter(c => c.status === 'Closed' || c.status === 'Rejected').length,
      totalAssigned: formattedCases.length,
    });

  } catch (error) {
    console.error("Failed to load officer dashboard data", error);
    toast({
      title: "Error loading data",
      description: "Failed to load case information. Please check your station assignment.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
