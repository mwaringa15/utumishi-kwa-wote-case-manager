
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, OfficerStatus } from "@/types";

/**
 * Fetches all officers across stations (for administrators)
 */
export async function fetchAllOfficers(): Promise<User[]> {
  try {
    // For administrators, fetch all officers
    const { data: officersData, error: officersError } = await supabase
      .from('users')
      .select('id, full_name, email, role, status, station_id')
      .eq('role', 'officer');

    if (officersError) {
      console.error("Error fetching all officers:", officersError);
      return [];
    }
    
    // Get station names for all officers
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

    // Format officers data with their respective station names
    const formattedOfficers: User[] = officersData.map(officer => ({
      id: officer.id,
      name: officer.full_name || officer.email.split('@')[0],
      email: officer.email,
      role: "officer" as UserRole,
      station: officer.station_id ? stationNames[officer.station_id] || "Unknown Station" : "Unassigned",
      status: (officer.status || 'on_duty') as OfficerStatus,
      badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
      assignedCases: officerCaseCounts[officer.id] || 0
    }));

    return formattedOfficers;
  } catch (error) {
    console.error("Error fetching all officers:", error);
    return [];
  }
}
