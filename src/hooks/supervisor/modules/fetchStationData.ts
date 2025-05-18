
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
    return { stationId: null, stationName: "No Station Selected" };
  }

  try {
    console.log("Fetching station data for user:", userId);
    
    // Check three potential sources for the station ID in order of preference:
    // 1. localStorage (most immediate, set during login)
    // 2. User profile in database (most authoritative)
    // 3. Fall back to admin view if user role permits
    
    // First check localStorage for stored station ID (set during login)
    const storedStationId = localStorage.getItem('selected_station_id');
    const storedStationName = localStorage.getItem('selected_station_name') || "Unknown Station";
    
    let effectiveStationId = null;
    let stationName = storedStationName;
    
    if (storedStationId) {
      console.log("Using stored station ID:", storedStationId);
      effectiveStationId = storedStationId;
      
      // Verify station exists and get updated name
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .select('name')
        .eq('id', storedStationId)
        .single();
        
      if (!stationError && stationData) {
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
      console.log("User role:", userRole, "Station ID from database:", userData.station_id);
      
      // For supervisors, having a station is mandatory
      if (!userData.station_id && userRole === 'supervisor') {
        console.error("Supervisor has no station assigned");
        showToast({
          title: "No Station Assigned",
          description: "You need to select a station during login. Please log out and log in again.",
          variant: "destructive",
        });
        return { stationId: null, stationName: "No Station Selected" };
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
          localStorage.setItem('selected_station_name', stationName);
        }
      } else {
        // For administrators, commanders, or OCS, set a placeholder
        if (['administrator', 'commander', 'ocs'].includes(userRole)) {
          console.log("User is an admin/commander/OCS, no station filter will be applied");
          stationName = "All Stations";
        } else {
          console.log("User has no station assigned and is not an admin role");
          stationName = "No Station Selected";
        }
      }
    }

    return { stationId: effectiveStationId, stationName };
  } catch (error) {
    console.error("Error fetching station data:", error);
    return { stationId: null, stationName: "Error Getting Station" };
  }
}
