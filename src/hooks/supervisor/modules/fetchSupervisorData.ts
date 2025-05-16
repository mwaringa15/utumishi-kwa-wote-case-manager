
import { User, Case, CrimeReport, CaseStatus, CrimeStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "../types";

export async function fetchSupervisorData(
  user: User | null,
  showToast: ToastType
): Promise<{
  cases: Case[];
  pendingReports: CrimeReport[];
  officers: User[];
  stationId?: string;
} | null> {
  if (!user) {
    return null;
  }

  let fetchedStationId: string | null = null;

  try {
    if (user.id) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('station_id')
        .eq('id', user.id)
        .single();
      if (userError) {
        console.error("Error fetching user's station_id:", userError);
      }
      fetchedStationId = userData?.station_id || null;
    }

    if (!fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
      showToast({ title: "No Station ID", description: "Supervisor's station ID could not be determined.", variant: "destructive" });
      return null;
    }

    const caseQuery = supabase
      .from('cases')
      .select(`
        *,
        reports:report_id (*),
        users:assigned_officer_id (full_name)
      `);
    
    if (fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
      caseQuery.eq('station', fetchedStationId);
    }
      
    const { data: casesData, error: casesError } = await caseQuery;
    if (casesError) throw casesError;

    const formattedCases: Case[] = (casesData || []).map((c: any) => ({
      id: c.id,
      crimeReportId: c.report_id,
      assignedOfficerId: c.assigned_officer_id,
      assignedOfficerName: c.users?.full_name || "Unassigned",
      progress: c.status, 
      status: c.status as CaseStatus, 
      lastUpdated: c.updated_at,
      priority: c.priority,
      station: c.station,
      crimeReport: c.reports ? {
        id: c.reports.id,
        title: c.reports.title,
        description: c.reports.description,
        status: c.reports.status as CrimeStatus,
        createdById: c.reports.reporter_id,
        createdAt: c.reports.created_at,
        location: c.reports.location,
        crimeType: c.reports.category,
      } : undefined,
    }));

    // Modified report query to filter by station_id and to exclude reports that already have cases
    const reportQuery = supabase
      .from('reports')
      .select('*')
      .eq('status', 'Pending');
    
    if (fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
      reportQuery.eq('station_id', fetchedStationId);
    }

    // Get all report_ids that already have cases
    const { data: existingReportIds, error: reportIdError } = await supabase
      .from('cases')
      .select('report_id');
    
    if (reportIdError) throw reportIdError;
    
    // If there are existing cases, exclude their report_ids from the query
    if (existingReportIds && existingReportIds.length > 0) {
      const reportIdsWithCases = existingReportIds.map((item: any) => item.report_id);
      if (reportIdsWithCases.length > 0) {
        reportQuery.not('id', 'in', reportIdsWithCases);
      }
    }

    const { data: reportsData, error: reportsError } = await reportQuery;
    if (reportsError) throw reportsError;
    
    const formattedReports: CrimeReport[] = (reportsData || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status as CrimeStatus,
      createdById: r.reporter_id,
      createdAt: r.created_at,
      location: r.location,
      category: r.category,
      crimeType: r.category,
    }));

    // Fetch Officers
    const officerQuery = supabase
      .from('users')
      .select('id, full_name, email, role, status') 
      .eq('role', 'Officer');

    if (fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
      officerQuery.eq('station_id', fetchedStationId);
    }
    
    const { data: officersData, error: officersError } = await officerQuery;
    if (officersError) throw officersError;

    const officersWithCaseCounts = await Promise.all(
      (officersData || []).map(async (officer: any) => {
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

    return {
      cases: formattedCases,
      pendingReports: formattedReports,
      officers: officersWithCaseCounts,
      stationId: fetchedStationId || undefined,
    };

  } catch (error: any) {
    console.error("Failed to load supervisor data:", error);
    showToast({
      title: "Error Loading Data",
      description: error.message || "Could not load supervisor dashboard data.",
      variant: "destructive",
    });
    return null;
  }
}
