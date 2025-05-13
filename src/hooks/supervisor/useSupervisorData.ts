
import { useState, useEffect } from "react";
import { Case, CrimeReport, User, UserRole, CaseStatus, CrimeStatus, OfficerStatus, CaseProgress } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { filterAndSortCases } from "./utils/dataFilters";
import { createCaseActionHandlers } from "./utils/caseActions";
import { SupervisorStats } from "./types"; // Assuming this type remains relevant

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
        // 1. Get the user's station_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('station_id')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        const stationId = userData?.station_id;

        if (!stationId) {
          toast({
            title: "Station Not Found",
            description: "Supervisor is not assigned to any station.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // 2. Fetch Officers
        const { data: officersData, error: officersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status, station_id')
          .eq('station_id', stationId)
          .in('role', ['Officer', 'OCS']); // Include OCS if they can be assigned cases or are listed

        if (officersError) throw officersError;

        const officerCaseCounts: Record<string, number> = {};
        if (officersData) {
          for (const officer of officersData) {
            const { count, error: caseCountError } = await supabase
              .from('cases')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_officer_id', officer.id)
              .not('status', 'in', ('Completed,Closed')); // Active cases
            if (caseCountError) {
              console.warn(`Failed to fetch case count for officer ${officer.id}:`, caseCountError.message);
            }
            officerCaseCounts[officer.id] = count || 0;
          }
        }
        
        const fetchedOfficers: User[] = officersData?.map(o => ({
          id: o.id,
          name: o.full_name || o.email.split('@')[0],
          email: o.email,
          role: o.role as UserRole,
          status: o.status as OfficerStatus || 'on_duty',
          station: stationId, // station name could be fetched if needed, for now use ID or a placeholder
          badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`, // Or fetch if available
          assignedCases: officerCaseCounts[o.id] || 0,
        })) || [];
        setOfficers(fetchedOfficers);

        // 3. Fetch Pending Reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .eq('station_id', stationId)
          .eq('status', 'Pending');

        if (reportsError) throw reportsError;
        const fetchedPendingReports: CrimeReport[] = reportsData?.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status as CrimeStatus,
          createdById: r.reporter_id || user.id, // Fallback to current user if reporter_id is null
          createdAt: r.created_at,
          crimeType: r.category, // Assuming category is crimeType
          location: r.location,
          category: r.category,
        })) || [];
        setPendingReports(fetchedPendingReports);

        // 4. Fetch All Cases
        const { data: casesData, error: casesError } = await supabase
          .from('cases')
          .select(`
            id,
            report_id,
            assigned_officer_id,
            status,
            priority,
            created_at,
            updated_at,
            station,
            reports (
              id,
              title,
              description,
              status,
              created_at,
              location,
              category,
              reporter_id
            )
          `)
          .eq('station', stationId);
          
        if (casesError) throw casesError;

        const officerMap: Record<string, string> = {};
        fetchedOfficers.forEach(officer => {
          if(officer.id) officerMap[officer.id] = officer.name;
        });
        
        const progressMapping: Record<string, CaseProgress> = {
            'Submitted': 'Pending',
            'Pending': 'Pending',
            'Under Investigation': 'In Progress',
            'In Progress': 'In Progress',
            'Closed': 'Completed',
            'Completed': 'Completed',
            'Rejected': 'Completed',
            'Submitted to Judiciary': 'Pending Review',
            'Under Court Process': 'In Progress',
            'Returned from Judiciary': 'In Progress'
          };

        const fetchedCases: Case[] = casesData?.map(c => {
          const report = c.reports as any; // Supabase returns related record directly
          return {
            id: c.id,
            crimeReportId: c.report_id,
            assignedOfficerId: c.assigned_officer_id,
            assignedOfficerName: c.assigned_officer_id ? officerMap[c.assigned_officer_id] : "Unassigned",
            progress: progressMapping[c.status as string] || 'Pending',
            lastUpdated: c.updated_at || c.created_at,
            priority: c.priority as "high" | "medium" | "low" | undefined,
            station: c.station,
            crimeReport: report ? {
              id: report.id,
              title: report.title,
              description: report.description,
              status: report.status as CrimeStatus,
              createdAt: report.created_at,
              location: report.location,
              crimeType: report.category,
              category: report.category,
              createdById: report.reporter_id || user.id, 
            } : undefined,
            status: c.status as CaseStatus,
          };
        }) || [];
        setAllCases(fetchedCases);
        setFilteredCases(fetchedCases); // Initialize filteredCases

        // 5. Calculate Stats
        const totalCases = fetchedCases.length;
        const pendingRepCount = fetchedPendingReports.length;
        const activeCases = fetchedCases.filter(c => c.progress === 'In Progress' || c.progress === 'Pending' || c.progress === 'Pending Review').length;
        const completedCases = fetchedCases.filter(c => c.progress === 'Completed').length;
        const totalOfficers = fetchedOfficers.length;

        setStats({
          totalCases,
          pendingReports: pendingRepCount,
          activeCases,
          completedCases,
          totalOfficers
        });
        
      } catch (error) {
        console.error("Failed to load supervisor dashboard data", error);
        toast({
          title: "Error loading data",
          description: `Failed to load dashboard information. ${(error as Error).message}`,
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
    officers, // Pass officers to action handlers if needed for assignment logic/UI
    setOfficers, // Pass setOfficers if action handlers might change officer assignments/stats
    setStats, // Pass setStats to update stats after actions
    showToast: toast,
    currentUser: user, // Pass current user for context if needed in actions
  });
  
  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc"); // Default to ascending when changing field
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
    // setSortField, // Controlled by toggleSort
    // setSortDirection, // Controlled by toggleSort
    toggleSort,
    handleAssignCase,
    handleCreateCase,
    handleSubmitToJudiciary
  };
}
