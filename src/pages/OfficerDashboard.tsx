
import OfficerDashboardComponent from "@/components/officer/OfficerDashboard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkStationAssignment = () => {
      const stationId = localStorage.getItem('selected_station_id');
      
      if (!stationId) {
        console.warn("No station ID found for officer");
        toast({
          title: "Station Not Selected",
          description: "Please log in again and select your station to view assigned cases and reports.",
          variant: "destructive",
        });
        
        // You could redirect to a station selection page here if you had one
        // For now, we'll just warn the user
      }
    };
    
    checkStationAssignment();
  }, [navigate, toast]);
  
  return <OfficerDashboardComponent />;
};

export default OfficerDashboard;
