
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { StationData, StationCase, StationOfficer } from "@/components/supervisor/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchStationDetails, StationDetailsResult } from "./stationUtils/fetchStationDetails";
import { fetchUnassignedCases } from "./stationUtils/fetchUnassignedCases";
import { fetchStationOfficers } from "./stationUtils/fetchStationOfficers";
import { assignCaseToOfficer as assignCaseUtil } from "./stationUtils/assignCaseToOfficer";

export function useStationData(user: User | null) {
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStationData = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const stationDetails: StationDetailsResult | null = await fetchStationDetails({ supabase, userId: user.id, toast });

      if (!stationDetails) {
        setLoading(false);
        return;
      }
      
      const { stationId, stationName } = stationDetails;

      // Fetch cases and officers in parallel
      const [unassignedCases, officers] = await Promise.all([
        fetchUnassignedCases({ supabase, stationId, stationName, toast }),
        fetchStationOfficers({ supabase, stationId, stationName, toast })
      ]);
      
      setStationData({
        station: stationName,
        stationId: stationId, 
        unassignedCases: unassignedCases,
        officers: officers,
        pendingReports: [] // Preserving this from original logic
      });
      
    } catch (error: any) {
      console.error("Error in fetchStationData orchestrator:", error);
      toast({
        title: "Dashboard Error",
        description: error.message || "An unexpected error occurred while loading station data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchStationData();
  }, [fetchStationData]);

  const handleAssignCase = async (caseId: string, officerId: string): Promise<boolean> => {
    const success = await assignCaseUtil({ supabase, caseId, officerId, toast });
    if (success) {
      await fetchStationData(); // Refresh data after successful assignment
    }
    return success;
  };

  return { stationData, loading, handleAssignCase, refreshStationData: fetchStationData };
}
