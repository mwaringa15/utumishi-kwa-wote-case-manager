
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Gets station data (ID and name) for a user
 */
export async function getUserStationData(userId?: string | null) {
  try {
    // First check localStorage for stored station ID
    const storedStationId = localStorage.getItem('selected_station_id');
    let effectiveStationId = storedStationId;
    let stationNameToSet = "";
    
    if (!effectiveStationId && userId) {
      // If no stored station ID, try to get it from user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('station_id, role')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        return { error: "Could not fetch your station assignment. Please log in again." };
      }
      
      if (!userData.station_id && userData.role.toLowerCase() !== 'administrator') {
        return { error: "You are not assigned to any station. Please contact an administrator." };
      }
      
      // Use the station ID from user profile if available
      effectiveStationId = userData.station_id;
    }
    
    if (effectiveStationId) {
      // Store it for future use
      localStorage.setItem('selected_station_id', effectiveStationId);
      
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
      }
      
      return {
        stationId: effectiveStationId,
        stationName: stationNameToSet
      };
    }
    
    // Handle admin case or missing station
    return {
      stationId: null,
      stationName: "All Stations"
    };
  } catch (error) {
    console.error("Error getting user station data:", error);
    return { error: "Failed to retrieve station data" };
  }
}
