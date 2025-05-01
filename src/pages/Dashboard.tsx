
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CaseCard from "@/components/CaseCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Case, CrimeReport } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Search } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [myReports, setMyReports] = useState<CrimeReport[]>([]);
  const [myCases, setMyCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Mock API call to load data
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch data from your Supabase backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockReports: CrimeReport[] = [
          {
            id: "r1",
            title: "Stolen Mobile Phone",
            description: "My phone was snatched at the bus station around 6 PM yesterday. It's a Samsung Galaxy S21, black color.",
            status: "Under Investigation",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "r2",
            title: "Damaged Vehicle",
            description: "Found my car with scratches on all sides in the parking lot at Central Mall.",
            status: "Submitted",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        
        const mockCases: Case[] = [
          {
            id: "c1",
            crimeReportId: "r1",
            assignedOfficerId: "off123",
            progress: "In Progress",
            lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: mockReports[0],
          },
          {
            id: "c2",
            crimeReportId: "r2",
            progress: "Pending",
            lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: mockReports[1],
          },
        ];
        
        setMyReports(mockReports);
        setMyCases(mockCases);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        toast({
          title: "Error loading data",
          description: "Failed to load your reports and cases",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-kenya-black mb-1">My Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button 
              onClick={() => navigate("/report-crime")}
              className="bg-kenya-red hover:bg-kenya-red/90 text-white flex items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              Report Crime
            </Button>
            <Button 
              onClick={() => navigate("/track-case")}
              variant="outline"
              className="flex items-center"
            >
              <Search className="mr-2 h-4 w-4" />
              Track Case
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="cases">My Cases</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cases">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Cases</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-gray-400">Loading cases...</div>
                </div>
              ) : myCases.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myCases.map((caseItem) => (
                    <CaseCard key={caseItem.id} caseData={caseItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You don't have any cases yet</p>
                  <Button 
                    onClick={() => navigate("/report-crime")}
                    className="bg-kenya-green hover:bg-kenya-green/90 text-white"
                  >
                    Report a new crime
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">My Reports</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-gray-400">Loading reports...</div>
                </div>
              ) : myReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {myReports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {report.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.createdAt || "").toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                              ${report.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 
                                report.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              onClick={() => navigate(`/track-case?id=${report.id}`)}
                              className="text-kenya-green hover:text-kenya-green/80"
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't submitted any reports yet</p>
                  <Button 
                    onClick={() => navigate("/report-crime")}
                    className="bg-kenya-green hover:bg-kenya-green/90 text-white"
                  >
                    Submit your first report
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
