
import { Case, CrimeReport } from "@/types";
import { ToastType } from "../types";

export interface CaseActionsConfig {
  allCases: Case[];
  setAllCases: (cases: Case[]) => void;
  pendingReports: CrimeReport[];
  setPendingReports: (reports: CrimeReport[]) => void;
  setStats: (updater: (prev: any) => any) => void;
  showToast: ToastType;
}

/**
 * Create handlers for case actions (assign, create, submit)
 */
export const createCaseActionHandlers = ({
  allCases,
  setAllCases,
  pendingReports,
  setPendingReports,
  setStats,
  showToast
}: CaseActionsConfig) => {
  
  // Handle case assignment
  const handleAssignCase = (caseId: string, officerId: string, officerName: string) => {
    setAllCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId) {
        return {
          ...caseItem,
          assignedOfficerId: officerId,
          assignedOfficerName: officerName,
          lastUpdated: new Date().toISOString(),
        };
      }
      return caseItem;
    }));
    
    showToast({
      title: "Case assigned",
      description: `Case ${caseId} has been assigned to ${officerName}`,
    });
  };
  
  // Handle assigning a report to create a case
  const handleCreateCase = (reportId: string, officerId: string, officerName: string) => {
    // Find the report
    const report = pendingReports.find(r => r.id === reportId);
    if (!report) return;
    
    // Create a new case
    const newCase: Case = {
      id: "c" + Math.random().toString(36).substring(2, 10),
      crimeReportId: reportId,
      assignedOfficerId: officerId,
      assignedOfficerName: officerName,
      progress: "Pending",
      lastUpdated: new Date().toISOString(),
      crimeReport: {
        ...report,
        status: "Under Investigation"
      }
    };
    
    // Add to all cases
    setAllCases(prev => [...prev, newCase]);
    
    // Remove from pending reports
    setPendingReports(prev => prev.filter(r => r.id !== reportId));
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalCases: prev.totalCases + 1,
      activeCases: prev.activeCases + 1,
      pendingReports: prev.pendingReports - 1
    }));
    
    showToast({
      title: "Case created",
      description: `New case created and assigned to ${officerName}`,
    });
  };
  
  // Handle escalating a case to judiciary
  const handleSubmitToJudiciary = (caseId: string) => {
    setAllCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId && caseItem.crimeReport) {
        return {
          ...caseItem,
          submittedToJudiciary: true,
          judiciaryStatus: "Pending Review",
          lastUpdated: new Date().toISOString(),
          crimeReport: {
            ...caseItem.crimeReport,
            status: "Submitted to Judiciary"
          }
        };
      }
      return caseItem;
    }));
    
    showToast({
      title: "Case submitted to judiciary",
      description: `Case ${caseId} has been submitted for judiciary review`,
    });
  };

  return {
    handleAssignCase,
    handleCreateCase,
    handleSubmitToJudiciary
  };
};
