
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getUserStationData } from "./modules/getUserStationData";
import { fetchStationOfficers } from "./modules/fetchStationOfficers";
import { fetchAllOfficers } from "./modules/fetchAllOfficers";

export function useSupervisorOfficers(userId?: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [officers, setOfficers] = useState<User[]>([]);
  const [stationName, setStationName] = useState<string>("");
  const [stationId, setStationId] = useState<string | null>(null);
  
  const fetchOfficersData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get user's station data
      const stationData = await getUserStationData(userId);
      
      if ('error' in stationData) {
        toast({
          title: "Station Data Error",
          description: stationData.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setStationId(stationData.stationId);
      setStationName(stationData.stationName);
      
      // Fetch officers data based on station
      let officersData: User[] = [];
      
      if (stationData.stationId) {
        // Fetch officers for specific station
        officersData = await fetchStationOfficers(stationData.stationId, stationData.stationName);
      } else {
        // Fetch all officers (for administrators)
        officersData = await fetchAllOfficers();
      }
      
      setOfficers(officersData);
    } catch (error: any) {
      console.error("Error fetching officers data:", error);
      toast({
        title: "Error loading data",
        description: error.message || "Failed to load officers data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchOfficersData();
  }, [fetchOfficersData]);

  return {
    isLoading,
    officers,
    stationName,
    stationId,
    refreshData: fetchOfficersData
  };
}
