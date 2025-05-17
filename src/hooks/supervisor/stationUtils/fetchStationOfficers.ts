
import { SupabaseClient } from '@supabase/supabase-js';
import { StationOfficer, ToastType } from '@/components/supervisor/types';
import { User } from '@/types';

interface FetchStationOfficersArgs {
  supabase: SupabaseClient<any, "public", any>;
  stationId: string;
  stationName: string;
  toast: ToastType;
}

export async function fetchStationOfficers({ supabase, stationId, stationName, toast }: FetchStationOfficersArgs): Promise<StationOfficer[]> {
  if (!stationId) {
    console.log("No station ID provided for fetchStationOfficers");
    return [];
  }

  console.log("Fetching officers for station:", stationId, stationName);

  const { data: officersData, error: officersError } = await supabase
    .from('users')
    .select('id, full_name, email, role, status')
    .eq('station_id', stationId)
    .eq('role', 'officer'); 

  if (officersError) {
    console.error("Error fetching officers:", officersError);
    toast({
      title: "Error fetching officers",
      description: officersError.message || "Could not load officers for your station.",
      variant: "destructive",
    });
    return [];
  }

  console.log("Raw officer data:", officersData);

  if (!officersData || officersData.length === 0) {
    console.log("No officers found for station:", stationId);
    return [];
  }

  const officersWithCaseCountsPromises = officersData.map(async (officer) => {
    if (!officer || !officer.id) {
      console.warn("Invalid officer data encountered:", officer);
      return { ...officer, id: '', full_name: 'Invalid Officer', email: '', role: 'Officer', status: 'unknown', assignedCases: 0 };
    }
    
    // Get count of active cases for this officer
    const { count, error: countError } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_officer_id', officer.id)
      .not('status', 'in', '("Closed", "Rejected")'); 

    if (countError) {
      console.error(`Error fetching case count for officer ${officer.id}:`, countError);
    }
    
    return { 
      ...officer, 
      assignedCases: count || 0 
    };
  });
  
  try {
    const resolvedOfficersWithCounts = await Promise.all(officersWithCaseCountsPromises);
    
    console.log("Officers with counts:", resolvedOfficersWithCounts);

    const formattedOfficers: StationOfficer[] = resolvedOfficersWithCounts
      .filter(o => o && o.id)
      .map(o => ({
        id: o.id,
        name: o.full_name || 'N/A',
        email: o.email || 'N/A',
        role: o.role || 'Officer', 
        station: stationName, 
        status: o.status || 'unknown',
        assignedCases: o.assignedCases,
        badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
      }));

    console.log("Formatted officers:", formattedOfficers);
    return formattedOfficers;
  } catch (error) {
    console.error("Error processing officers:", error);
    return [];
  }
}
