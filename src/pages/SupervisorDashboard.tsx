
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
import { RegionalStats } from "@/components/supervisor/RegionalStats";
import { OfficerPerformance } from "@/components/supervisor/OfficerPerformance";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

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

  // Mock regional data for demonstration
  const regionalData = [
    { region: "Central", solved: 45, pending: 18, total: 63 },
    { region: "Eastern", solved: 32, pending: 24, total: 56 },
    { region: "Western", solved: 28, pending: 12, total: 40 },
    { region: "Northern", solved: 21, pending: 15, total: 36 },
    { region: "Southern", solved: 38, pending: 20, total: 58 },
  ];

  // Check if the user is a Commander, Administrator, or OCS to show analytics
  const isCommanderOrAdmin = user?.role === "Commander" || 
                            user?.role === "Administrator" || 
                            user?.role === "OCS";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="flex-grow flex">
        <SidebarProvider>
          <SupervisorSidebar />
          <SidebarInset className="p-6">
            <SupervisorDashboardHeader user={user} />
            <StatsOverview stats={stats} />
            
            {/* Show analytics for Commander/Admin users */}
            {isCommanderOrAdmin && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RegionalStats data={regionalData} isLoading={isLoading} />
                <OfficerPerformance officers={officers} isLoading={isLoading} />
              </div>
            )}
            
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
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorDashboard;
