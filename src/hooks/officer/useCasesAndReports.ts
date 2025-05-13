
import { useState, useEffect } from "react";
import { Case, CaseProgress, CaseStatus, CrimeReport, User, OfficerStats } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { loadOfficerDashboardData } from "./modules/loadOfficerDashboardData";
import { updateCaseStatusAndNotify, updateCaseProgressAndNotify } from "./modules/officerCaseActions";
import { assignReportToOfficerAndNotify } from "./modules/officerReportActions";

export function useCasesAndReports(user: User | null) {
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<OfficerStats>({
    activeCases: 0,
    pendingReports: 0,
    closedCases: 0,
    totalAssigned: 0
  });
  const { toast } = useToast();
  
  useEffect(() => {
    loadOfficerDashboardData({
      user,
      setAssignedCases,
      setPendingReports,
      setIsLoading,
      setStats,
      toast
    });
  }, [user, toast]); // Dependencies for data loading
  
  const handleUpdateStatus = (caseId: string, newStatus: CaseStatus) => {
    updateCaseStatusAndNotify(caseId, newStatus, setAssignedCases, toast);
  };
  
  const handleUpdateProgress = (caseId: string, newProgress: CaseProgress) => {
    updateCaseProgressAndNotify(caseId, newProgress, setAssignedCases, toast);
  };
  
  const handleAssignReport = (reportId: string) => {
    assignReportToOfficerAndNotify({
      reportId,
      user,
      pendingReports,
      setPendingReports,
      setAssignedCases,
      setStats,
      toast
    });
  };
  
  const handleEvidenceUploaded = () => {
    toast({
      title: "Evidence uploaded",
      description: "The evidence has been attached to the case",
    });
  };

  return {
    assignedCases,
    pendingReports,
    isLoading,
    stats,
    handleUpdateStatus,
    handleUpdateProgress,
    handleAssignReport,
    handleEvidenceUploaded
  };
}

