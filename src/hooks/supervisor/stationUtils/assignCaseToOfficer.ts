
import { SupabaseClient } from '@supabase/supabase-js';
import { ToastType } from '@/components/supervisor/types';

interface AssignCaseToOfficerArgs {
  supabase: SupabaseClient<any, "public", any>;
  caseId: string;
  officerId: string;
  toast: ToastType;
}

export async function assignCaseToOfficer({ supabase, caseId, officerId, toast }: AssignCaseToOfficerArgs): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cases')
      .update({ 
        assigned_officer_id: officerId,
        status: 'Under Investigation' 
      })
      .eq('id', caseId);

    if (error) throw error;
    
    toast({
      title: "Case Assigned",
      description: "The case has been successfully assigned.",
    });
    return true;
  } catch (error: any) {
    console.error("Error assigning case:", error);
    toast({
      title: "Assignment Failed",
      description: error.message || "Could not assign the case to the officer.",
      variant: "destructive",
    });
    return false;
  }
}
