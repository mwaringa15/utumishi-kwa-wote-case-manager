
import { useState, useEffect, useCallback } from "react";
import { User, OfficerStatus, UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OfficerProfile } from "@/components/officer/profile/ProfileContainer";
import { fetchStationOfficersProfiles } from "@/hooks/supervisor/modules/fetchStationOfficersProfiles";

interface StationDataResult {
  stationId: string | null;
  stationName: string;
  supervisorProfile: { name: string; email: string; station: string } | null;
  availableOfficers: User[];
  officerProfiles: OfficerProfile[];
  isLoading: boolean;
  refreshStationData: () => Promise<void>;
}

export function useFetchStationData(userId: string | undefined): StationDataResult {
  const { toast } = useToast();
  const [stationId, setStationId] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string>("");
  const [officerProfiles, setOfficerProfiles] = useState<OfficerProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supervisorProfile, setSupervisorProfile] = useState<{ name: string, email: string, station: string } | null>(null);
  const [availableOfficers, setAvailableOfficers] = useState<User[]>([]);

  // Function to fetch all officers with the same station ID
  const fetchStationOfficers = useCallback(async (stationId: string | null) => {
    if (!stationId) return [];
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, status')
        .eq('role', 'officer');
        
      if (error) throw error;
      
      if (data) {
        // Format the officer data to match the User type
        return data.map(officer => ({
          id: officer.id || '',
          name: officer.full_name || officer.email,
          email: officer.email,
          role: officer.role as UserRole,
          status: (officer.status || 'on_duty') as OfficerStatus,
          station: stationName
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching officers:", error);
      return [];
    }
  }, [stationName]);

  // Fetch all data related to the station
  const fetchAllStationData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      let effectiveStationId = localStorage.getItem('selected_station_id');
      
      if (!effectiveStationId) {
        // Fetch from user profile
        const { data: userData, error } = await supabase
          .from('users')
          .select('station_id, full_name, email')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        if (userData?.station_id) {
          effectiveStationId = userData.station_id;
          localStorage.setItem('selected_station_id', userData.station_id);
        }
        
        // Get station name
        if (effectiveStationId) {
          const { data: stationData, error: stationError } = await supabase
            .from('stations')
            .select('name')
            .eq('id', effectiveStationId)
            .single();
            
          if (stationError) throw stationError;
          
          if (stationData) {
            setStationName(stationData.name);
            setSupervisorProfile({
              name: userData.full_name || userId,
              email: userData.email || userId,
              station: stationData.name
            });
          }
        }
      }
      
      setStationId(effectiveStationId);
      
      // Fetch officer profiles and available officers
      if (effectiveStationId) {
        const profiles = await fetchStationOfficersProfiles(effectiveStationId);
        setOfficerProfiles(profiles);
        
        const allOfficers = await fetchStationOfficers(effectiveStationId);
        setAvailableOfficers(allOfficers);
      }
    } catch (error: any) {
      console.error("Error fetching station data:", error);
      toast({
        title: "Error",
        description: "Failed to load station data: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast, fetchStationOfficers]);
  
  // Initial data fetch
  useEffect(() => {
    fetchAllStationData();
  }, [fetchAllStationData]);

  return {
    stationId,
    stationName,
    supervisorProfile,
    availableOfficers,
    officerProfiles,
    isLoading,
    refreshStationData: fetchAllStationData
  };
}
