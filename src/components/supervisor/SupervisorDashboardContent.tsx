
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
import { useToast } from "@/components/ui/use-toast";
import { StationUnassignedCases } from "@/components/supervisor/StationUnassignedCases";
import { StationOfficers } from "@/components/supervisor/StationOfficers";
import { SupervisorDashboardProps } from "@/components/supervisor/types";
import { StationAnalytics } from "@/components/supervisor/StationAnalytics";
import { SupervisorTabs } from "@/components/supervisor/SupervisorTabs";
import { useState } from "react";

const SupervisorDashboardContent = ({ user, stationData, loading }: SupervisorDashboardProps) => {
  const { toast } = useToast();
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

  // Handle case assignment specifically for station cases
  const handleStationCaseAssignment = async (caseId: string, officerId: string, officerName: string) => {
    try {
      // Show success toast
      toast({
        title: "Case assigned",
        description: `Case successfully assigned to Officer ${officerName}`,
      });
      
      // In production, we would update the API
      // For now, update the local state to simulate a successful assignment
      if (stationData) {
        const updatedCases = stationData.unassignedCases.filter(c => c.id !== caseId);
        stationData.unassignedCases = updatedCases;
      }
    } catch (error) {
      console.error("Error assigning case:", error);
      toast({
        title: "Error assigning case",
        description: "Failed to assign the case to the officer",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <SupervisorSidebar />
      <SidebarInset className="p-6">
        <SupervisorDashboardHeader user={user} station={stationData?.station} />
        <StatsOverview stats={stats} />
        
        {/* Station-specific sections */}
        {stationData && (
          <>
            <StationUnassignedCases 
              station={stationData.station}
              unassignedCases={stationData.unassignedCases}
              officers={stationData.officers}
              loading={loading}
              onAssign={handleStationCaseAssignment}
            />
            
            <StationOfficers
              station={stationData.station}
              officers={stationData.officers}
              loading={loading}
            />
          </>
        )}
        
        {/* Show analytics for Commander/Admin users */}
        {isCommanderOrAdmin && (
          <StationAnalytics 
            regionalData={regionalData} 
            officers={officers} 
            isLoading={isLoading} 
          />
        )}
        
        <SupervisorTabs 
          searchTerm={searchTerm}
          sortField={sortField}
          sortDirection={sortDirection}
          setSearchTerm={setSearchTerm}
          toggleSort={toggleSort}
          setSortDirection={setSortDirection}
          filteredCases={filteredCases}
          pendingReports={pendingReports}
          officers={officers}
          isLoading={isLoading}
          handleAssignCase={handleAssignCase}
          handleCreateCase={handleCreateCase}
          handleSubmitToJudiciary={handleSubmitToJudiciary}
        />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SupervisorDashboardContent;
