
import OfficerDashboardComponent from "@/components/officer/OfficerDashboard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stationName, setStationName] = useState<string>("");
  
  useEffect(() => {
    const fetchStationDetails = async () => {
      const stationId = localStorage.getItem('selected_station_id');
      
      if (!stationId) {
        console.warn("No station ID found for officer");
        toast({
          title: "Station Not Selected",
          description: "Please log in again and select your station to view assigned cases and reports.",
          variant: "destructive",
        });
        return;
      }
      
      // Fetch station name from the stations table
      try {
        const { data, error } = await supabase
          .from('stations')
          .select('name')
          .eq('id', stationId)
          .single();
          
        if (error) {
          console.error("Error fetching station details:", error);
          return;
        }
        
        if (data) {
          setStationName(data.name);
          toast({
            title: "Station Assignment",
            description: `You are assigned to ${data.name} station`,
          });
        }
      } catch (error) {
        console.error("Error in fetchStationDetails:", error);
      }
    };
    
    fetchStationDetails();
  }, [navigate, toast]);
  
  return <OfficerDashboardComponent stationName={stationName} />;
};

export default OfficerDashboard;
