
import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "@/components/supervisor/types";
import { v4 as uuidv4 } from 'uuid';

export const createCaseFromReport = async (
  reportId: string,
  officerId: string,
  officerName: string,
  stationId: string | null,
  toast: ToastType
): Promise<boolean> => {
  // Generate a unique ID for the case
  const caseId = uuidv4();
  
  try {
    // First, get the report details to retrieve the station
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .select('title, station_id')
      .eq('id', reportId)
      .single();
    
    if (reportError) {
      throw reportError;
    }
    
    // Use the station_id from the report if available, otherwise use the provided stationId
    const effectiveStationId = reportData.station_id || stationId;
    
    if (!effectiveStationId) {
      throw new Error("Station ID not found for this report or supervisor");
    }
    
    // Retrieve the station name from the stations table
    const { data: stationData, error: stationError } = await supabase
      .from('stations')
      .select('name')
      .eq('id', effectiveStationId)
      .single();
      
    if (stationError) {
      throw stationError;
    }
    
    // Insert the new case with status "Under Investigation"
    const { data, error } = await supabase
      .from('cases')
      .insert({
        id: caseId,
        report_id: reportId,
        assigned_officer_id: officerId,
        status: 'Under Investigation',
        station: stationData.name,
        priority: 'medium'
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    // Update the report status to reflect it's now under investigation
    const { error: updateError } = await supabase
      .from('reports')
      .update({ status: 'Under Investigation' })
      .eq('id', reportId);
      
    if (updateError) {
      throw updateError;
    }
    
    // Create a case history entry to record the assignment
    await supabase
      .from('case_history')
      .insert({
        case_id: caseId,
        updated_by: officerId,
        status_before: 'Submitted',
        status_after: 'Under Investigation',
        update_note: `Case created from report and assigned to officer ${officerName}`
      });
    
    toast({
      title: "Case Created",
      description: `Case successfully created and assigned to ${officerName}`,
    });
    
    return true;
  } catch (error: any) {
    console.error("Error creating case from report:", error);
    
    toast({
      title: "Error Creating Case",
      description: error.message || "An error occurred while creating the case",
      variant: "destructive",
    });
    
    return false;
  }
};
