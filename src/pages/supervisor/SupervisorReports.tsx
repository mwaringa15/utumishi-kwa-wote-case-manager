
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorReportsPage from "@/components/supervisor/pages/SupervisorReportsPage";

const SupervisorReports = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new route path
    navigate('/supervisor-dashboard/reports', { replace: true });
  }, [navigate]);
  
  // Return the component directly in case the redirect doesn't happen immediately
  return <SupervisorReportsPage />;
};

export default SupervisorReports;
