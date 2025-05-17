
import { useState, useEffect } from "react";
import { User, UserRole, OfficerStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useSupervisorOfficers(userId?: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [officers, setOfficers] = useState<User[]>([]);
  const [stationName, setStationName] = useState<string>("");
  const [stationId, setStationId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    const fetchOfficersData = async () => {
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
            .select('station_id, role')
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
          
          if (!userData.station_id && userData.role.toLowerCase() !== 'administrator') {
            toast({
              title: "No Station Assigned",
              description: "You are not assigned to any station. Please contact an administrator.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          
          // Use the station ID from user profile if available
          effectiveStationId = userData.station_id;
        }
        
        if (effectiveStationId) {
          // Store it for future use
          localStorage.setItem('selected_station_id', effectiveStationId);
          setStationId(effectiveStationId);
          
          // Get station name
          const { data: stationData, error: stationError } = await supabase
            .from('stations')
            .select('name')
            .eq('id', effectiveStationId)
            .single();
            
          if (stationError) {
            console.error("Error fetching station name:", stationError);
            stationNameToSet = "Unknown Station";
          } else {
            stationNameToSet = stationData.name;
          }
          
          setStationName(stationNameToSet);
          
          // Get officers for this station
          const { data: officersData, error: officersError } = await supabase
            .from('users')
            .select('id, full_name, email, role, status, station_id')
            .eq('station_id', effectiveStationId)
            .eq('role', 'officer');

          if (officersError) {
            console.error("Error fetching officers:", officersError);
            toast({
              title: "Error Loading Officers",
              description: "Could not load officers for this station.",
              variant: "destructive",
            });
            setOfficers([]);
            setIsLoading(false);
            return;
          }
          
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
            role: "officer" as UserRole,
            station: stationNameToSet,
            status: (officer.status || 'on_duty') as OfficerStatus,
            badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
            assignedCases: officerCaseCounts[officer.id] || 0
          }));

          setOfficers(formattedOfficers);
        } else {
          // Handle admin case or missing station
          setStationName("All Stations");
          
          // For administrators, fetch all officers
          const { data: officersData, error: officersError } = await supabase
            .from('users')
            .select('id, full_name, email, role, status, station_id')
            .eq('role', 'officer');

          if (officersError) {
            console.error("Error fetching all officers:", officersError);
            setOfficers([]);
            setIsLoading(false);
            return;
          }
          
          // Get station names for all officers
          const stationIds = [...new Set(officersData.map(officer => officer.station_id))].filter(Boolean);
          const stationNames: Record<string, string> = {};
          
          for (const stationId of stationIds) {
            const { data, error } = await supabase
              .from('stations')
              .select('id, name')
              .eq('id', stationId)
              .single();
              
            if (!error && data) {
              stationNames[stationId] = data.name;
            }
          }
          
          // Count assigned cases for each officer
          const officerCaseCounts: Record<string, number> = {};
          
          for (const officer of officersData) {
            const { count, error } = await supabase
              .from('cases')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_officer_id', officer.id)
              .not('status', 'eq', 'Completed');
              
            if (!error) {
              officerCaseCounts[officer.id] = count || 0;
            }
          }

          // Format officers data
          const formattedOfficers: User[] = officersData.map(officer => ({
            id: officer.id,
            name: officer.full_name || officer.email.split('@')[0],
            email: officer.email,
            role: "officer" as UserRole,
            station: officer.station_id ? stationNames[officer.station_id] || "Unknown Station" : "Unassigned",
            status: (officer.status || 'on_duty') as OfficerStatus,
            badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
            assignedCases: officerCaseCounts[officer.id] || 0
          }));

          setOfficers(formattedOfficers);
        }
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
    stationName,
    stationId
  };
}
