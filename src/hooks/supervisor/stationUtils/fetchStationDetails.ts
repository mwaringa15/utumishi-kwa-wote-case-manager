
import { SupabaseClient } from '@supabase/supabase-js';
import { ToastType } from '@/components/supervisor/types'; // Assuming ToastType is defined here or in a shared types file

interface FetchStationDetailsArgs {
  supabase: SupabaseClient<any, "public", any>;
  userId: string;
  toast: ToastType;
}

export interface StationDetailsResult {
  stationId: string;
  stationName: string;
}

export async function fetchStationDetails({ supabase, userId, toast }: FetchStationDetailsArgs): Promise<StationDetailsResult | null> {
  // 1. Get the user's station_id
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('station_id')
    .eq('id', userId)
    .single();

  if (userError || !userData?.station_id) {
    toast({
      title: "Error fetching user data",
      description: userError?.message || "Could not determine your station. Please ensure you are assigned to one.",
      variant: "destructive",
    });
    return null;
  }
  
  const stationId = userData.station_id;

  // 2. Fetch station details
  const { data: stationDetailsData, error: stationError } = await supabase
    .from('stations')
    .select('id, name')
    .eq('id', stationId)
    .single();
  
  if (stationError || !stationDetailsData) {
    toast({
      title: "Error fetching station details",
      description: stationError?.message || "Could not load details for your assigned station.",
      variant: "destructive",
    });
    return null;
  }

  return { stationId, stationName: stationDetailsData.name };
}
