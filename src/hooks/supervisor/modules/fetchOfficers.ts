
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Fetches officers for a station
 */
export async function fetchOfficers(stationId: string | null): Promise<User[]> {
  try {
    // Get officers for case assignment - only get officers from the same station
    let officersQuery = supabase
      .from('users')
      .select('id, full_name, email, role, status');
      
    // Only filter by station_id if we have one
    if (stationId) {
      officersQuery = officersQuery.eq('station_id', stationId);
    }
    
    // Always filter for officers only
    officersQuery = officersQuery.eq('role', 'Officer');
    
    const { data: officersData, error: officersError } = await officersQuery;

    if (officersError) {
      console.error("Error fetching officers:", officersError);
      throw officersError;
    }

    // Format officers data
    return officersData.map(officer => ({
      id: officer.id,
      name: officer.full_name || officer.email.split('@')[0],
      email: officer.email,
      role: "Officer",
      badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
      assignedCases: 0 // Placeholder
    }));
  } catch (error) {
    console.error("Error in fetchOfficers:", error);
    return [];
  }
}
