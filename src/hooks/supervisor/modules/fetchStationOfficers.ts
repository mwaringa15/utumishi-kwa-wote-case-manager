
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, OfficerStatus } from "@/types";

/**
 * Fetches officers for a specific station with case counts
 */
export async function fetchStationOfficers(stationId: string | null, stationName: string): Promise<User[]> {
  try {
    // Get officers from the same station
    let officersQuery = supabase
      .from('users')
      .select('id, full_name, email, role, status, station_id');
      
    // Only filter by station_id if we have one
    if (stationId) {
      officersQuery = officersQuery.eq('station_id', stationId);
    }
    
    // Always filter for officers only
    officersQuery = officersQuery.eq('role', 'officer');
    
    const { data: officersData, error: officersError } = await officersQuery;

    if (officersError) {
      console.error("Error fetching officers:", officersError);
      return [];
    }

    // Count assigned cases for each officer
    const officerCaseCounts: Record<string, number> = {};
    
    for (const officer of officersData) {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_officer_id', officer.id)
        .not('status', 'eq', 'Completed');
        
      if (!error) {
        officerCaseCounts[officer.id] = count || 0;
      }
    }

    // Format officers data with their station names
    const formattedOfficers: User[] = officersData.map(officer => ({
      id: officer.id,
      name: officer.full_name || officer.email.split('@')[0],
      email: officer.email,
      role: "officer" as UserRole,
      station: stationName,
      status: (officer.status || 'on_duty') as OfficerStatus,
      badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
      assignedCases: officerCaseCounts[officer.id] || 0
    }));

    return formattedOfficers;
  } catch (error) {
    console.error("Error fetching station officers:", error);
    return [];
  }
}
