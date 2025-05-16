
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorReportsPage from "@/components/supervisor/pages/SupervisorReportsPage";

const SupervisorReports = () => {
  const navigate = useNavigate();
  
  return <SupervisorReportsPage />;
};

export default SupervisorReports;
