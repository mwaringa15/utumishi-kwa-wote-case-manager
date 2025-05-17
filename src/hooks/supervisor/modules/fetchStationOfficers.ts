
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, OfficerStatus } from "@/types";

/**
 * Fetches officers for a specific station with case counts
 */
export async function fetchStationOfficers(stationId: string | null, stationName: string): Promise<User[]> {
  try {
    console.log("Fetching officers for station ID:", stationId, "Station Name:", stationName);
    
    if (!stationId) {
      console.error("No station ID provided for fetchStationOfficers");
      return [];
    }

    // Get officers from the same station
    const { data: officersData, error: officersError } = await supabase
      .from('users')
      .select('id, full_name, email, role, status, station_id')
      .eq('station_id', stationId)
      .eq('role', 'officer');
      
    if (officersError) {
      console.error("Error fetching officers:", officersError);
      return [];
    }

    console.log("Raw officers data:", officersData);

    if (!officersData || officersData.length === 0) {
      console.log("No officers found for station:", stationId);
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

    console.log("Formatted officers:", formattedOfficers);
    return formattedOfficers;
  } catch (error) {
    console.error("Error fetching station officers:", error);
    return [];
  }
}
