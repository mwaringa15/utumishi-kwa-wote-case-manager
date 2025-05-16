
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the station ID for a given user
 */
export async function getUserStationId(userId: string | undefined | null): Promise<string | null> {
  if (!userId) {
    return null;
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('station_id')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user's station_id:", userError);
      return null;
    }
    
    return userData?.station_id || null;
  } catch (error) {
    console.error("Error getting user station ID:", error);
    return null;
  }
}
