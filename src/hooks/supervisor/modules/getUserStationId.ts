
import { supabase } from "@/integrations/supabase/client";

/**
 * Retrieves the station ID for a specific user
 */
export async function getUserStationId(userId?: string): Promise<string | null> {
  // First check localStorage for stored station ID (set during login)
  const storedStationId = localStorage.getItem('selected_station_id');
  
  if (storedStationId) {
    console.log("Using stored station ID:", storedStationId);
    return storedStationId;
  }
  
  if (!userId) {
    console.warn("No user ID provided to getUserStationId and no station in localStorage");
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('station_id')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Error fetching user's station ID:", error);
      return null;
    }
    
    if (data?.station_id) {
      // Store the station ID for future use
      localStorage.setItem('selected_station_id', data.station_id);
    }
    
    return data?.station_id || null;
  } catch (error) {
    console.error("Error in getUserStationId:", error);
    return null;
  }
}
