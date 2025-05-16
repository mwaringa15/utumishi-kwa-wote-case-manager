
import { useState, useEffect } from "react";
import { User, UserRole, OfficerStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchStationDetails } from "@/hooks/supervisor/stationUtils/fetchStationDetails";

export function useSupervisorOfficers(userId?: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [officers, setOfficers] = useState<User[]>([]);
  const [stationName, setStationName] = useState<string>("");
  
  useEffect(() => {
    if (!userId) return;
    
    const fetchOfficersData = async () => {
      setIsLoading(true);
      try {
        // Fetch the supervisor's station details
        const stationDetails = await fetchStationDetails({ 
          supabase, 
          userId, 
          toast 
        });

        if (!stationDetails) {
          toast({
            title: "Station not found",
            description: "You are not assigned to any station",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        setStationName(stationDetails.stationName);

        // Get officers for this station
        const { data: officersData, error: officersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status, station_id')
          .eq('station_id', stationDetails.stationId)
          .eq('role', 'Officer');

        if (officersError) throw officersError;

        // Count assigned cases for each officer
        const officerCaseCounts: Record<string, number> = {};
        
        for (const officer of officersData) {
          const { count, error } = await supabase
            .from('cases')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_officer_id', officer.id)
            .not('status', 'eq', 'Completed'); // Only count active cases
            
          if (!error) {
            officerCaseCounts[officer.id] = count || 0;
          }
        }

        // Format officers data
        const formattedOfficers: User[] = officersData.map(officer => ({
          id: officer.id,
          name: officer.full_name || officer.email.split('@')[0],
          email: officer.email,
          role: "Officer" as UserRole,
          station: stationDetails.stationName,
          status: (officer.status || 'on_duty') as OfficerStatus,
          badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`, // Example badge number
          assignedCases: officerCaseCounts[officer.id] || 0
        }));

        setOfficers(formattedOfficers);
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
    };

    fetchOfficersData();
  }, [userId, toast]);

  return {
    isLoading,
    officers,
    stationName
  };
}
