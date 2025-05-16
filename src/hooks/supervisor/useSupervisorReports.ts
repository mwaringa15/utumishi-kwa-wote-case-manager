
import { useState, useEffect, useCallback } from "react";
import { CrimeReport, User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { fetchStationData } from "./modules/fetchStationData";
import { fetchReports } from "./modules/fetchReports";
import { fetchOfficers } from "./modules/fetchOfficers";

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
      // Step 1: Get the station data
      const { stationId: fetchedStationId, stationName: fetchedStationName } = 
        await fetchStationData(userId, toast);
      
      setStationId(fetchedStationId);
      setStationName(fetchedStationName);
      
      // Step 2: Fetch reports for this station
      const reports = await fetchReports(fetchedStationId);
      setPendingReports(reports);
      
      // Step 3: Fetch officers for this station
      const officersList = await fetchOfficers(fetchedStationId);
      setOfficers(officersList);
      
    } catch (error: any) {
      console.error("Error fetching reports data:", error);
      toast({
        title: "Error loading data",
        description: error?.message || "Failed to load reports data. Please try again later.",
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
