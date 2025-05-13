
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { JudiciaryStatus } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { useJudiciaryDashboardData } from "@/hooks/judiciary/useJudiciaryDashboardData";
import JudiciaryCaseCard from "@/components/judiciary/JudiciaryCaseCard";

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

  if (!user || user.role !== "Judiciary") {
    navigate("/login");
    return null;
  }
    
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <BackButton />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-kenya-black">Judiciary Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as JudiciaryStatus)} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="Pending Review">Pending Review</TabsTrigger>
            <TabsTrigger value="Accepted">Accepted Cases</TabsTrigger>
            <TabsTrigger value="Returned">Returned Cases</TabsTrigger>
          </TabsList>

          {["Pending Review", "Accepted", "Returned"].map(tabStatus => (
            <TabsContent key={tabStatus} value={tabStatus}>
              <Card>
                <CardHeader>
                  <CardTitle>{tabStatus} Cases</CardTitle>
                  <CardDescription>
                    Cases currently marked as {tabStatus.toLowerCase()}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading cases...</p>
                  ) : filteredCases.length === 0 ? (
                    <p>No cases to display in this category.</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredCases.map(caseItem => (
                        <JudiciaryCaseCard 
                          key={caseItem.id} 
                          caseItem={caseItem} 
                          onUpdateStatus={handleUpdateJudiciaryStatus} 
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default JudiciaryDashboard;
