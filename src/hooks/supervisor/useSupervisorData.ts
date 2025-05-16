import { useState, useEffect, useCallback } from "react";
import { User, Case, CrimeReport, UserRole } from "@/types"; // Removed GenericOfficerStats as it wasn't used
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SupervisorStats } from "./types"; // Corrected import path for SupervisorStats

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
    let fetchedStationId: string | null = null;

    try {
      if (user.id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('station_id')
          .eq('id', user.id)
          .single();
        if (userError) {
            console.error("Error fetching user's station_id:", userError);
        }
        fetchedStationId = userData?.station_id || null;
      }

      if (!fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
        toast({ title: "No Station ID", description: "Supervisor's station ID could not be determined.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const caseQuery = supabase
        .from('cases')
        .select(`
          *,
          reports:report_id (*),
          users:assigned_officer_id (full_name)
        `);
      
      if (fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
        caseQuery.eq('station', fetchedStationId);
      }
        
      const { data: casesData, error: casesError } = await caseQuery;
      if (casesError) throw casesError;

      const formattedCases: Case[] = (casesData || []).map((c: any) => ({
        id: c.id,
        crimeReportId: c.report_id,
        assignedOfficerId: c.assigned_officer_id,
        assignedOfficerName: c.users?.full_name || "Unassigned",
        progress: c.status, 
        status: c.status, 
        lastUpdated: c.updated_at,
        priority: c.priority,
        station: c.station,
        crimeReport: c.reports ? {
          id: c.reports.id,
          title: c.reports.title,
          description: c.reports.description,
          status: c.reports.status,
          createdById: c.reports.reporter_id,
          createdAt: c.reports.created_at,
          location: c.reports.location,
          crimeType: c.reports.category,
        } : undefined,
      }));
      setCases(formattedCases);

      // Modified report query to filter by station_id
      const reportQuery = supabase
        .from('reports')
        .select('*')
        .eq('status', 'Pending');
      
      if (fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
        reportQuery.eq('station_id', fetchedStationId);
      }

      const { data: reportsData, error: reportsError } = await reportQuery;
      if (reportsError) throw reportsError;
      
      const formattedReports: CrimeReport[] = (reportsData || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        createdById: r.reporter_id,
        createdAt: r.created_at,
        location: r.location,
        category: r.category,
        crimeType: r.category,
      }));
      setPendingReports(formattedReports);

      // Fetch Officers
      const officerQuery = supabase
        .from('users')
        .select('id, full_name, email, role, status') // Removed badge_number
        .eq('role', 'Officer' as UserRole);

      if (fetchedStationId && user.role !== "Administrator" && user.role !== "Commander") {
        officerQuery.eq('station_id', fetchedStationId);
      }
      
      const { data: officersData, error: officersError } = await officerQuery;
      if (officersError) throw officersError;

      const officersWithCaseCounts = await Promise.all(
        (officersData || []).map(async (officer: any) => {
          const { count, error: countError } = await supabase
            .from('cases')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_officer_id', officer.id)
            .not('status', 'in', '("Closed", "Rejected")');
          if (countError) console.error("Error fetching officer case count:", countError);
          return {
            id: officer.id,
            name: officer.full_name || officer.email.split('@')[0],
            email: officer.email,
            role: officer.role as UserRole,
            status: officer.status,
            // badgeNumber: officer.badge_number || `KP${Math.floor(10000 + Math.random() * 90000)}`, // Removed badgeNumber
            assignedCases: count || 0,
          };
        })
      );
      setOfficers(officersWithCaseCounts as User[]); // Cast to User[] which expects optional badgeNumber

      // Calculate Stats matching SupervisorStats
      setStats({
        totalCases: formattedCases.length,
        pendingReports: formattedReports.length,
        activeCases: formattedCases.filter(c => c.status !== 'Closed' && c.status !== 'Rejected').length,
        completedCases: formattedCases.filter(c => c.status === 'Closed' || c.status === 'Rejected').length,
        totalOfficers: officersWithCaseCounts.length,
      });

    } catch (error: any) {
      console.error("Failed to load supervisor data:", error);
      toast({
        title: "Error Loading Data",
        description: error.message || "Could not load supervisor dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignCase = async (caseId: string, officerId: string, officerName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cases')
        .update({ assigned_officer_id: officerId, status: 'Under Investigation', updated_at: new Date().toISOString() })
        .eq('id', caseId);
      if (error) throw error;
      toast({ title: "Case Assigned", description: `Case ${caseId.substring(0,8)} assigned to ${officerName}.` });
      await fetchData(); // Refresh data
      return true;
    } catch (error: any) {
      toast({ title: "Assignment Failed", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCase = async (reportId: string, officerId: string, officerName: string): Promise<boolean> => {
    setIsLoading(true);
    let userStationId: string | null = null;
    if (user?.id) { // user.station is station name, user.station_id is the id
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('station_id') // Use station_id here
            .eq('id', user.id)
            .single();
        if (userError) {
            toast({ title: "Error", description: "Could not fetch user station for case creation.", variant: "destructive" });
            setIsLoading(false);
            return false;
        }
        userStationId = userData?.station_id; // Assign station_id
    }

    if (!userStationId) {
        toast({ title: "Error", description: "User station ID is missing for case creation.", variant: "destructive" });
        setIsLoading(false);
        return false;
    }

    try {
      const report = pendingReports.find(r => r.id === reportId);
      if (!report) throw new Error("Report not found");

      const { data: newCase, error: caseInsertError } = await supabase
        .from('cases')
        .insert({
          report_id: reportId,
          assigned_officer_id: officerId,
          status: 'Under Investigation', 
          priority: 'medium', 
          station: userStationId, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (caseInsertError) throw caseInsertError;

      const { error: reportUpdateError } = await supabase
        .from('reports')
        .update({ status: 'Under Investigation' }) 
        .eq('id', reportId);
      if (reportUpdateError) throw reportUpdateError;
      
      toast({ title: "Case Created", description: `Case created from report ${report.title.substring(0,20)}... and assigned to ${officerName}.` });
      await fetchData(); 
      return true;
    } catch (error: any) {
      toast({ title: "Case Creation Failed", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmitToJudiciary = async (caseId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'Submitted to Judiciary', updated_at: new Date().toISOString() })
        .eq('id', caseId);
      if (error) throw error;
      toast({ title: "Case Submitted", description: `Case ${caseId.substring(0,8)} submitted to Judiciary.` });
      await fetchData(); // Refresh data
      return true;
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSort = (field: keyof Case | keyof CrimeReport | keyof User) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field as keyof Case & keyof CrimeReport & keyof User); // Adjusted type for setSortField
      setSortDirection("asc");
    }
  };
  
  const sortData = <T extends Case | CrimeReport | User>(data: T[], field: keyof T, direction: "asc" | "desc"): T[] => {
    return [...data].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
  
      if (valA === null || valA === undefined) return direction === 'asc' ? -1 : 1;
      if (valB === null || valB === undefined) return direction === 'asc' ? 1 : -1;
  
      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      // Ensure Date objects are compared correctly
      if (valA instanceof Date && valB instanceof Date) {
        return direction === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
      }
      // For dates as strings, convert to Date objects for comparison
      if (typeof valA === 'string' && typeof valB === 'string' && !isNaN(new Date(valA).getTime()) && !isNaN(new Date(valB).getTime())) {
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Generic comparison for other types, ensure they are comparable
      if (typeof valA === typeof valB) {
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredCases = sortData(
    cases.filter(c => 
      (c.crimeReport?.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.id.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    sortField as keyof Case,
    sortDirection
  );
  
  const validReportSortField = sortField as keyof CrimeReport;
  const filteredPendingReports = sortData(
    pendingReports.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())),
    validReportSortField,
    sortDirection
  );
  
  const validOfficerSortField = sortField as keyof User;  
  const filteredOfficers = sortData(
    officers.filter(o => 
      (o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       o.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
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
    sortField: sortField as keyof Case & keyof CrimeReport & keyof User, // Ensure sortField type consistency
    sortDirection,
    toggleSort,
    setSortDirection,
    handleAssignCase,
    handleCreateCase,
    handleSubmitToJudiciary,
    refreshData: fetchData,
  };
}
