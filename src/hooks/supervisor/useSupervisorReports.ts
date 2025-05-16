
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
      // First check localStorage for stored station ID (set during login)
      const storedStationId = localStorage.getItem('selected_station_id');
      
      if (!storedStationId) {
        // If no stored station ID, try to get it from user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('station_id, role')
          .eq('id', userId)
          .single();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
          toast({
            title: "User Data Error",
            description: "Could not fetch your station assignment. Please log in again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (!userData.station_id && userData.role.toLowerCase() !== 'administrator' && userData.role.toLowerCase() !== 'commander' && userData.role.toLowerCase() !== 'ocs') {
          toast({
            title: "No Station Assigned",
            description: "You are not assigned to any station. Please contact an administrator.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Use the station ID from user profile if available
        if (userData.station_id) {
          setStationId(userData.station_id);
          
          // Store it for future use
          localStorage.setItem('selected_station_id', userData.station_id);
          
          // Get station name
          const { data: stationData, error: stationError } = await supabase
            .from('stations')
            .select('name')
            .eq('id', userData.station_id)
            .single();
            
          if (stationError) {
            console.error("Error fetching station name:", stationError);
            setStationName("Unknown Station");
          } else {
            setStationName(stationData.name);
          }
        } else {
          // For administrators, commanders, or OCS, set a placeholder
          setStationId(null);
          setStationName("All Stations");
          
          // For these roles, we'll fetch all reports later
        }
      } else {
        // Use the stored station ID
        setStationId(storedStationId);
        
        // Get station name
        const { data: stationData, error: stationError } = await supabase
          .from('stations')
          .select('name')
          .eq('id', storedStationId)
          .single();
          
        if (stationError) {
          console.error("Error fetching station name:", stationError);
          setStationName("Unknown Station");
        } else {
          setStationName(stationData.name);
        }
      }

      // Now fetch reports based on station ID
      let reportsQuery = supabase
        .from('reports')
        .select('*')
        .eq('status', 'Pending');
        
      // Only filter by station_id if we have one and the user isn't an administrator/commander/OCS
      if (stationId) {
        reportsQuery = reportsQuery.eq('station_id', stationId);
        console.log(`Fetching reports for station ID: ${stationId}`);
      } else {
        console.log("Fetching all reports (admin/commander view)");
      }
      
      const { data: reportsData, error: reportsError } = await reportsQuery;

      if (reportsError) {
        console.error("Error fetching reports:", reportsError);
        throw reportsError;
      }

      console.log(`Found ${reportsData?.length || 0} pending reports`);

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
      let officersQuery = supabase
        .from('users')
        .select('id, full_name, email, role, status');
        
      // Only filter by station_id if we have one
      if (stationId) {
        officersQuery = officersQuery.eq('station_id', stationId);
      }
      
      // Always filter for officers only
      officersQuery = officersQuery.eq('role', 'officer');
      
      const { data: officersData, error: officersError } = await officersQuery;

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

      // Format reports
      const formattedReports: CrimeReport[] = reportsWithoutCases.map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        status: report.status as CrimeStatus,
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
