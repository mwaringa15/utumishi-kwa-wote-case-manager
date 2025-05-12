
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Case, User, CaseProgress, CaseStatus, OfficerStatus } from "@/types";

// Define a type for station-specific officer data
interface StationOfficer extends User {
  status: OfficerStatus;
}

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [station, setStation] = useState<string | null>(null);
  const [unassignedCases, setUnassignedCases] = useState<Case[]>([]);
  const [stationOfficers, setStationOfficers] = useState<StationOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  
  // Fetch supervisor's station and station-specific data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchSupervisorData = async () => {
      setLoading(true);
      try {
        // Get supervisor's station
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('station, full_name')
          .eq('id', user.id)
          .single();
        
        if (userError) throw userError;
        
        if (userData && userData.station) {
          setStation(userData.station);
          
          // Get unassigned cases for this station
          const { data: unassignedCasesData, error: casesError } = await supabase
            .from('cases')
            .select(`
              id,
              status,
              priority,
              created_at,
              updated_at,
              report_id,
              station,
              reports (
                id,
                title,
                description,
                status,
                created_at,
                location,
                category
              )
            `)
            .eq('station', userData.station)
            .is('assigned_officer_id', null)
            .order('created_at', { ascending: false });
          
          if (casesError) throw casesError;
          
          // Format unassigned cases
          const formattedCases = unassignedCasesData.map(caseItem => ({
            id: caseItem.id,
            crimeReportId: caseItem.report_id,
            progress: caseItem.status as CaseProgress,
            lastUpdated: caseItem.updated_at,
            station: caseItem.station,
            priority: caseItem.priority as "high" | "medium" | "low" | undefined,
            crimeReport: caseItem.reports ? {
              id: caseItem.reports.id,
              title: caseItem.reports.title,
              description: caseItem.reports.description,
              status: caseItem.reports.status as CaseStatus,
              createdById: "",
              createdAt: caseItem.created_at,
              location: caseItem.reports.location,
              crimeType: caseItem.reports.category
            } : undefined
          }));
          
          setUnassignedCases(formattedCases);
          
          // Get officers for this station
          const { data: officersData, error: officersError } = await supabase
            .from('users')
            .select('id, full_name, email, role, station, status')
            .eq('station', userData.station)
            .eq('role', 'Officer');
          
          if (officersError) throw officersError;
          
          // Count assigned cases for each officer
          const officersWithCaseCounts = await Promise.all(
            officersData.map(async (officer) => {
              const { count, error: countError } = await supabase
                .from('cases')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_officer_id', officer.id);
              
              return {
                id: officer.id,
                name: officer.full_name,
                email: officer.email,
                role: officer.role,
                station: officer.station,
                status: officer.status as OfficerStatus,
                badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`, // Mock badge number
                assignedCases: count || 0
              };
            })
          );
          
          setStationOfficers(officersWithCaseCounts);
        }
      } catch (error) {
        console.error("Error fetching supervisor data:", error);
        toast({
          title: "Error fetching data",
          description: "Could not load station-specific data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSupervisorData();
  }, [user, navigate, toast]);
  
  // Handle case assignment specifically for station cases
  const handleStationCaseAssignment = async (caseId: string, officerId: string, officerName: string) => {
    try {
      // Update the case in Supabase
      const { error } = await supabase
        .from('cases')
        .update({ 
          assigned_officer_id: officerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);
      
      if (error) throw error;
      
      // Create case history record
      await supabase
        .from('case_history')
        .insert({
          case_id: caseId,
          updated_by: user?.id,
          status_before: 'Pending',
          status_after: 'In Progress',
          update_note: `Case assigned to Officer ${officerName}`
        });
      
      // Update local state
      setUnassignedCases(prev => prev.filter(c => c.id !== caseId));
      
      // Show success toast
      toast({
        title: "Case assigned",
        description: `Case successfully assigned to Officer ${officerName}`,
      });
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="flex-grow flex">
        <SidebarProvider>
          <SupervisorSidebar />
          <SidebarInset className="p-6">
            <SupervisorDashboardHeader user={user} station={station} />
            <StatsOverview stats={stats} />
            
            {/* Station-specific unassigned cases */}
            {station && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Unassigned Cases - {station} Station</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {loading ? (
                    <div className="animate-pulse p-8 text-center text-gray-400">Loading station cases...</div>
                  ) : unassignedCases.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Assign</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {unassignedCases.map((caseItem) => (
                            <tr key={caseItem.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{caseItem.id.substring(0, 8)}...</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{caseItem.crimeReport?.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caseItem.crimeReport?.crimeType || "N/A"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                  ${caseItem.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                    caseItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-blue-100 text-blue-800'}`}>
                                  {caseItem.priority || 'normal'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(caseItem.lastUpdated).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <select
                                  className="border border-gray-300 rounded p-1 text-sm"
                                  onChange={(e) => {
                                    const officerId = e.target.value;
                                    if (officerId) {
                                      const officer = stationOfficers.find(o => o.id === officerId);
                                      if (officer) {
                                        handleStationCaseAssignment(caseItem.id, officerId, officer.name);
                                      }
                                    }
                                  }}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Assign to...</option>
                                  {stationOfficers
                                    .filter(o => o.status === 'on_duty')
                                    .map(officer => (
                                      <option key={officer.id} value={officer.id}>
                                        {officer.name} ({officer.assignedCases} cases)
                                      </option>
                                    ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">No unassigned cases in {station} station</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Station Officers */}
            {station && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Officers - {station} Station</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    <div className="col-span-full animate-pulse p-8 text-center text-gray-400">Loading station officers...</div>
                  ) : stationOfficers.length > 0 ? (
                    stationOfficers.map(officer => (
                      <div key={officer.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-200 rounded-full p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium">{officer.name}</h3>
                            <p className="text-sm text-gray-500">{officer.email}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                ${officer.status === 'on_duty' ? 'bg-green-100 text-green-800' : 
                                  officer.status === 'on_leave' ? 'bg-amber-100 text-amber-800' : 
                                  'bg-gray-100 text-gray-800'}`}>
                                {officer.status === 'on_duty' ? 'On Duty' : 
                                 officer.status === 'on_leave' ? 'On Leave' : 'Off Duty'}
                              </span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                {officer.assignedCases} cases
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 text-center text-gray-500">No officers assigned to {station} station</div>
                  )}
                </div>
              </div>
            )}
            
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
                <TabsTrigger value="officers">All Officers</TabsTrigger>
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
