
import { useState, useEffect, useCallback } from "react";
import { CrimeReport, User, OfficerStatus, CrimeStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchStationOfficers } from "./stationUtils/fetchStationOfficers";

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
      // First check localStorage for stored station ID
      const storedStationId = localStorage.getItem('selected_station_id');
      let effectiveStationId = storedStationId;
      let stationNameToSet = "";
      
      if (!effectiveStationId) {
        // If no stored station ID, try to get it from user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('station_id')
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
        
        effectiveStationId = userData?.station_id || null;
      }
      
      setStationId(effectiveStationId);
      
      // Step 1: Get the station data if we have a station ID
      if (effectiveStationId) {
        const { data: stationData, error: stationError } = await supabase
          .from('stations')
          .select('name')
          .eq('id', effectiveStationId)
          .single();
          
        if (stationError) {
          console.error("Error fetching station name:", stationError);
          stationNameToSet = "Unknown Station";
        } else {
          stationNameToSet = stationData?.name || "Unknown Station";
        }
        
        setStationName(stationNameToSet);
        
        // Step 2: Fetch reports for this station
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('id, title, description, location, category, status, created_at, reporter_id')
          .eq('station_id', effectiveStationId)
          .eq('status', 'Pending');
          
        if (reportsError) {
          console.error("Error fetching reports:", reportsError);
          toast({
            title: "Error Loading Reports",
            description: "Could not load reports for your station.",
            variant: "destructive",
          });
          setPendingReports([]);
        } else if (reportsData) {
          // Format reports
          const formattedReports: CrimeReport[] = reportsData.map(report => ({
            id: report.id,
            title: report.title,
            description: report.description,
            status: report.status as CrimeStatus, // Cast to CrimeStatus type
            createdAt: report.created_at,
            location: report.location,
            crimeType: report.category,
            createdById: report.reporter_id || "",
          }));
          
          setPendingReports(formattedReports);
        }
        
        // Step 3: Fetch officers with counts using the dedicated utility function
        try {
          console.log("Fetching officers for station:", effectiveStationId, stationNameToSet);
          const stationOfficers = await fetchStationOfficers({ 
            supabase, 
            stationId: effectiveStationId, 
            stationName: stationNameToSet, 
            toast 
          });
          
          console.log("Fetched officers:", stationOfficers);
          setOfficers(stationOfficers);
        } catch (error) {
          console.error("Error in fetchStationOfficers:", error);
          setOfficers([]);
        }
      } else {
        setStationName("No Station Selected");
        setPendingReports([]);
        setOfficers([]);
      }
    } catch (error: any) {
      console.error("Error fetching reports data:", error);
      toast({
        title: "Error loading data",
        description: error?.message || "Failed to load reports data. Please try again later.",
        variant: "destructive",
      });
      setPendingReports([]);
      setOfficers([]);
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
