
import { SupervisorDashboardProps } from "@/components/supervisor/types";
import SupervisorDashboardContent from "@/components/supervisor/SupervisorDashboardContent";
import { useStationData } from "@/hooks/supervisor/useStationData";
import { useAuth } from "@/hooks/useAuth";

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const { stationData, loading, handleAssignCase } = useStationData(user);

  return (
    <SupervisorDashboardContent 
      user={user} 
      stationData={stationData} 
      loading={loading}
      onAssignCase={handleAssignCase}
    />
  );
};

export default SupervisorDashboard;
