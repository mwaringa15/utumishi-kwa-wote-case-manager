
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches officers for a specific station with their case counts
 */
export async function fetchOfficersWithCounts(stationId: string | null): Promise<User[]> {
  try {
    // Fetch Officers from the same station as the supervisor
    let stationOfficersQuery = supabase
      .from('users')
      .select('id, full_name, email, role, status, station_id')
      .eq('role', 'officer');
    
    if (stationId) {
      stationOfficersQuery = stationOfficersQuery.eq('station_id', stationId);
    }

    const { data: officersData, error: officersError } = await stationOfficersQuery;
    
    if (officersError) throw officersError;

    // Get case counts for each officer
    return await Promise.all(
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
  } catch (error) {
    console.error("Error fetching officers with counts:", error);
    throw error;
  }
}
