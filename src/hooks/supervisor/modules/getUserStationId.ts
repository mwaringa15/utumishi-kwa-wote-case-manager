
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the station ID for a given user
 */
export async function getUserStationId(userId: string | undefined | null): Promise<string | null> {
  if (!userId) {
    // If no userId is provided, check localStorage for a selected station
    const storedStationId = localStorage.getItem('selected_station_id');
    console.log("No user ID provided, using stored station ID:", storedStationId);
    return storedStationId;
  }

  try {
    // First try to get the station_id from the user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('station_id')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user's station_id:", userError);
      
      // If there's an error, try to use the stored station ID from localStorage
      const storedStationId = localStorage.getItem('selected_station_id');
      console.log("Using stored station ID due to error:", storedStationId);
      return storedStationId;
    }
    
    if (!userData?.station_id) {
      // If no station_id in profile, use the stored station ID from localStorage
      const storedStationId = localStorage.getItem('selected_station_id');
      console.log("No station_id in profile, using stored:", storedStationId);
      return storedStationId;
    }
    
    // Store the fetched station ID in localStorage for future reference
    localStorage.setItem('selected_station_id', userData.station_id);
    console.log("Found station_id in profile, storing and using:", userData.station_id);
    
    return userData?.station_id || null;
  } catch (error) {
    console.error("Error getting user station ID:", error);
    
    // In case of any error, fall back to localStorage
    const storedStationId = localStorage.getItem('selected_station_id');
    console.log("Error occurred, falling back to stored station ID:", storedStationId);
    return storedStationId;
  }
}
