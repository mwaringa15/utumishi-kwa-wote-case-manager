
import { useState, useEffect } from "react";
import { Case, CaseProgress, CaseStatus, CrimeReport, User } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export function useCasesAndReports(user: User | null) {
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCases: 0,
    pendingReports: 0,
    closedCases: 0,
    totalAssigned: 0
  });
  const { toast } = useToast();
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch data from your Supabase backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - pending reports
        const mockReports: CrimeReport[] = [
          {
            id: "r3",
            title: "Shoplifting at Central Market",
            description: "Observed a person taking items without paying at the electronics section around 3 PM.",
            status: "Submitted",
            createdById: "user123",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "r4",
            title: "Suspicious Activity",
            description: "Noticed unusual activity around the abandoned building on West Street for the past few nights.",
            status: "Submitted",
            createdById: "user456",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        
        // Mock data - assigned cases
        const mockCases: Case[] = [
          {
            id: "c3",
            crimeReportId: "r5",
            assignedOfficerId: user?.id,
            progress: "In Progress",
            lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r5",
              title: "Vehicle Theft",
              description: "Car stolen from residential parking. Toyota Camry, license KBZ 123J.",
              status: "Under Investigation",
              createdById: "user789",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
          {
            id: "c4",
            crimeReportId: "r6",
            assignedOfficerId: user?.id,
            progress: "Pending",
            lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r6",
              title: "Break-in at Business Premises",
              description: "Store broken into overnight. Security camera shows two individuals.",
              status: "Under Investigation",
              createdById: "user101",
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
          {
            id: "c5",
            crimeReportId: "r7",
            assignedOfficerId: user?.id,
            progress: "Completed",
            lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r7",
              title: "Assault Report",
              description: "Physical altercation at Downtown Bar on Saturday night.",
              status: "Closed",
              createdById: "user202",
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
        ];
        
        setPendingReports(mockReports);
        setAssignedCases(mockCases);
        
        // Set statistics
        setStats({
          activeCases: mockCases.filter(c => c.progress !== "Completed").length,
          pendingReports: mockReports.length,
          closedCases: mockCases.filter(c => c.progress === "Completed").length,
          totalAssigned: mockCases.length,
        });
      } catch (error) {
        console.error("Failed to load officer dashboard data", error);
        toast({
          title: "Error loading data",
          description: "Failed to load case information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user, toast]);
  
  // Handle case status update
  const handleUpdateStatus = (caseId: string, newStatus: CaseStatus) => {
    setAssignedCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId && caseItem.crimeReport) {
        return {
          ...caseItem,
          lastUpdated: new Date().toISOString(),
          crimeReport: {
            ...caseItem.crimeReport,
            status: newStatus
          }
        };
      }
      return caseItem;
    }));
    
    toast({
      title: "Case status updated",
      description: `Case ${caseId} status changed to ${newStatus}`,
    });
  };
  
  // Handle case progress update
  const handleUpdateProgress = (caseId: string, newProgress: CaseProgress) => {
    setAssignedCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId) {
        return {
          ...caseItem,
          progress: newProgress,
          lastUpdated: new Date().toISOString(),
        };
      }
      return caseItem;
    }));
    
    // If case is completed, also update the crime report status to closed
    if (newProgress === "Completed") {
      setAssignedCases(prev => prev.map(caseItem => {
        if (caseItem.id === caseId && caseItem.crimeReport) {
          return {
            ...caseItem,
            crimeReport: {
              ...caseItem.crimeReport,
              status: "Closed"
            }
          };
        }
        return caseItem;
      }));
    }
    
    toast({
      title: "Case progress updated",
      description: `Case ${caseId} progress changed to ${newProgress}`,
    });
  };
  
  // Handle assigning a report to yourself
  const handleAssignReport = (reportId: string) => {
    // Find the report
    const report = pendingReports.find(r => r.id === reportId);
    if (!report) return;
    
    // Create a new case
    const newCase: Case = {
      id: "c" + Math.random().toString(36).substring(2, 10),
      crimeReportId: reportId,
      assignedOfficerId: user?.id,
      progress: "Pending",
      lastUpdated: new Date().toISOString(),
      crimeReport: {
        ...report,
        status: "Under Investigation"
      }
    };
    
    // Add to assigned cases
    setAssignedCases(prev => [...prev, newCase]);
    
    // Remove from pending reports
    setPendingReports(prev => prev.filter(r => r.id !== reportId));
    
    // Update stats
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
  
  // Handle evidence upload completion
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
