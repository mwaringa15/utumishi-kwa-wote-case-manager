import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { StationData, StationCase, StationOfficer } from "@/components/supervisor/types";
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
        .select('id, name') // Fetch ID as well for consistency if needed
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
          report_id,
          status,
          station, 
          reports (
            id, 
            title, 
            description, 
            status, 
            created_at, 
            location, 
            category
          )
        `)
        .eq('station', stationId)
        .is('assigned_officer_id', null) 
        .order('created_at', { ascending: false });

      if (casesError) {
        toast({
          title: "Error fetching cases",
          description: "Could not load unassigned cases for your station.",
          variant: "destructive",
        });
      }
      
      const formattedUnassignedCases: StationCase[] = (casesData || []).map((c: any) => ({
        id: c.id,
        report_id: c.report_id,
        status: c.status,
        priority: c.priority,
        created_at: c.created_at,
        updated_at: c.updated_at,
        station: stationDetails.name, // Use fetched station name
        reports: c.reports ? {
            id: c.reports.id,
            title: c.reports.title,
            description: c.reports.description,
            status: c.reports.status,
            created_at: c.reports.created_at,
            location: c.reports.location,
            category: c.reports.category,
        } : { // Provide a default empty report object if c.reports is null/undefined
            id: '', title: 'N/A', description: '', status: '', created_at: '',
        },
      }));
      
      // 4. Fetch officers for the station
      const { data: officersData, error: officersError } = await supabase
        .from('users')
        .select('id, full_name, email, role, status, badge_number') // Added email, role, badge_number
        .eq('station_id', stationId)
        .eq('role', 'Officer'); 

      if (officersError) {
        toast({
          title: "Error fetching officers",
          description: "Could not load officers for your station.",
          variant: "destructive",
        });
      }

      // 5. Count active cases for each officer
      const officersWithCaseCountsPromises = (officersData || []).map(async (officer) => {
        const { count, error: countError } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_officer_id', officer.id)
          .not('status', 'in', '("Closed", "Rejected")'); 

        if (countError) {
          console.error(`Error fetching case count for officer ${officer.id}:`, countError);
        }
        return { 
          ...officer, 
          assignedCases: count || 0 
        };
      });
      const resolvedOfficersWithCounts = await Promise.all(officersWithCaseCountsPromises);

      const formattedOfficers: StationOfficer[] = resolvedOfficersWithCounts.map(o => ({
        id: o.id,
        name: o.full_name || 'N/A',
        email: o.email || 'N/A',
        role: o.role || 'Officer', // Role should be 'Officer' based on query
        station: stationDetails.name, // Use fetched station name
        status: o.status || 'unknown',
        badgeNumber: o.badge_number,
        assignedCases: o.assignedCases,
      }));
      
      setStationData({
        station: stationDetails.name,
        stationId: stationId, // Add stationId to StationData
        unassignedCases: formattedUnassignedCases,
        officers: formattedOfficers,
        pendingReports: [] // If StationData requires this, initialize appropriately
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
          status: 'Under Investigation' 
        })
        .eq('id', caseId);

      if (error) throw error;
      
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
