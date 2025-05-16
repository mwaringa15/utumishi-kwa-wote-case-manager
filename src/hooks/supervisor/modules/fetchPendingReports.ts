
import { CrimeReport, CrimeStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches pending reports that don't have cases yet
 */
export async function fetchPendingReports(stationId: string | null): Promise<CrimeReport[]> {
  try {
    console.log("Fetching pending reports with stationId:", stationId);
    
    // First get pending reports - RLS will automatically filter by station for supervisors
    let reportQuery = supabase
      .from('reports')
      .select('*')
      .eq('status', 'Pending');
    
    // For admin/commander roles, we still filter by station if provided
    if (stationId) {
      reportQuery = reportQuery.eq('station_id', stationId);
      console.log(`Explicitly filtering by station: ${stationId}`);
    } else {
      console.log("No station filter applied (for admin/commander roles)");
    }

    const { data: reportsData, error: reportsError } = await reportQuery;
    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      throw reportsError;
    }
    
    console.log(`Found ${reportsData?.length || 0} pending reports`);
    
    // Then get all report_ids that already have cases
    const { data: existingReportIds, error: reportIdError } = await supabase
      .from('cases')
      .select('report_id');
    
    if (reportIdError) {
      console.error("Error fetching case report IDs:", reportIdError);
      throw reportIdError;
    }
    
    // Extract the report_ids as an array
    const reportIdsWithCases = existingReportIds.map(item => item.report_id);
    
    // Filter out reports that already have cases
    const reportsWithoutCases = reportsData.filter(report => 
      !reportIdsWithCases.includes(report.id)
    );
    
    console.log(`${reportsWithoutCases.length} reports don't have cases yet`);
    
    return reportsWithoutCases.map((r: any) => ({
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
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    throw error;
  }
}
