
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { SupervisorDashboardHeader } from "@/components/supervisor/SupervisorDashboardHeader";
import { StatsOverview } from "@/components/supervisor/StatsOverview";
import { SearchAndFilters } from "@/components/supervisor/SearchAndFilters";
import { CasesTab } from "@/components/supervisor/CasesTab";
import { PendingReportsTab } from "@/components/supervisor/PendingReportsTab";
import { OfficersTab } from "@/components/supervisor/OfficersTab";
import { useSupervisorData } from "@/hooks/supervisor/useSupervisorData";

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const { 
    filteredCases,
    pendingReports,
    officers,
    isLoading,
    stats,
    searchTerm,
    sortField,
    sortDirection,
    setSearchTerm,
    toggleSort,
    setSortDirection,
    handleAssignCase,
    handleCreateCase,
    handleSubmitToJudiciary
  } = useSupervisorData(user);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <SupervisorDashboardHeader user={user} />
        <StatsOverview stats={stats} />
        
        <SearchAndFilters
          searchTerm={searchTerm}
          sortField={sortField}
          sortDirection={sortDirection}
          setSearchTerm={setSearchTerm}
          toggleSort={toggleSort}
          setSortDirection={setSortDirection}
        />
        
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="cases">All Cases</TabsTrigger>
            <TabsTrigger value="pending">Pending Reports</TabsTrigger>
            <TabsTrigger value="officers">Officers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cases">
            <CasesTab 
              filteredCases={filteredCases}
              officers={officers}
              isLoading={isLoading}
              handleAssignCase={handleAssignCase}
              handleSubmitToJudiciary={handleSubmitToJudiciary}
            />
          </TabsContent>
          
          <TabsContent value="pending">
            <PendingReportsTab 
              pendingReports={pendingReports}
              officers={officers}
              isLoading={isLoading}
              handleCreateCase={handleCreateCase}
            />
          </TabsContent>
          
          <TabsContent value="officers">
            <OfficersTab 
              officers={officers}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorDashboard;
