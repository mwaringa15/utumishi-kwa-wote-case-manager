
import { useState, useEffect } from "react";
import { Case, CrimeReport, User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
  const [stats, setStats] = useState({
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
    
    if (!["OCS", "Commander", "Administrator"].includes(user.role)) {
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
        
        // Mock officers data
        const mockOfficers: User[] = [
          {
            id: "officer1",
            name: "Officer John Doe",
            email: "john@police.go.ke",
            role: "Officer",
            createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
            badgeNumber: "KP12345",
            assignedCases: 3
          },
          {
            id: "officer2",
            name: "Officer Jane Smith",
            email: "jane@police.go.ke",
            role: "Officer",
            createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
            badgeNumber: "KP67890",
            assignedCases: 5
          },
          {
            id: "officer3",
            name: "Officer James Kimani",
            email: "james@police.go.ke",
            role: "Officer",
            createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
            badgeNumber: "KP24680",
            assignedCases: 2
          },
          {
            id: "officer4",
            name: "Officer Mary Wanjiku",
            email: "mary@police.go.ke",
            role: "Officer",
            createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
            badgeNumber: "KP13579",
            assignedCases: 4
          },
        ];
        
        // Mock pending reports
        const mockReports: CrimeReport[] = [
          {
            id: "r111",
            title: "Shoplifting at Central Mall",
            description: "Observed a person taking items without paying at the electronics section around 3 PM.",
            status: "Submitted",
            createdById: "user111",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Central Mall, Nairobi",
            crimeType: "Theft"
          },
          {
            id: "r112",
            title: "Suspicious Activity near School",
            description: "Noticed unusual activity around the school compound during late hours.",
            status: "Submitted",
            createdById: "user112",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: "St. Mary's School, Kiambu Road",
            crimeType: "Suspicious Activity"
          },
          {
            id: "r113",
            title: "Vehicle Break-in",
            description: "Car window broken and laptop stolen from inside.",
            status: "Submitted",
            createdById: "user113",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Westlands Parking Lot, Nairobi",
            crimeType: "Theft"
          },
        ];
        
        // Mock cases data
        const mockCases: Case[] = [
          {
            id: "c201",
            crimeReportId: "r201",
            assignedOfficerId: "officer1",
            assignedOfficerName: "Officer John Doe",
            progress: "In Progress",
            lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r201",
              title: "Vehicle Theft at Shopping Mall",
              description: "Car stolen from mall parking. Toyota Corolla, license KCZ 123A.",
              status: "Under Investigation",
              createdById: "user201",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Sarit Centre, Westlands",
              crimeType: "Vehicle Theft"
            },
          },
          {
            id: "c202",
            crimeReportId: "r202",
            assignedOfficerId: "officer2",
            assignedOfficerName: "Officer Jane Smith",
            progress: "Pending",
            lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r202",
              title: "Business Burglary",
              description: "Break-in at local business. Cash register and electronics taken.",
              status: "Under Investigation",
              createdById: "user202",
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Biashara Street, CBD",
              crimeType: "Burglary"
            },
          },
          {
            id: "c203",
            crimeReportId: "r203",
            assignedOfficerId: "officer1",
            assignedOfficerName: "Officer John Doe",
            progress: "Completed",
            lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            submittedToJudiciary: true,
            judiciaryStatus: "Accepted",
            crimeReport: {
              id: "r203",
              title: "Assault at Nightclub",
              description: "Physical altercation between patrons at nightclub.",
              status: "Closed",
              createdById: "user203",
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Club Zeros, Westlands",
              crimeType: "Assault"
            },
          },
          {
            id: "c204",
            crimeReportId: "r204",
            assignedOfficerId: "officer3",
            assignedOfficerName: "Officer James Kimani",
            progress: "In Progress",
            lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r204",
              title: "Identity Theft Report",
              description: "Victim reported unauthorized accounts opened in their name.",
              status: "Under Investigation",
              createdById: "user204",
              createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              location: "N/A (Online Crime)",
              crimeType: "Fraud"
            },
          },
          {
            id: "c205",
            crimeReportId: "r205",
            assignedOfficerId: "officer2",
            assignedOfficerName: "Officer Jane Smith",
            progress: "Pending Review",
            lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r205",
              title: "Drug Activity Report",
              description: "Suspected drug dealing in apartment complex.",
              status: "Under Investigation",
              createdById: "user205",
              createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Parklands Estate, Nairobi",
              crimeType: "Narcotics"
            },
          },
        ];
        
        setOfficers(mockOfficers);
        setPendingReports(mockReports);
        setAllCases(mockCases);
        setFilteredCases(mockCases);
        
        // Set statistics
        setStats({
          totalCases: mockCases.length,
          pendingReports: mockReports.length,
          activeCases: mockCases.filter(c => c.progress !== "Completed").length,
          completedCases: mockCases.filter(c => c.progress === "Completed").length,
          totalOfficers: mockOfficers.length
        });
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
    let filtered = [...allCases];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(caseItem => 
        caseItem.crimeReport?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.crimeReport?.crimeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.assignedOfficerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case "caseId":
          valueA = a.id;
          valueB = b.id;
          break;
        case "crimeType":
          valueA = a.crimeReport?.crimeType || "";
          valueB = b.crimeReport?.crimeType || "";
          break;
        case "title":
          valueA = a.crimeReport?.title || "";
          valueB = b.crimeReport?.title || "";
          break;
        case "officer":
          valueA = a.assignedOfficerName || "";
          valueB = b.assignedOfficerName || "";
          break;
        case "progress":
          valueA = a.progress || "";
          valueB = b.progress || "";
          break;
        default:
          valueA = a.lastUpdated || "";
          valueB = b.lastUpdated || "";
      }
      
      if (sortDirection === "asc") {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
    
    setFilteredCases(filtered);
  }, [allCases, searchTerm, sortField, sortDirection]);

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
    
    toast({
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
    
    toast({
      title: "Case created",
      description: `New case created and assigned to ${officerName}`,
    });
  };
  
  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
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
    
    toast({
      title: "Case submitted to judiciary",
      description: `Case ${caseId} has been submitted for judiciary review`,
    });
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
