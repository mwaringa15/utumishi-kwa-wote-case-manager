
import { CrimeReport, CrimeStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches pending reports that don't have cases yet
 */
export async function fetchPendingReports(stationId: string | null): Promise<CrimeReport[]> {
  try {
    // First get pending reports for this station
    let reportQuery = supabase
      .from('reports')
      .select('*')
      .eq('status', 'Pending');
    
    if (stationId) {
      reportQuery = reportQuery.eq('station_id', stationId);
    }

    const { data: reportsData, error: reportsError } = await reportQuery;
    if (reportsError) throw reportsError;
    
    // Then get all report_ids that already have cases
    const { data: existingReportIds, error: reportIdError } = await supabase
      .from('cases')
      .select('report_id');
    
    if (reportIdError) throw reportIdError;
    
    // Extract the report_ids as an array
    const reportIdsWithCases = existingReportIds.map(item => item.report_id);
    
    // Filter out reports that already have cases
    const reportsWithoutCases = reportsData.filter(report => 
      !reportIdsWithCases.includes(report.id)
    );
    
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
