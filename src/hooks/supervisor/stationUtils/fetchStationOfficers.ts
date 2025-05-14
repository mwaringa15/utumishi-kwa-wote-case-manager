
import { SupabaseClient } from '@supabase/supabase-js';
import { StationOfficer, ToastType } from '@/components/supervisor/types';

interface FetchStationOfficersArgs {
  supabase: SupabaseClient<any, "public", any>;
  stationId: string;
  stationName: string;
  toast: ToastType;
}

export async function fetchStationOfficers({ supabase, stationId, stationName, toast }: FetchStationOfficersArgs): Promise<StationOfficer[]> {
  const { data: officersData, error: officersError } = await supabase
    .from('users')
    .select('id, full_name, email, role, status')
    .eq('station_id', stationId)
    .eq('role', 'Officer'); 

  if (officersError) {
    toast({
      title: "Error fetching officers",
      description: officersError.message || "Could not load officers for your station.",
      variant: "destructive",
    });
    return [];
  }

  const officersWithCaseCountsPromises = (officersData || []).map(async (officer) => {
    if (!officer || !officer.id) {
      console.warn("Invalid officer data encountered:", officer);
      return { ...officer, id: '', full_name: 'Invalid Officer', email: '', role: 'Officer', status: 'unknown', assignedCases: 0 };
    }
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
  const resolvedOfficersWithCounts = await Promise.all(officersWithCaseCountsPromises);

  const formattedOfficers: StationOfficer[] = resolvedOfficersWithCounts.filter(o => o && o.id).map(o => ({
    id: o.id,
    name: o.full_name || 'N/A',
    email: o.email || 'N/A',
    role: o.role || 'Officer', 
    station: stationName, 
    status: o.status || 'unknown',
    assignedCases: o.assignedCases,
  }));
  
  return formattedOfficers;
}
