
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, withAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CasesTab } from "@/components/dashboard/CasesTab";
import { ReportsTab } from "@/components/dashboard/ReportsTab";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { myReports, myCases, isLoading } = useDashboardData();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Button 
          variant="ghost" 
          className="mb-4 px-2" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <DashboardHeader userName={user?.name} />
        
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="cases">My Cases</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cases">
            <CasesTab cases={myCases} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="reports">
            <ReportsTab reports={myReports} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

// Export with auth wrapper to protect this route
export default withAuth(Dashboard);
