
import { supabase } from "@/integrations/supabase/client";

/**
 * Retrieves the station ID for a specific user
 */
export async function getUserStationId(userId?: string): Promise<string | null> {
  if (!userId) {
    console.warn("No user ID provided to getUserStationId");
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
    
    return data.station_id;
  } catch (error) {
    console.error("Error in getUserStationId:", error);
    return null;
  }
}
