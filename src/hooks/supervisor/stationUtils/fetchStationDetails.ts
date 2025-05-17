
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
      }
      
      // Get the user's role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("Error fetching user role:", userError);
      }
      
      // Return the station details using the stored station ID
      return {
        stationId: storedStationId,
        stationName: stationData?.name || "Unknown Station",
        userRole: userData?.role || "supervisor"
      };
    }
    
    // If no stored station ID is found, try to get it from user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, station_id')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user data:", userError);
      toast({
        title: "Error",
        description: "Could not fetch user data",
        variant: "destructive",
      });
      return null;
    }
    
    const userRole = userData?.role;
    const profileStationId = userData?.station_id;
    
    // If user has a station_id in their profile, use it and store it for future use
    if (profileStationId) {
      console.log("Retrieved station_id from user profile:", profileStationId);
      localStorage.setItem('selected_station_id', profileStationId);
      
      // Get station name
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .select('name')
        .eq('id', profileStationId)
        .single();
        
      if (stationError) {
        console.error("Error fetching station name:", stationError);
      }
      
      return {
        stationId: profileStationId,
        stationName: stationData?.name || "Unknown Station",
        userRole
      };
    }
    
    // For administrators and commanders, we can operate without a specific station
    if (userRole === "Administrator" || userRole === "Commander" || userRole === "OCS") {
      return {
        stationId: "",
        stationName: "All Stations",
        userRole
      };
    }
    
    // For supervisors without a stored station ID, show a toast suggesting to select one
    if (userRole === "Supervisor") {
      toast({
        title: "No Station Selected",
        description: "Please log in again and select a station to view reports",
        variant: "destructive",
      });
    }
    
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
