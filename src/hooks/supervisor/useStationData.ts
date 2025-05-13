
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { StationCase, StationOfficer, StationData } from "@/components/supervisor/types";

export function useStationData(user: User | null) {
  const { toast } = useToast();
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStationData = async () => {
      setLoading(true);
      try {
        // 1. Get the user's station_id from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('station_id')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        
        const stationId = userData?.station_id;
        if (!stationId) {
          toast({
            title: "Station not found",
            description: "You are not assigned to any station",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // 2. Get the station name
        const { data: stationData, error: stationError } = await supabase
          .from('stations')
          .select('name')
          .eq('id', stationId)
          .single();

        if (stationError) throw stationError;

        // 3. Get all officers in this station
        const { data: officersData, error: officersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status')
          .eq('station_id', stationId)
          .eq('role', 'Officer');

        if (officersError) throw officersError;

        // 4. Get all pending reports for this station
        const { data: pendingReports, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .eq('station_id', stationId)
          .eq('status', 'Pending');

        if (reportsError) throw reportsError;

        // 5. Get all unassigned cases for this station
        const { data: unassignedCases, error: casesError } = await supabase
          .from('cases')
          .select(`
            id,
            report_id,
            status,
            priority,
            created_at,
            updated_at,
            station,
            reports:report_id (
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
          .is('assigned_officer_id', null);

        if (casesError) throw casesError;

        // Transform data to match the expected format
        const formattedOfficers: StationOfficer[] = officersData.map(officer => ({
          id: officer.id,
          name: officer.full_name || officer.email.split('@')[0],
          email: officer.email,
          role: officer.role,
          station: stationData.name,
          status: officer.status || 'on_duty',
          badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
          assignedCases: 0 // We'll set this later once we implement case counting
        }));

        // Set station data
        setStationData({
          station: stationData.name,
          stationId: stationId,
          unassignedCases: unassignedCases as StationCase[],
          officers: formattedOfficers,
          pendingReports: pendingReports
        });
      } catch (error) {
        console.error("Error fetching station data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load station data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStationData();
  }, [user, toast]);

  // Handle case assignment
  const handleAssignCase = async (caseId: string, officerId: string) => {
    try {
      // Update the case in the database
      const { error } = await supabase
        .from('cases')
        .update({ 
          assigned_officer_id: officerId,
          status: 'In Progress', 
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;

      // Update the local state
      if (stationData) {
        const updatedCases = stationData.unassignedCases.filter(c => c.id !== caseId);
        setStationData({
          ...stationData,
          unassignedCases: updatedCases
        });
      }

      // Show success toast
      toast({
        title: "Case assigned",
        description: "The case has been successfully assigned to the officer",
      });

      return true;
    } catch (error) {
      console.error("Error assigning case:", error);
      toast({
        title: "Error assigning case",
        description: "Failed to assign the case to the officer",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    stationData,
    loading,
    handleAssignCase
  };
}
