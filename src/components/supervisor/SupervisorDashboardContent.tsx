import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import { StationUnassignedCases } from "@/components/supervisor/StationUnassignedCases";
import { StationOfficers } from "@/components/supervisor/StationOfficers";
import { SupervisorDashboardProps } from "@/components/supervisor/types";
import { SupervisorStats } from "@/hooks/supervisor/types";
import { StationAnalytics } from "@/components/supervisor/StationAnalytics";
import { SupervisorTabs } from "@/components/supervisor/SupervisorTabs";
import { useState } from "react";
import { OfficerStats } from "@/types"; // For mapping if needed"

interface SupervisorDashboardContentProps extends SupervisorDashboardProps {
  onAssignCase: (caseId: string, officerId: string) => Promise<boolean>;
}

const SupervisorDashboardContent = ({ 
  user, 
  stationData, 
  loading: stationLoading, 
  onAssignCase 
}: SupervisorDashboardContentProps) => {
  const { toast } = useToast();
  const supervisorHookData = useSupervisorData(user); 

  const { 
    cases, 
    pendingReports,
    officers,
    isLoading: supervisorIsLoading, 
    stats: supervisorStatsData, 
    searchTerm,
    sortField,
    sortDirection,
    setSearchTerm,
    toggleSort,
    setSortDirection,
    handleAssignCase,
    handleCreateCase,
    handleSubmitToJudiciary
  } = supervisorHookData;

  // Check if the user is a Commander, Administrator, or OCS to show analytics
  const isCommanderOrAdmin = user?.role === "Commander" || 
                             user?.role === "Administrator" || 
                             user?.role === "OCS";
  
  // Mock regional data for demonstration
  const regionalData = [
    { region: "Central", solved: 45, pending: 18, total: 63 },
    { region: "Eastern", solved: 32, pending: 24, total: 56 },
    { region: "Western", solved: 28, pending: 12, total: 40 },
    { region: "Northern", solved: 21, pending: 15, total: 36 },
    { region: "Southern", solved: 38, pending: 20, total: 58 },
  ];

  // The stats from useSupervisorData are SupervisorStats, so it should be directly usable
  const overviewStats: SupervisorStats = supervisorStatsData;

  return (
    <SidebarProvider>
      <SupervisorSidebar />
      <SidebarInset className="p-6">
        <SupervisorDashboardHeader user={user} station={stationData?.station} />
        <StatsOverview stats={overviewStats} /> 
        
        {/* Station-specific sections */}
        {stationData && (
          <>
            <StationUnassignedCases 
              station={stationData.station}
              unassignedCases={stationData.unassignedCases}
              officers={stationData.officers}
              loading={stationLoading}
              onAssign={onAssignCase}
            />
            
            <StationOfficers
              station={stationData.station}
              officers={stationData.officers}
              loading={stationLoading}
            />
          </>
        )}
        
        {/* Show analytics for Commander/Admin users */}
        {isCommanderOrAdmin && (
          <StationAnalytics 
            regionalData={regionalData} 
            officers={officers} 
            isLoading={supervisorIsLoading} 
          />
        )}
        
        <SupervisorTabs 
          searchTerm={searchTerm}
          sortField={sortField}
          sortDirection={sortDirection}
          setSearchTerm={setSearchTerm}
          toggleSort={toggleSort}
          setSortDirection={setSortDirection}
          filteredCases={cases} 
          pendingReports={pendingReports}
          officers={officers}
          isLoading={supervisorIsLoading}
          handleAssignCase={handleAssignCase}
          handleCreateCase={handleCreateCase}
          handleSubmitToJudiciary={handleSubmitToJudiciary}
        />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SupervisorDashboardContent;
