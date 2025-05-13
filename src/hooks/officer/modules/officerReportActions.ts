
import { Case, CrimeReport, User, OfficerStats } from "@/types";
import { UseToastReturn } from "@/hooks/use-toast";

interface AssignReportParams {
  reportId: string;
  user: User | null;
  pendingReports: CrimeReport[];
  setPendingReports: React.Dispatch<React.SetStateAction<CrimeReport[]>>;
  setAssignedCases: React.Dispatch<React.SetStateAction<Case[]>>;
  setStats: React.Dispatch<React.SetStateAction<OfficerStats>>;
  toast: UseToastReturn['toast'];
}

export const assignReportToOfficerAndNotify = ({
  reportId,
  user,
  pendingReports,
  setPendingReports,
  setAssignedCases,
  setStats,
  toast,
}: AssignReportParams): void => {
  const report = pendingReports.find(r => r.id === reportId);
  if (!report || !user) return;

  const newCase: Case = {
    id: "c" + Math.random().toString(36).substring(2, 10), // Ensure unique ID generation in real app
    crimeReportId: reportId,
    assignedOfficerId: user.id,
    progress: "Pending",
    status: "Submitted", // Initial status from a report
    lastUpdated: new Date().toISOString(),
    crimeReport: {
      ...report,
      status: "Under Investigation" // Report itself becomes "Under Investigation"
    }
  };

  setAssignedCases(prev => [...prev, newCase]);
  setPendingReports(prev => prev.filter(r => r.id !== reportId));

  setStats(prev => ({
    ...prev,
    activeCases: prev.activeCases + 1,
    pendingReports: prev.pendingReports - 1,
    totalAssigned: prev.totalAssigned + 1
  }));

  toast({
    title: "Case assigned",
    description: `You have been assigned to case: ${report.title}`,
  });
};

