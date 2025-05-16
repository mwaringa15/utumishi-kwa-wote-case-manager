
import { ToastType } from "@/hooks/supervisor/types";
import { supabase } from "@/integrations/supabase/client";

export const createCaseFromReport = async (
  reportId: string, 
  officerId: string, 
  officerName: string, 
  stationId: string | null,
  toast: ToastType
): Promise<boolean> => {
  try {
    if (!stationId) {
      toast({
        title: "Station ID Missing",
        description: "Cannot create case without a valid station ID",
        variant: "destructive",
      });
      return false;
    }

    // Create a new case in the database
    const { data, error } = await supabase
      .from('cases')
      .insert({
        report_id: reportId,
        assigned_officer_id: officerId,
        status: 'Under Investigation',
        station: stationId,
        priority: 'medium'
      })
      .select();

    if (error) throw error;

    // Update report status
    const { error: updateError } = await supabase
      .from('reports')
      .update({ status: 'Under Investigation' })
      .eq('id', reportId);

    if (updateError) throw updateError;

    // Show success toast
    toast({
      title: "Case created",
      description: `Case successfully created and assigned to Officer ${officerName}`,
    });

    return true;
  } catch (error) {
    console.error("Error creating case:", error);
    toast({
      title: "Error creating case",
      description: "Failed to create the case from this report",
      variant: "destructive",
    });
    return false;
  }
};
