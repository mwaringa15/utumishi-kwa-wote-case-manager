
import { useState, useEffect } from "react";
import { Case, CrimeReport, User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { generateMockOfficers, generateMockReports, generateMockCases, generateStats } from "./data/mockSupervisorData";
import { filterAndSortCases } from "./utils/dataFilters";
import { createCaseActionHandlers } from "./utils/caseActions";
import { SupervisorStats } from "./types";

export function useSupervisorData(user: User | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("lastUpdated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<SupervisorStats>({
    totalCases: 0,
    pendingReports: 0,
    activeCases: 0,
    completedCases: 0,
    totalOfficers: 0
  });
  
  // Load dashboard data
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!["OCS", "Commander", "Administrator", "Supervisor"].includes(user.role)) {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call to Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load mock data
        const mockOfficers = generateMockOfficers();
        const mockReports = generateMockReports();
        const mockCases = generateMockCases();
        
        setOfficers(mockOfficers);
        setPendingReports(mockReports);
        setAllCases(mockCases);
        setFilteredCases(mockCases);
        
        // Set statistics
        setStats(generateStats(mockCases, mockReports, mockOfficers));
        
      } catch (error) {
        console.error("Failed to load supervisor dashboard data", error);
        toast({
          title: "Error loading data",
          description: "Failed to load dashboard information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, navigate, toast]);
  
  // Filter and sort cases
  useEffect(() => {
    const filtered = filterAndSortCases(allCases, searchTerm, sortField, sortDirection);
    setFilteredCases(filtered);
  }, [allCases, searchTerm, sortField, sortDirection]);

  // Create case action handlers
  const { handleAssignCase, handleCreateCase, handleSubmitToJudiciary } = createCaseActionHandlers({
    allCases,
    setAllCases,
    pendingReports,
    setPendingReports,
    setStats,
    showToast: toast
  });
  
  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return {
    allCases,
    filteredCases,
    pendingReports,
    officers,
    isLoading,
    stats,
    searchTerm,
    sortField,
    sortDirection,
    setSearchTerm,
    setSortField,
    setSortDirection,
    toggleSort,
    handleAssignCase,
    handleCreateCase,
    handleSubmitToJudiciary
  };
}
