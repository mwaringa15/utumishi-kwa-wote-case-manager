
import { supabase } from "@/integrations/supabase/client";

/**
 * Retrieves the station ID and name for a specific user
 */
export async function getUserStationId(userId?: string): Promise<{stationId: string | null, stationName: string | null}> {
  // First check localStorage for stored station ID (set during login)
  const storedStationId = localStorage.getItem('selected_station_id');
  const storedStationName = localStorage.getItem('selected_station_name');
  
  if (storedStationId && storedStationName) {
    console.log("Using stored station data:", storedStationId, storedStationName);
    return { stationId: storedStationId, stationName: storedStationName };
  }
  
  if (!userId) {
    console.warn("No user ID provided to getUserStationId and no station in localStorage");
    return { stationId: null, stationName: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('station_id')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Error fetching user's station ID:", error);
      return { stationId: null, stationName: null };
    }
    
    const stationId = data?.station_id || null;
    let stationName = null;
    
    if (stationId) {
      // Get station name
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .select('name')
        .eq('id', stationId)
        .single();
      
      if (!stationError && stationData) {
        stationName = stationData.name;
        
        // Store the station data for future use
        localStorage.setItem('selected_station_id', stationId);
        localStorage.setItem('selected_station_name', stationName);
      }
    }
    
    return { stationId, stationName };
  } catch (error) {
    console.error("Error in getUserStationId:", error);
    return { stationId: null, stationName: null };
  }
}
