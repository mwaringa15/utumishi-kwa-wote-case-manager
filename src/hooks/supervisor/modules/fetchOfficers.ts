
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, OfficerStatus } from "@/types";

/**
 * Fetches officers for a station with their case counts
 */
export async function fetchOfficers(stationId: string | null): Promise<User[]> {
  try {
    console.log("Fetching officers for station ID:", stationId);
    
    // If no stationId is provided, return an empty array as we can't fetch officers without a station
    if (!stationId) {
      console.warn("No station ID provided to fetchOfficers, returning empty array");
      return [];
    }
    
    // Get officers from the specified station
    const { data: officersData, error: officersError } = await supabase
      .from('users')
      .select('id, full_name, email, role, status, station_id')
      .eq('station_id', stationId)
      .eq('role', 'officer');
      
    if (officersError) {
      console.error("Error fetching officers:", officersError);
      throw officersError;
    }

    console.log(`Found ${officersData?.length || 0} officers for station ID ${stationId}:`, officersData);

    // Fetch the station name for the officers' station
    let stationName = "Unknown Station";
    if (stationId) {
      const { data, error } = await supabase
        .from('stations')
        .select('name')
        .eq('id', stationId)
        .single();
        
      if (!error && data) {
        stationName = data.name;
      }
    }

    // Count assigned cases for each officer
    const officerCaseCounts: Record<string, number> = {};
    
    for (const officer of officersData || []) {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_officer_id', officer.id)
        .not('status', 'in', '("Closed", "Rejected")');
        
      if (!error) {
        officerCaseCounts[officer.id] = count || 0;
      }
    }

    // Format officers data with their station names and case counts
    const formattedOfficers: User[] = (officersData || []).map(officer => ({
      id: officer.id,
      name: officer.full_name || officer.email.split('@')[0],
      email: officer.email,
      role: "officer" as UserRole,
      station: stationName,
      status: (officer.status || 'on_duty') as OfficerStatus,
      badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
      assignedCases: officerCaseCounts[officer.id] || 0
    }));

    console.log("Formatted officers with counts:", formattedOfficers);
    return formattedOfficers;
  } catch (error) {
    console.error("Error in fetchOfficers:", error);
    return [];
  }
}
