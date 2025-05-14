import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { StationData } from "@/components/supervisor/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      // 1. Get the user's station_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('station_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.station_id) {
        toast({
          title: "Error fetching user data",
          description: "Could not determine your station. Please ensure you are assigned to one.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      const stationId = userData.station_id;

      // 2. Fetch station details
      const { data: stationDetails, error: stationError } = await supabase
        .from('stations')
        .select('name')
        .eq('id', stationId)
        .single();
      
      if (stationError || !stationDetails) {
        toast({
          title: "Error fetching station details",
          description: "Could not load details for your assigned station.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // 3. Fetch unassigned cases for the station
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select(`
          id, 
          priority, 
          created_at, 
          updated_at,
          reports (title, category)
        `)
        .eq('station', stationId)
        .is('assigned_officer_id', null) // Filter for unassigned cases
        .order('created_at', { ascending: false });

      if (casesError) {
        toast({
          title: "Error fetching cases",
          description: "Could not load unassigned cases for your station.",
          variant: "destructive",
        });
      }
      
      // 4. Fetch officers for the station
      const { data: officersData, error: officersError } = await supabase
        .from('users')
        .select('id, full_name, status')
        .eq('station_id', stationId)
        .eq('role', 'Officer'); // Ensure only officers are fetched

      if (officersError) {
        toast({
          title: "Error fetching officers",
          description: "Could not load officers for your station.",
          variant: "destructive",
        });
      }

      // 5. Count active cases for each officer
      const officersWithCaseCounts = await Promise.all(
        (officersData || []).map(async (officer) => {
          const { count, error: countError } = await supabase
            .from('cases')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_officer_id', officer.id)
            .not('status', 'in', '("Closed", "Rejected")'); // Active cases

          if (countError) {
            console.error(`Error fetching case count for officer ${officer.id}:`, countError);
          }
          return { ...officer, assignedCases: count || 0 };
        })
      );
      
      setStationData({
        station: stationDetails.name,
        unassignedCases: casesData || [],
        officers: officersWithCaseCounts || [],
      });
      
    } catch (error) {
      console.error("Error in fetchStationData:", error);
      toast({
        title: "Dashboard Error",
        description: "An unexpected error occurred while loading station data.",
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
    try {
      const { error } = await supabase
        .from('cases')
        .update({ 
          assigned_officer_id: officerId,
          status: 'Under Investigation' // Set initial status upon assignment
        })
        .eq('id', caseId);

      if (error) throw error;
      
      // Refresh data to reflect changes
      await fetchStationData();
      return true;
    } catch (error) {
      console.error("Error assigning case:", error);
      toast({
        title: "Assignment Failed",
        description: "Could not assign the case to the officer.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { stationData, loading, handleAssignCase, refreshStationData: fetchStationData };
}
