
import { useState, useEffect } from "react";
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
}

export function useFetchStationData(userId: string | undefined): StationDataResult {
  const { toast } = useToast();
  const [stationId, setStationId] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string>("");
  const [officerProfiles, setOfficerProfiles] = useState<OfficerProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supervisorProfile, setSupervisorProfile] = useState<{ name: string, email: string, station: string } | null>(null);
  const [availableOfficers, setAvailableOfficers] = useState<User[]>([]);

  // Get supervisor's station ID from localStorage or fetch it
  useEffect(() => {
    const getStationId = async () => {
      setIsLoading(true);
      
      try {
        console.log("Initial station ID check:", { 
          userId, 
          storedStationId: localStorage.getItem('selected_station_id') 
        });
        
        let effectiveStationId = localStorage.getItem('selected_station_id');
        
        if (!effectiveStationId && userId) {
          // Fetch from user profile
          const { data: userData, error } = await supabase
            .from('users')
            .select('station_id')
            .eq('id', userId)
            .single();
            
          if (error) throw error;
          
          if (userData?.station_id) {
            effectiveStationId = userData.station_id;
            localStorage.setItem('selected_station_id', userData.station_id);
          }
        }
        
        console.log("Effective station ID:", effectiveStationId);
        setStationId(effectiveStationId);
        
        // Get supervisor profile information
        if (userId) {
          const { data: supervisorData, error: supervisorError } = await supabase
            .from('users')
            .select('full_name, email, station_id')
            .eq('id', userId)
            .single();
            
          if (supervisorError) throw supervisorError;
          
          // Get station name
          if (supervisorData?.station_id) {
            const { data: stationData, error: stationError } = await supabase
              .from('stations')
              .select('name')
              .eq('id', supervisorData.station_id)
              .single();
              
            if (stationError) throw stationError;
            
            if (stationData) {
              console.log("Station name found:", stationData.name);
              setStationName(stationData.name);
              setSupervisorProfile({
                name: supervisorData.full_name || userId,
                email: supervisorData.email || userId,
                station: stationData.name
              });
            }
          }
        }
      } catch (error) {
        console.error("Error getting station ID:", error);
        toast({
          title: "Error",
          description: "Failed to get station information",
          variant: "destructive",
        });
      }
    };
    
    if (userId) {
      getStationId();
    }
  }, [userId, toast]);

  // Fetch officer profiles once we have the station ID
  useEffect(() => {
    const fetchOfficers = async () => {
      if (!stationId) return;
      
      setIsLoading(true);
      try {
        const profiles = await fetchStationOfficersProfiles(stationId);
        setOfficerProfiles(profiles);
        
        // Fetch available officers with the same station ID
        const { data: availableOfficersData, error: availableOfficersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status')
          .eq('station_id', stationId)
          .eq('role', 'officer');
          
        if (availableOfficersError) throw availableOfficersError;
        
        if (availableOfficersData) {
          // Correctly convert the data to match User type with proper type casting for status
          const formattedAvailableOfficers: User[] = availableOfficersData.map(officer => ({
            id: officer.id || '',
            name: officer.full_name || officer.email,
            email: officer.email,
            role: officer.role as UserRole,
            status: (officer.status || 'on_duty') as OfficerStatus, // Cast to OfficerStatus type
            station: stationName
          }));
          setAvailableOfficers(formattedAvailableOfficers);
        }
      } catch (error) {
        console.error("Error fetching officer profiles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch officer profiles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOfficers();
  }, [stationId, stationName, toast]);

  return {
    stationId,
    stationName,
    supervisorProfile,
    availableOfficers,
    officerProfiles,
    isLoading
  };
}
