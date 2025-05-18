
import OfficerDashboardComponent from "@/components/officer/OfficerDashboard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserStationId } from "@/hooks/supervisor/modules/getUserStationId";

const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stationName, setStationName] = useState<string>("");
  
  useEffect(() => {
    const fetchStationDetails = async () => {
      if (!user?.id) return;
      
      try {
        // Use the refactored getUserStationId function
        const { stationId, stationName: fetchedStationName } = await getUserStationId(user.id);
        
        if (!stationId) {
          console.warn("No station ID found for officer");
          toast({
            title: "Station Not Selected",
            description: "Please log in again and select your station to view assigned cases and reports.",
            variant: "destructive",
          });
          return;
        }
        
        if (fetchedStationName) {
          setStationName(fetchedStationName);
          toast({
            title: "Station Assignment",
            description: `You are assigned to ${fetchedStationName} station`,
          });
        } else {
          // Fallback to fetching station name directly if needed
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
        }
      } catch (error) {
        console.error("Error in fetchStationDetails:", error);
      }
    };
    
    fetchStationDetails();
  }, [user, toast]);
  
  return <OfficerDashboardComponent stationName={stationName} />;
};

export default OfficerDashboard;
