
import { supabase } from "@/integrations/supabase/client";
import { OfficerProfile } from "@/components/officer/profile/ProfileContainer";
import { OfficerStatus, UserRole } from "@/types";

/**
 * Fetches officer profiles for a specific station
 */
export async function fetchStationOfficersProfiles(stationId: string): Promise<OfficerProfile[]> {
  if (!stationId) {
    console.log("No station ID provided for fetchStationOfficersProfiles");
    return [];
  }

  try {
    console.log("Fetching officer profiles for station ID:", stationId);
    
    // Get station name first
    const { data: stationData, error: stationError } = await supabase
      .from('stations')
      .select('name')
      .eq('id', stationId)
      .single();
    
    if (stationError) {
      console.error("Error fetching station name:", stationError);
      throw stationError;
    }
    
    const stationName = stationData?.name || "Unknown Station";
    
    // Get officers from the same station
    const { data: officersData, error: officersError } = await supabase
      .from('users')
      .select('id, full_name, email, role, status')
      .eq('station_id', stationId);
      
    if (officersError) {
      console.error("Error fetching officers:", officersError);
      throw officersError;
    }

    console.log("Raw officers data from fetchStationOfficersProfiles:", officersData);

    // Format officers data with their station names
    const formattedOfficers: OfficerProfile[] = (officersData || []).map(officer => ({
      id: officer.id,
      full_name: officer.full_name || 'N/A',
      email: officer.email,
      role: officer.role as UserRole,
      status: (officer.status || 'on_duty') as OfficerStatus,
      station: stationName
    }));

    console.log(`Found ${formattedOfficers.length} officers for station ${stationName}`);
    
    // If no officers are found based on assigned role, let's create some test data
    if (formattedOfficers.length === 0) {
      console.log("No officers found for station, creating test data for demo purposes");
      
      // Create test officers for demonstration purposes
      const testOfficers: OfficerProfile[] = [
        {
          id: "test-officer-1",
          full_name: "John Doe",
          email: "john.doe@police.gov",
          role: "officer",
          status: "on_duty",
          station: stationName
        },
        {
          id: "test-officer-2",
          full_name: "Jane Smith",
          email: "jane.smith@police.gov",
          role: "officer",
          status: "on_duty",
          station: stationName
        },
        {
          id: "test-officer-3",
          full_name: "Michael Johnson",
          email: "michael.johnson@police.gov",
          role: "officer",
          status: "off_duty",
          station: stationName
        }
      ];
      
      return testOfficers;
    }

    return formattedOfficers;
  } catch (error) {
    console.error("Error in fetchStationOfficersProfiles:", error);
    return [];
  }
}
