
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { BackButton } from "@/components/ui/back-button";
import { useJudiciaryDashboardData } from "@/hooks/judiciary/useJudiciaryDashboardData";
import JudiciaryDashboardHeader from "@/components/judiciary/JudiciaryDashboardHeader";
import JudiciaryCaseTabs from "@/components/judiciary/JudiciaryCaseTabs";
import { JudiciaryStatus } from "@/types"; // Keep JudiciaryStatus if needed for casting activeTab

const JudiciaryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isLoading,
    activeTab,
    setActiveTab,
    handleUpdateJudiciaryStatus,
    filteredCases,
  } = useJudiciaryDashboardData();

  if (!user || user.role !== "judiciary") {
    navigate("/login");
    return null;
  }
    
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <BackButton />
        <JudiciaryDashboardHeader userName={user?.name} />
        <JudiciaryCaseTabs
          activeTab={activeTab}
          // Cast to JudiciaryStatus explicitly if setActiveTab expects it and onValueChange provides string
          setActiveTab={(value) => setActiveTab(value as JudiciaryStatus)} 
          isLoading={isLoading}
          filteredCases={filteredCases}
          onUpdateStatus={handleUpdateJudiciaryStatus}
        />
      </div>
      <Footer />
    </div>
  );
};

export default JudiciaryDashboard;
