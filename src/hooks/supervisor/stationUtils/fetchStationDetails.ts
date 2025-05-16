
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
    // Get the user's station_id and role from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('station_id, role')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error("Error fetching user's station_id:", userError);
      toast({
        title: "Error",
        description: "Could not fetch user data",
        variant: "destructive",
      });
      return null;
    }

    const stationId = userData?.station_id;
    const userRole = userData?.role;

    if (!stationId && userRole !== "Administrator" && userRole !== "Commander") {
      toast({
        title: "No Station ID",
        description: "Your station could not be determined. Please select a station from your profile settings.",
        variant: "destructive",
      });
      return null;
    }

    // If user is an administrator or commander without station_id, we don't need a station name
    if (!stationId && (userRole === "Administrator" || userRole === "Commander")) {
      return {
        stationId: "",
        stationName: "All Stations",
        userRole
      };
    }

    // Get the station name
    const { data: stationData, error: stationError } = await supabase
      .from('stations')
      .select('name')
      .eq('id', stationId)
      .single();

    if (stationError) {
      console.error("Error fetching station name:", stationError);
      toast({
        title: "Error",
        description: "Could not fetch station details",
        variant: "destructive",
      });
      return null;
    }

    return {
      stationId: stationId || "",
      stationName: stationData?.name || "Unknown Station",
      userRole
    };
  } catch (error) {
    console.error("Error in fetchStationDetails:", error);
    return null;
  }
}
