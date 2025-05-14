import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SupervisorDashboardContent from "@/components/supervisor/SupervisorDashboardContent";
import { useStationData } from "@/hooks/supervisor/useStationData";

const SupervisorDashboardWrapper = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stationData, loading, handleAssignCase } = useStationData(user);

  // If user is not logged in, redirect to login page
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="flex-grow flex">
        <SupervisorDashboardContent 
          user={user}
          stationData={stationData}
          loading={loading}
          onAssignCase={handleAssignCase}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorDashboardWrapper;
