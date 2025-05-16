
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

    // Modified query to avoid the relationship error by directly selecting all fields
    // instead of using the nested relationship selection that was causing issues
    const { data: casesData, error: casesError } = await supabase
      .from('cases')
      .select('*')
      .eq(fetchedStationId ? 'station' : 'id', fetchedStationId || '*');
      
    if (casesError) throw casesError;
    
    // Now fetch related data separately
    const caseIds = casesData.map(c => c.id);
    const reportIds = casesData.map(c => c.report_id).filter(Boolean);
    const officerIds = casesData.map(c => c.assigned_officer_id).filter(Boolean);
    
    // Get reports data
    const { data: reportsData, error: reportsDataError } = await supabase
      .from('reports')
      .select('*')
      .in('id', reportIds.length > 0 ? reportIds : ['00000000-0000-0000-0000-000000000000']);
    
    if (reportsDataError) throw reportsDataError;
    
    // Map reports by ID for easy lookup
    const reportsById: Record<string, any> = {};
    reportsData.forEach(report => {
      reportsById[report.id] = report;
    });
    
    // Get officers data
    const { data: officersDataById, error: officersDataError } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', officerIds.length > 0 ? officerIds : ['00000000-0000-0000-0000-000000000000']);
    
    if (officersDataError) throw officersDataError;
    
    // Map officers by ID for easy lookup
    const officerNamesById: Record<string, string> = {};
    officersDataById.forEach(officer => {
      officerNamesById[officer.id] = officer.full_name;
    });

    const formattedCases: Case[] = (casesData || []).map((c: any) => ({
      id: c.id,
      crimeReportId: c.report_id,
      assignedOfficerId: c.assigned_officer_id,
      assignedOfficerName: c.assigned_officer_id ? officerNamesById[c.assigned_officer_id] : "Unassigned",
      progress: c.status, 
      status: c.status as CaseStatus, 
      lastUpdated: c.updated_at,
      priority: c.priority,
      station: c.station,
      crimeReport: reportsById[c.report_id] ? {
        id: reportsById[c.report_id].id,
        title: reportsById[c.report_id].title,
        description: reportsById[c.report_id].description,
        status: reportsById[c.report_id].status as CrimeStatus,
        createdById: reportsById[c.report_id].reporter_id,
        createdAt: reportsById[c.report_id].created_at,
        location: reportsById[c.report_id].location,
        crimeType: reportsById[c.report_id].category,
      } : undefined,
    }));

    // First get pending reports for this station
    const reportQuery = supabase
      .from('reports')
      .select('*')
      .eq('status', 'Pending');
    
    if (fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
      reportQuery.eq('station_id', fetchedStationId);
    }

    const { data: reportsData2, error: reportsError } = await reportQuery;
    if (reportsError) throw reportsError;
    
    // Then get all report_ids that already have cases
    const { data: existingReportIds, error: reportIdError } = await supabase
      .from('cases')
      .select('report_id');
    
    if (reportIdError) throw reportIdError;
    
    // Extract the report_ids as an array
    const reportIdsWithCases = existingReportIds.map(item => item.report_id);
    
    // Filter out reports that already have cases
    const reportsWithoutCases = reportsData2.filter(report => 
      !reportIdsWithCases.includes(report.id)
    );
    
    const formattedReports: CrimeReport[] = reportsWithoutCases.map((r: any) => ({
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

    // Fetch Officers from the same station as the supervisor
    const { data: officersData, error: officersError } = await supabase
      .from('users')
      .select('id, full_name, email, role, status')
      .eq('role', 'officer');

    if (fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
      // This is executed after the above query, but we can use the promise chaining pattern
      // to improve this in the future
      const { data: filteredOfficers } = await supabase
        .from('users')
        .select('id, full_name, email, role, status')
        .eq('role', 'officer')
        .eq('station_id', fetchedStationId);
        
      if (filteredOfficers) {
        officersData.length = 0; // Clear the array
        // Push all filtered officers
        filteredOfficers.forEach(officer => officersData.push(officer));
      }
    }
    
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
