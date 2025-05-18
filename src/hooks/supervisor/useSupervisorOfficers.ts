
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getUserStationData } from "./modules/getUserStationData";
import { fetchOfficers } from "./modules/fetchOfficers";
import { supabase } from "@/integrations/supabase/client";

export function useSupervisorOfficers(userId?: string, providedStationId?: string | null) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [officers, setOfficers] = useState<User[]>([]);
  const [stationName, setStationName] = useState<string>("");
  const [stationId, setStationId] = useState<string | null>(providedStationId || null);
  
  const fetchOfficersData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching officers data for user ID:", userId, "Station ID:", providedStationId || stationId);
      
      // Use provided stationId if available, otherwise get user's station data
      let effectiveStationId = providedStationId || stationId;
      let stationNameValue = stationName;
      
      if (!effectiveStationId) {
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
        
        effectiveStationId = stationData.stationId;
        stationNameValue = stationData.stationName;
        
        setStationId(effectiveStationId);
        setStationName(stationNameValue);
      } else if (!stationNameValue) {
        // If we have a station ID but no name, fetch the name
        const { data, error } = await supabase
          .from('stations')
          .select('name')
          .eq('id', effectiveStationId)
          .single();
          
        if (!error && data) {
          stationNameValue = data.name;
          setStationName(stationNameValue);
        }
      }
      
      console.log("Using station data:", { effectiveStationId, stationNameValue });
      
      // Fetch officers data based on station
      let officersData: User[] = [];
      
      if (effectiveStationId) {
        // Fetch officers for specific station
        officersData = await fetchOfficers(effectiveStationId);
      } else {
        console.warn("No station ID available, returning empty officers array");
      }
      
      console.log("Fetched officers:", officersData);
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
  }, [userId, toast, providedStationId, stationId, stationName]);

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
