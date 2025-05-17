
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { StationData, StationCase, StationOfficer } from "@/components/supervisor/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchStationDetails } from "./stationUtils/fetchStationDetails";
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
      const stationDetails = await fetchStationDetails({ supabase, userId: user.id, toast });

      if (!stationDetails) {
        setLoading(false);
        return;
      }
      
      const { stationId, stationName } = stationDetails;

      // Fetch cases and officers in parallel
      const [unassignedCases, officersData] = await Promise.all([
        fetchUnassignedCases({ supabase, stationId, stationName, toast }),
        fetchStationOfficers({ supabase, stationId, stationName, toast })
      ]);
      
      // Convert User[] to StationOfficer[] - ensuring each officer has a non-optional id
      const officers: StationOfficer[] = officersData
        .filter(officer => officer && officer.id) // Filter out any officers without an id
        .map(officer => ({
          id: officer.id as string, // Cast to string since we filtered out undefined ids
          name: officer.name,
          email: officer.email,
          role: officer.role,
          station: officer.station || stationName,
          status: officer.status || 'unknown',
          assignedCases: officer.assignedCases || 0,
          badgeNumber: officer.badgeNumber
        }));
      
      // Count statistics for dashboard
      const stats = {
        totalCases: unassignedCases.length,
        pendingReports: 0, // Will be updated with actual count
        activeCases: unassignedCases.length,
        completedCases: 0, // Will be updated with actual count
        totalOfficers: officers.length
      };
      
      // Fetch pending reports count
      try {
        const { count: pendingCount, error: pendingError } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('station_id', stationId)
          .eq('status', 'Pending');
          
        if (!pendingError && pendingCount !== null) {
          stats.pendingReports = pendingCount;
        }
      } catch (error) {
        console.error("Error fetching pending reports count:", error);
      }
      
      // Fetch completed cases count
      try {
        const { count: completedCount, error: completedError } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('station', stationName)
          .eq('status', 'Completed');
          
        if (!completedError && completedCount !== null) {
          stats.completedCases = completedCount;
        }
      } catch (error) {
        console.error("Error fetching completed cases count:", error);
      }
      
      setStationData({
        station: stationName,
        stationId: stationId, 
        unassignedCases: unassignedCases,
        officers: officers, // Now using properly converted officers array
        pendingReports: [], // Preserving this from original logic
        stats: stats // Add stats to stationData
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
