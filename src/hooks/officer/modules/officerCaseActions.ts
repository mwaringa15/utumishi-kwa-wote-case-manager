
import { Case, CaseProgress, CaseStatus } from "@/types";
import { UseToastReturn } from "@/hooks/use-toast";

export const updateCaseStatusAndNotify = (
  caseId: string,
  newStatus: CaseStatus,
  setAssignedCases: React.Dispatch<React.SetStateAction<Case[]>>,
  toast: UseToastReturn['toast']
): void => {
  setAssignedCases(prev => prev.map(caseItem => {
    if (caseItem.id === caseId) {
      return {
        ...caseItem,
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        crimeReport: caseItem.crimeReport ? {
          ...caseItem.crimeReport,
          status: newStatus
        } : undefined
      };
    }
    return caseItem;
  }));

  toast({
    title: "Case status updated",
    description: `Case ${caseId} status changed to ${newStatus}`,
  });
};

export const updateCaseProgressAndNotify = (
  caseId: string,
  newProgress: CaseProgress,
  setAssignedCases: React.Dispatch<React.SetStateAction<Case[]>>,
  toast: UseToastReturn['toast']
): void => {
  setAssignedCases(prev => prev.map(caseItem => {
    if (caseItem.id === caseId) {
      let newStatus = caseItem.status;
      if (newProgress === "Completed") { // Simplified logic, ensure CaseStatus and CrimeStatus are compatible
        newStatus = "Closed" as CaseStatus;
      } else if (newProgress === "In Progress" && caseItem.status === "Submitted") {
        newStatus = "Under Investigation" as CaseStatus;
      }

      return {
        ...caseItem,
        progress: newProgress,
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        crimeReport: caseItem.crimeReport ? {
          ...caseItem.crimeReport,
          status: newProgress === "Completed" ? "Closed" as CaseStatus : caseItem.crimeReport.status
        } : undefined
      };
    }
    return caseItem;
  }));

  toast({
    title: "Case progress updated",
    description: `Case ${caseId} progress changed to ${newProgress}`,
  });
};

