
import { Case, CrimeReport, User, OfficerStats } from "@/types";
import { UseToastReturn } from "@/hooks/use-toast"; // Assuming useToast returns an object with a toast method

interface LoadDataParams {
  user: User | null;
  setAssignedCases: React.Dispatch<React.SetStateAction<Case[]>>;
  setPendingReports: React.Dispatch<React.SetStateAction<CrimeReport[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStats: React.Dispatch<React.SetStateAction<OfficerStats>>;
  toast: UseToastReturn['toast'];
}

export const loadOfficerDashboardData = async ({
  user,
  setAssignedCases,
  setPendingReports,
  setIsLoading,
  setStats,
  toast,
}: LoadDataParams): Promise<void> => {
  if (!user) {
    setIsLoading(false);
    return;
  }

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
        status: "Under Investigation",
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
        status: "Submitted",
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
        status: "Closed",
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

