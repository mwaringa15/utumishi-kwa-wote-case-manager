
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types";

/**
 * Fetches officers for a station with their case counts
 */
export async function fetchOfficers(stationId: string | null): Promise<User[]> {
  try {
    console.log("Fetching officers for station ID:", stationId);
    
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
      throw officersError;
    }

    console.log("Raw officers data:", officersData);

    // Fetch the station name for each officer if available
    const stationIds = [...new Set(officersData.filter(officer => officer.station_id).map(officer => officer.station_id))];
    const stationNames: Record<string, string> = {};
    
    for (const stId of stationIds) {
      const { data, error } = await supabase
        .from('stations')
        .select('id, name')
        .eq('id', stId)
        .single();
        
      if (!error && data) {
        stationNames[stId] = data.name;
      }
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

    // Format officers data with their station names and case counts
    const formattedOfficers: User[] = officersData.map(officer => ({
      id: officer.id,
      name: officer.full_name || officer.email.split('@')[0],
      email: officer.email,
      role: "officer" as UserRole,
      station: officer.station_id ? stationNames[officer.station_id] || "Unknown Station" : "Unassigned",
      status: officer.status || 'on_duty',
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
