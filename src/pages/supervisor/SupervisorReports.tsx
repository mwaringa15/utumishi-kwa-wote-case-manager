
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorReportsPage from "@/components/supervisor/pages/SupervisorReportsPage";

const SupervisorReports = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have a stored station ID
    const stationId = localStorage.getItem('selected_station_id');
    if (!stationId) {
      // If no station is selected, show a message suggesting to select one
      console.log("No station selected, but continuing to show the reports page");
    }
    
    // Redirect to the new route path
    navigate('/supervisor-dashboard/reports', { replace: true });
  }, [navigate]);
  
  // Return the component directly in case the redirect doesn't happen immediately
  return <SupervisorReportsPage />;
};

export default SupervisorReports;
