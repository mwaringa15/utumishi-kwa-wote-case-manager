
import { useState, useEffect, useCallback } from "react";
import { User, Case, CrimeReport, UserRole, CaseStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { SupervisorStats } from "./types";
import { fetchSupervisorData } from "./modules/fetchSupervisorData";
import { 
  sortData, 
  filterCases, 
  filterReports, 
  filterOfficers, 
  calculateStats 
} from "./modules/dataProcessingUtils";
import { 
  assignCase, 
  createCase, 
  submitToJudiciary 
} from "./modules/supervisorCaseActions";

export function useSupervisorData(user: User | null) {
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SupervisorStats>({
    totalCases: 0,
    pendingReports: 0,
    activeCases: 0,
    completedCases: 0,
    totalOfficers: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Case | keyof CrimeReport | keyof User>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const data = await fetchSupervisorData(user, toast);
    
    if (data) {
      setCases(data.cases);
      setPendingReports(data.pendingReports);
      setOfficers(data.officers);
      setStats(calculateStats(data.cases, data.pendingReports, data.officers));
    }
    
    setIsLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignCase = async (caseId: string, officerId: string, officerName: string): Promise<boolean> => {
    setIsLoading(true);
    const success = await assignCase(caseId, officerId, officerName, user, toast);
    
    if (success) {
      // Update local state
      const updatedCases = cases.map(c => 
        c.id === caseId 
          ? { ...c, assignedOfficerId: officerId, assignedOfficerName: officerName, status: 'Under Investigation' as CaseStatus } 
          : c
      );
      setCases(updatedCases);
      setStats(calculateStats(updatedCases, pendingReports, officers));
    }
    
    setIsLoading(false);
    return success;
  };

  const handleCreateCase = async (reportId: string, officerId: string, officerName: string): Promise<boolean> => {
    setIsLoading(true);
    const success = await createCase(reportId, officerId, officerName, user, pendingReports, toast);
    
    if (success) {
      await fetchData(); // Refresh all data
    }
    
    setIsLoading(false);
    return success;
  };

  const handleSubmitToJudiciary = async (caseId: string): Promise<boolean> => {
    setIsLoading(true);
    const success = await submitToJudiciary(caseId, toast);
    
    if (success) {
      const updatedCases = cases.map(c => 
        c.id === caseId 
          ? { ...c, status: 'Submitted to Judiciary' as CaseStatus } 
          : c
      );
      setCases(updatedCases);
      setStats(calculateStats(updatedCases, pendingReports, officers));
    }
    
    setIsLoading(false);
    return success;
  };

  const toggleSort = (field: keyof Case | keyof CrimeReport | keyof User) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field as keyof Case & keyof CrimeReport & keyof User);
      setSortDirection("asc");
    }
  };

  // Apply sorting and filtering to the data
  const filteredCases = sortData(
    filterCases(cases, searchTerm),
    sortField as keyof Case,
    sortDirection
  );
  
  const validReportSortField = sortField as keyof CrimeReport;
  const filteredPendingReports = sortData(
    filterReports(pendingReports, searchTerm),
    validReportSortField,
    sortDirection
  );
  
  const validOfficerSortField = sortField as keyof User;  
  const filteredOfficers = sortData(
    filterOfficers(officers, searchTerm),
    validOfficerSortField,
    sortDirection
  );

  return {
    cases: filteredCases,
    pendingReports: filteredPendingReports,
    officers: filteredOfficers,
    isLoading,
    stats,
    searchTerm,
    setSearchTerm,
    sortField: sortField as keyof Case & keyof CrimeReport & keyof User,
    sortDirection,
    toggleSort,
    setSortDirection,
    handleAssignCase,
    handleCreateCase,
    handleSubmitToJudiciary,
    refreshData: fetchData,
  };
}
