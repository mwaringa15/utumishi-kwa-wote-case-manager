
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
import { useState, useEffect } from "react";
import { OfficerStats } from "@/types";
import { CrimeStatisticsChart } from "@/components/supervisor/CrimeStatisticsChart";
import { CaseCompletionChart } from "@/components/supervisor/CaseCompletionChart";
import { supabase } from "@/integrations/supabase/client";

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
  const [crimeStats, setCrimeStats] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [caseCompletionStats, setCaseCompletionStats] = useState<Array<any>>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

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

  // Fetch crime statistics for the supervisor's station
  useEffect(() => {
    if (!stationData?.station) return;
    
    const fetchCrimeStats = async () => {
      setIsStatsLoading(true);
      try {
        // Get distribution of crime types for this station
        const { data: crimeData, error: crimeError } = await supabase
          .from('reports')
          .select('category, count')
          .eq('station_id', stationData.station)
          .not('category', 'is', null);
          
        if (crimeError) throw crimeError;
        
        // Get case completion statistics by month
        const { data: caseData, error: caseError } = await supabase
          .from('cases')
          .select('status, created_at')
          .eq('station', stationData.station);
          
        if (caseError) throw caseError;
        
        // Process crime type data
        const colors = [
          "#3b82f6", "#ef4444", "#10b981", "#f97316", 
          "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6",
          "#f59e0b", "#84cc16", "#06b6d4", "#d946ef"
        ];
        
        // Count crime types manually
        const crimeTypeCounts: Record<string, number> = {};
        crimeData.forEach(item => {
          const category = item.category || "Unknown";
          crimeTypeCounts[category] = (crimeTypeCounts[category] || 0) + 1;
        });
        
        const formattedCrimeStats = Object.entries(crimeTypeCounts).map(([category, count], index) => ({
          name: category,
          value: count,
          color: colors[index % colors.length]
        }));
        
        setCrimeStats(formattedCrimeStats);
        
        // Process case completion data
        // Group by month and status
        const casesByMonth: Record<string, { completed: number; inProgress: number; pending: number }> = {};
        
        caseData.forEach(item => {
          const date = new Date(item.created_at);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          
          if (!casesByMonth[monthYear]) {
            casesByMonth[monthYear] = { completed: 0, inProgress: 0, pending: 0 };
          }
          
          if (item.status === "Closed" || item.status === "Submitted to Judiciary") {
            casesByMonth[monthYear].completed += 1;
          } else if (item.status === "Under Investigation") {
            casesByMonth[monthYear].inProgress += 1;
          } else {
            casesByMonth[monthYear].pending += 1;
          }
        });
        
        const formattedCaseStats = Object.entries(casesByMonth).map(([month, stats]) => ({
          name: month,
          completed: stats.completed,
          inProgress: stats.inProgress,
          pending: stats.pending
        }));
        
        setCaseCompletionStats(formattedCaseStats);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        toast({
          title: "Error loading statistics",
          description: "Could not load station statistics",
          variant: "destructive"
        });
      } finally {
        setIsStatsLoading(false);
      }
    };
    
    fetchCrimeStats();
  }, [stationData?.station, toast]);

  // Check if the user is a supervisor
  const isCommanderOrAdmin = user?.role === "supervisor";
  
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
        
        {/* Station-specific charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CrimeStatisticsChart 
            data={crimeStats} 
            isLoading={isStatsLoading} 
            title="Crime Types in Your Station"
            description="Distribution of crime reports by category"
          />
          <CaseCompletionChart 
            data={caseCompletionStats}
            isLoading={isStatsLoading}
            title="Case Status by Month" 
            description="Overview of case completion rates"
          />
        </div>
        
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
