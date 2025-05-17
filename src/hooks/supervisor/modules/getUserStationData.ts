
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets station data (ID and name) for a user
 */
export async function getUserStationData(userId?: string | null) {
  try {
    // First check localStorage for stored station ID
    const storedStationId = localStorage.getItem('selected_station_id');
    let effectiveStationId = storedStationId;
    let stationNameToSet = "";
    
    console.log("Initial station ID check:", { userId, storedStationId });
    
    if (!effectiveStationId && userId) {
      // If no stored station ID, try to get it from user profile
      console.log("No stored station ID found, fetching from user profile:", userId);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('station_id, role')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        return { error: "Could not fetch your station assignment. Please log in again." };
      }
      
      console.log("User data retrieved:", userData);
      
      if (!userData.station_id && userData.role.toLowerCase() !== 'administrator') {
        console.error("User has no station assignment:", userData);
        return { error: "You are not assigned to any station. Please contact an administrator." };
      }
      
      // Use the station ID from user profile if available
      effectiveStationId = userData.station_id;
      
      // Store it for future use if valid
      if (effectiveStationId) {
        localStorage.setItem('selected_station_id', effectiveStationId);
      }
    }
    
    console.log("Effective station ID:", effectiveStationId);
    
    if (effectiveStationId) {
      // Get station name
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .select('name')
        .eq('id', effectiveStationId)
        .single();
        
      if (stationError) {
        console.error("Error fetching station name:", stationError);
        stationNameToSet = "Unknown Station";
      } else {
        stationNameToSet = stationData.name;
        console.log("Station name found:", stationNameToSet);
      }
      
      return {
        stationId: effectiveStationId,
        stationName: stationNameToSet
      };
    }
    
    // Handle admin case or missing station
    console.log("No station ID available, setting to All Stations");
    return {
      stationId: null,
      stationName: "All Stations"
    };
  } catch (error) {
    console.error("Error getting user station data:", error);
    return { error: "Failed to retrieve station data" };
  }
}
