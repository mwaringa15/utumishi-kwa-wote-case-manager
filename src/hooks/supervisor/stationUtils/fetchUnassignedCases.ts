
import { SupabaseClient } from '@supabase/supabase-js';
import { StationCase, ToastType } from '@/components/supervisor/types';

interface FetchUnassignedCasesArgs {
  supabase: SupabaseClient<any, "public", any>;
  stationId: string;
  stationName: string;
  toast: ToastType;
}

export async function fetchUnassignedCases({ supabase, stationId, stationName, toast }: FetchUnassignedCasesArgs): Promise<StationCase[]> {
  const { data: casesData, error: casesError } = await supabase
    .from('cases')
    .select(`
      id, 
      priority, 
      created_at, 
      updated_at,
      report_id,
      status,
      station, 
      reports (
        id, 
        title, 
        description, 
        status, 
        created_at, 
        location, 
        category
      )
    `)
    .eq('station', stationId)
    .is('assigned_officer_id', null) 
    .order('created_at', { ascending: false });

  if (casesError) {
    toast({
      title: "Error fetching cases",
      description: casesError.message || "Could not load unassigned cases for your station.",
      variant: "destructive",
    });
    return [];
  }
  
  const formattedUnassignedCases: StationCase[] = (casesData || []).map((c: any) => ({
    id: c.id,
    report_id: c.report_id,
    status: c.status,
    priority: c.priority,
    created_at: c.created_at,
    updated_at: c.updated_at,
    station: stationName, 
    reports: c.reports ? {
        id: c.reports.id,
        title: c.reports.title,
        description: c.reports.description,
        status: c.reports.status,
        created_at: c.reports.created_at,
        location: c.reports.location,
        category: c.reports.category,
    } : { 
        id: '', title: 'N/A', description: '', status: '', created_at: '', location: '', category: ''
    },
  }));
  
  return formattedUnassignedCases;
}
