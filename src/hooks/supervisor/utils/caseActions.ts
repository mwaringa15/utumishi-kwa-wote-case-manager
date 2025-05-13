
import { Case, CrimeReport, User, CaseStatus, CrimeStatus, CaseProgress } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { SupervisorStats } from "../types"; // Adjust if SupervisorStats is defined elsewhere or needs update
import { v4 as uuidv4 } from 'uuid';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type ShowToast = (options: { title: string; description: string; variant?: "default" | "destructive" }) => void;

interface CaseActionHandlerProps {
  allCases: Case[];
  setAllCases: SetState<Case[]>;
  pendingReports: CrimeReport[];
  setPendingReports: SetState<CrimeReport[]>;
  officers: User[];
  setOfficers: SetState<User[]>;
  setStats: SetState<SupervisorStats>;
  showToast: ShowToast;
  currentUser: User | null; // Added currentUser
}

// Helper to recalculate stats
const recalculateStats = (
  cases: Case[],
  reports: CrimeReport[],
  officersList: User[],
  currentStats: SupervisorStats
): SupervisorStats => {
  const totalCases = cases.length;
  const pendingRepCount = reports.length;
  const activeCases = cases.filter(c => c.progress === 'In Progress' || c.progress === 'Pending' || c.progress === 'Pending Review').length;
  const completedCases = cases.filter(c => c.progress === 'Completed').length;
  const totalOfficers = officersList.length;

  return {
    ...currentStats, // Preserve any other stats if they exist
    totalCases,
    pendingReports: pendingRepCount,
    activeCases,
    completedCases,
    totalOfficers,
  };
};


export const createCaseActionHandlers = ({
  allCases,
  setAllCases,
  pendingReports,
  setPendingReports,
  officers, // officers list
  setOfficers, // to update officers list if needed (e.g. assignedCases count)
  setStats,
  showToast,
  currentUser,
}: CaseActionHandlerProps) => {
  const handleAssignCase = async (caseId: string, officerId: string, officerName?: string) => {
    if (!currentUser || !currentUser.id) {
      showToast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase
        .from("cases")
        .update({ 
          assigned_officer_id: officerId, 
          status: "Under Investigation" as CaseStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;

      const updatedCases = allCases.map(c => 
        c.id === caseId 
        ? { ...c, assignedOfficerId: officerId, assignedOfficerName: officerName || officers.find(o=>o.id === officerId)?.name || "Unknown Officer", progress: "In Progress" as CaseProgress, status: "Under Investigation" as CaseStatus } 
        : c
      );
      setAllCases(updatedCases);
      
      // Update officer's assignedCases count
      const updatedOfficers = officers.map(officer => {
        if (officer.id === officerId) {
          return { ...officer, assignedCases: (officer.assignedCases || 0) + 1 };
        }
        // If case was previously assigned to another officer, decrement their count (optional)
        // const oldAssignment = allCases.find(c => c.id === caseId);
        // if (oldAssignment?.assignedOfficerId && oldAssignment.assignedOfficerId === officer.id && oldAssignment.assignedOfficerId !== officerId) {
        //   return { ...officer, assignedCases: Math.max(0, (officer.assignedCases || 0) - 1) };
        // }
        return officer;
      });
      setOfficers(updatedOfficers);

      setStats(prevStats => recalculateStats(updatedCases, pendingReports, updatedOfficers, prevStats));
      showToast({ title: "Case Assigned", description: `Case assigned to Officer ${officerName || officerId}.` });
    } catch (error) {
      console.error("Error assigning case:", error);
      showToast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleCreateCase = async (reportId: string, officerId: string, priority: "high" | "medium" | "low" = "medium") => {
    if (!currentUser || !currentUser.id) {
      showToast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    const reportToConvert = pendingReports.find(r => r.id === reportId);
    if (!reportToConvert) {
      showToast({ title: "Error", description: "Report not found.", variant: "destructive" });
      return;
    }

    // Get station_id from the current user (supervisor)
    const { data: supervisorData, error: supervisorError } = await supabase
      .from('users')
      .select('station_id')
      .eq('id', currentUser.id)
      .single();

    if (supervisorError || !supervisorData?.station_id) {
      showToast({ title: "Error", description: "Could not determine supervisor's station.", variant: "destructive" });
      return;
    }
    const stationId = supervisorData.station_id;
    const officerName = officers.find(o => o.id === officerId)?.name || "Unknown Officer";

    try {
      const newCaseId = uuidv4();
      const { data: newCaseData, error: insertError } = await supabase
        .from("cases")
        .insert({
          id: newCaseId,
          report_id: reportId,
          assigned_officer_id: officerId,
          status: "Under Investigation" as CaseStatus, // Initial status
          priority: priority,
          station: stationId, // Use supervisor's station
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase
        .from("reports")
        .update({ status: "Under Investigation" as CrimeStatus })
        .eq("id", reportId);
      
      const newCase: Case = {
        id: newCaseData.id,
        crimeReportId: newCaseData.report_id,
        assignedOfficerId: newCaseData.assigned_officer_id,
        assignedOfficerName: officerName,
        progress: "In Progress" as CaseProgress,
        lastUpdated: newCaseData.updated_at || newCaseData.created_at,
        priority: newCaseData.priority as "high" | "medium" | "low",
        station: newCaseData.station,
        status: newCaseData.status as CaseStatus,
        crimeReport: { // Construct a basic CrimeReport object from the original report
            id: reportToConvert.id,
            title: reportToConvert.title,
            description: reportToConvert.description,
            status: "Under Investigation" as CrimeStatus,
            createdAt: reportToConvert.createdAt,
            crimeType: reportToConvert.crimeType,
            location: reportToConvert.location,
            category: reportToConvert.category,
            createdById: reportToConvert.createdById,
        }
      };

      const updatedCases = [...allCases, newCase];
      const updatedPendingReports = pendingReports.filter(r => r.id !== reportId);
      
      // Update officer's assignedCases count
      const updatedOfficers = officers.map(officer => 
        officer.id === officerId 
        ? { ...officer, assignedCases: (officer.assignedCases || 0) + 1 }
        : officer
      );
      setOfficers(updatedOfficers);
      
      setAllCases(updatedCases);
      setPendingReports(updatedPendingReports);
      setStats(prevStats => recalculateStats(updatedCases, updatedPendingReports, updatedOfficers, prevStats));
      showToast({ title: "Case Created", description: `Case created from report and assigned to Officer ${officerName}.` });
    } catch (error) {
      console.error("Error creating case:", error);
      showToast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleSubmitToJudiciary = async (caseId: string) => {
    if (!currentUser || !currentUser.id) {
      showToast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase
        .from("cases")
        .update({ 
            status: "Submitted to Judiciary" as CaseStatus,
            updated_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;
      
      const updatedCases = allCases.map(c => 
        c.id === caseId 
        ? { ...c, progress: "Pending Review" as CaseProgress, status: "Submitted to Judiciary" as CaseStatus } 
        : c
      );
      setAllCases(updatedCases);
      setStats(prevStats => recalculateStats(updatedCases, pendingReports, officers, prevStats)); // Officers list doesn't change here
      showToast({ title: "Case Submitted", description: "Case submitted to Judiciary." });
    } catch (error) {
      console.error("Error submitting to judiciary:", error);
      showToast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  return { handleAssignCase, handleCreateCase, handleSubmitToJudiciary };
};
