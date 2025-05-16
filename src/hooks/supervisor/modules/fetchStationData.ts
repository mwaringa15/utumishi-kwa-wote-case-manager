
import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "../types";

/**
 * Fetches the station ID and name for a supervisor
 */
export async function fetchStationData(
  userId: string | undefined,
  showToast: ToastType
): Promise<{ stationId: string | null, stationName: string }> {
  if (!userId) {
    return { stationId: null, stationName: "All Stations" };
  }

  try {
    console.log("Fetching station data for user:", userId);
    
    // First check localStorage for stored station ID (set during login)
    const storedStationId = localStorage.getItem('selected_station_id');
    
    let effectiveStationId = null;
    let stationName = "All Stations";
    
    if (storedStationId) {
      console.log("Using stored station ID:", storedStationId);
      effectiveStationId = storedStationId;
      
      // Get station name
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .select('name')
        .eq('id', storedStationId)
        .single();
        
      if (stationError) {
        console.error("Error fetching station name:", stationError);
      } else if (stationData) {
        console.log("Found station name:", stationData.name);
        stationName = stationData.name;
      }
    } else {
      // If no stored station ID, try to get it from user profile
      console.log("No stored station ID, fetching from user profile...");
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('station_id, role')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        showToast({
          title: "User Data Error",
          description: "Could not fetch your station assignment. Please log in again.",
          variant: "destructive",
        });
        return { stationId: null, stationName: "Unknown Station" };
      }
      
      const userRole = userData.role?.toLowerCase() || '';
      console.log("User role:", userRole);
      
      if (!userData.station_id && 
          userRole !== 'administrator' && 
          userRole !== 'commander' && 
          userRole !== 'ocs') {
        console.error("User has no station assigned and is not an admin role");
        showToast({
          title: "No Station Assigned",
          description: "You are not assigned to any station. Please contact an administrator.",
          variant: "destructive",
        });
        return { stationId: null, stationName: "Unknown Station" };
      }
      
      // Use the station ID from user profile if available
      if (userData.station_id) {
        console.log("Using station ID from user profile:", userData.station_id);
        effectiveStationId = userData.station_id;
        
        // Store it for future use
        localStorage.setItem('selected_station_id', userData.station_id);
        
        // Get station name
        const { data: stationData, error: stationError } = await supabase
          .from('stations')
          .select('name')
          .eq('id', userData.station_id)
          .single();
          
        if (stationError) {
          console.error("Error fetching station name:", stationError);
        } else if (stationData) {
          console.log("Found station name:", stationData.name);
          stationName = stationData.name;
        }
      } else {
        // For administrators, commanders, or OCS, set a placeholder
        console.log("User is an admin/commander/OCS, no station filter will be applied");
        stationName = "All Stations";
      }
    }

    return { stationId: effectiveStationId, stationName };
  } catch (error) {
    console.error("Error fetching station data:", error);
    return { stationId: null, stationName: "Unknown Station" };
  }
}
