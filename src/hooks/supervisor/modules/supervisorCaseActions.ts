
import { User, CrimeReport } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "../types";

export async function assignCase(
  caseId: string,
  officerId: string,
  officerName: string,
  user: User | null,
  showToast: ToastType
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cases')
      .update({ assigned_officer_id: officerId, status: 'Under Investigation', updated_at: new Date().toISOString() })
      .eq('id', caseId);
    if (error) throw error;
    showToast({ title: "Case Assigned", description: `Case ${caseId.substring(0,8)} assigned to ${officerName}.` });
    return true;
  } catch (error: any) {
    showToast({ title: "Assignment Failed", description: error.message, variant: "destructive" });
    return false;
  }
}

export async function createCase(
  reportId: string,
  officerId: string,
  officerName: string,
  user: User | null,
  pendingReports: CrimeReport[],
  showToast: ToastType
): Promise<boolean> {
  let userStationId: string | null = null;
  
  if (user?.id) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('station_id')
      .eq('id', user.id)
      .single();
      
    if (userError) {
      showToast({ title: "Error", description: "Could not fetch user station for case creation.", variant: "destructive" });
      return false;
    }
    userStationId = userData?.station_id;
  }

  if (!userStationId) {
    showToast({ title: "Error", description: "User station ID is missing for case creation.", variant: "destructive" });
    return false;
  }

  try {
    const report = pendingReports.find(r => r.id === reportId);
    if (!report) throw new Error("Report not found");

    const { data: newCase, error: caseInsertError } = await supabase
      .from('cases')
      .insert({
        report_id: reportId,
        assigned_officer_id: officerId,
        status: 'Under Investigation', 
        priority: 'medium', 
        station: userStationId, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (caseInsertError) throw caseInsertError;

    const { error: reportUpdateError } = await supabase
      .from('reports')
      .update({ status: 'Under Investigation' }) 
      .eq('id', reportId);
      
    if (reportUpdateError) throw reportUpdateError;
    
    showToast({ title: "Case Created", description: `Case created from report ${report.title.substring(0,20)}... and assigned to ${officerName}.` });
    return true;
  } catch (error: any) {
    showToast({ title: "Case Creation Failed", description: error.message, variant: "destructive" });
    return false;
  }
}

export async function submitToJudiciary(
  caseId: string,
  showToast: ToastType
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cases')
      .update({ status: 'Submitted to Judiciary', updated_at: new Date().toISOString() })
      .eq('id', caseId);
      
    if (error) throw error;
    
    showToast({ title: "Case Submitted", description: `Case ${caseId.substring(0,8)} submitted to Judiciary.` });
    return true;
  } catch (error: any) {
    showToast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    return false;
  }
}
