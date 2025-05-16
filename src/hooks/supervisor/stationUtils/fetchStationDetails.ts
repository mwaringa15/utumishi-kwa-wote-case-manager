
import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "@/components/supervisor/types";

interface FetchStationDetailsParams {
  supabase: typeof supabase;
  userId: string;
  toast: ToastType;
}

interface StationDetails {
  stationId: string;
  stationName: string;
  userRole: string;
}

export async function fetchStationDetails({
  supabase,
  userId,
  toast
}: FetchStationDetailsParams): Promise<StationDetails | null> {
  try {
    // First try to get station_id from localStorage as it's the most reliable source
    const storedStationId = localStorage.getItem('selected_station_id');
    
    // If we have a stored station ID, use it directly
    if (storedStationId) {
      console.log("Using stored station ID from localStorage:", storedStationId);
      
      // Get station name from stations table
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .select('name')
        .eq('id', storedStationId)
        .single();
        
      if (stationError) {
        console.error("Error fetching station name:", stationError);
        // Even if there's an error getting the name, we can continue with the ID
      }
      
      // Get the user's role (this should be safe as it doesn't depend on recursive policies)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("Error fetching user role:", userError);
        // We can continue with a default role if needed
      }
      
      // Return the station details using the stored station ID
      return {
        stationId: storedStationId,
        stationName: stationData?.name || "Unknown Station",
        userRole: userData?.role || "supervisor"
      };
    }
    
    // If no stored station ID is found and user is admin/commander, return appropriate values
    // Get role without fetching station_id to avoid recursion
    const { data: roleData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (roleError) {
      console.error("Error fetching user role:", roleError);
      toast({
        title: "Error",
        description: "Could not fetch user data",
        variant: "destructive",
      });
      return null;
    }
    
    const userRole = roleData?.role;
    
    // For administrators and commanders, we can operate without a specific station
    if (userRole === "Administrator" || userRole === "Commander" || userRole === "OCS") {
      return {
        stationId: "",
        stationName: "All Stations",
        userRole
      };
    }
    
    // For all other users without a stored station ID, show a toast suggesting to select one
    toast({
      title: "No Station Selected",
      description: "Please log in again and select a station to view reports",
      variant: "destructive",
    });
    
    return null;
  } catch (error) {
    console.error("Error in fetchStationDetails:", error);
    toast({
      title: "Error",
      description: "Could not fetch user data",
      variant: "destructive",
    });
    return null;
  }
}
