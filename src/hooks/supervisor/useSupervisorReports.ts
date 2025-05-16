
import { useState, useEffect, useCallback } from "react";
import { CrimeReport, User, CrimeStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchStationDetails } from "@/hooks/supervisor/stationUtils/fetchStationDetails";

export function useSupervisorReports(userId: string | undefined) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [stationId, setStationId] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string>("");
  
  // Create a fetchReportsData function that can be called when needed
  const fetchReportsData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // First try to get station_id from localStorage (if set during login)
      const storedStationId = localStorage.getItem('selected_station_id');
      
      // Fetch the supervisor's station details
      const stationDetails = await fetchStationDetails({ 
        supabase, 
        userId, 
        toast 
      });

      if (!stationDetails) {
        toast({
          title: "Station not found",
          description: "You are not assigned to any station. Please log in again and select a station.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Use stored station ID if available, otherwise use the one from user profile
      const effectiveStationId = storedStationId || stationDetails.stationId;
      
      if (!effectiveStationId && stationDetails.userRole !== "Administrator" && stationDetails.userRole !== "Commander") {
        toast({
          title: "No Station Selected",
          description: "Please log in again and select a station to view reports.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setStationId(effectiveStationId);
      setStationName(stationDetails.stationName);

      console.log(`Fetching reports for station ID: ${effectiveStationId}`);

      // First fetch all reports for this station
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('station_id', effectiveStationId)
        .eq('status', 'Pending');

      if (reportsError) {
        console.error("Error fetching reports:", reportsError);
        throw reportsError;
      }

      console.log(`Found ${reportsData?.length || 0} pending reports for station`);

      // Then fetch all existing case report_ids
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('report_id');
        
      if (casesError) throw casesError;

      // Extract the report_ids that already have cases
      const reportIdsWithCases = casesData.map(item => item.report_id);

      // Filter out reports that already have cases
      const reportsWithoutCases = reportsData.filter(report => 
        !reportIdsWithCases.includes(report.id)
      );

      console.log(`${reportsWithoutCases.length} reports don't have cases yet`);

      // Get officers for case assignment - only get officers from the same station
      const { data: officersData, error: officersError } = await supabase
        .from('users')
        .select('id, full_name, email, role, status')
        .eq('station_id', effectiveStationId)
        .eq('role', 'officer');  // Using lowercase role

      if (officersError) throw officersError;

      // Format officers data
      const formattedOfficers: User[] = officersData.map(officer => ({
        id: officer.id,
        name: officer.full_name || officer.email.split('@')[0],
        email: officer.email,
        role: "Officer",
        badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
        assignedCases: 0 // Placeholder
      }));

      // Format reports - explicitly cast the status string to CrimeStatus type
      const formattedReports: CrimeReport[] = reportsWithoutCases.map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        status: report.status as CrimeStatus, // Explicit cast to CrimeStatus
        createdAt: report.created_at,
        crimeType: report.category,
        location: report.location,
        createdById: report.reporter_id || userId,
        category: report.category
      }));

      setOfficers(formattedOfficers);
      setPendingReports(formattedReports);
    } catch (error) {
      console.error("Error fetching reports data:", error);
      toast({
        title: "Error loading data",
        description: "Failed to load reports data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  // Call fetchReportsData when the component mounts
  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  return {
    isLoading,
    pendingReports,
    officers,
    stationId,
    stationName,
    // Add a refresh function that can be called after creating a case
    refreshData: fetchReportsData
  };
}
