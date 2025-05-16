
import { supabase } from "@/integrations/supabase/client";
import { CrimeReport, CrimeStatus } from "@/types";

/**
 * Fetches pending reports for a station
 */
export async function fetchReports(stationId: string | null): Promise<CrimeReport[]> {
  try {
    console.log("Fetching reports with stationId:", stationId);
    
    // Fetch pending reports
    let reportsQuery = supabase
      .from('reports')
      .select('*')
      .eq('status', 'Pending');
    
    // Only filter by station_id if we have one
    if (stationId) {
      console.log(`Applying station filter: ${stationId}`);
      reportsQuery = reportsQuery.eq('station_id', stationId);
    } else {
      console.log("Fetching all reports (admin/commander view)");
    }
    
    const { data: reportsData, error: reportsError } = await reportsQuery;

    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      throw reportsError;
    }

    console.log(`Found ${reportsData?.length || 0} pending reports`);

    // Then fetch all existing case report_ids
    const { data: casesData, error: casesError } = await supabase
      .from('cases')
      .select('report_id');
      
    if (casesError) throw casesError;

    // Extract the report_ids that already have cases
    const reportIdsWithCases = casesData.map(item => item.report_id);

    // Filter out reports that already have cases
    const reportsWithoutCases = reportsData.filter(report => 
      !reportIdsWithCases.includes(report.id)
    );

    console.log(`${reportsWithoutCases.length} reports don't have cases yet`);

    // Format reports
    return reportsWithoutCases.map(report => ({
      id: report.id,
      title: report.title,
      description: report.description,
      status: report.status as CrimeStatus,
      createdAt: report.created_at,
      crimeType: report.category,
      location: report.location,
      createdById: report.reporter_id,
      category: report.category
    }));
  } catch (error) {
    console.error("Error in fetchReports:", error);
    return [];
  }
}
