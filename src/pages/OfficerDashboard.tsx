
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CaseCard from "@/components/CaseCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Case, CaseProgress, CaseStatus, CrimeReport } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Filter, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EvidenceUploader } from "@/components/officer/EvidenceUploader";

const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCaseForEvidence, setSelectedCaseForEvidence] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeCases: 0,
    pendingReports: 0,
    closedCases: 0,
    totalAssigned: 0
  });
  
  // Filter cases based on search term
  const filteredCases = assignedCases.filter(caseItem => 
    caseItem.crimeReport?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Redirect to login if not authenticated or not an officer
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (user.role === "Public") {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the officer portal",
        variant: "destructive",
      });
      return;
    }
    
    // Mock API call to load data
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch data from your Supabase backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - pending reports
        const mockReports: CrimeReport[] = [
          {
            id: "r3",
            title: "Shoplifting at Central Market",
            description: "Observed a person taking items without paying at the electronics section around 3 PM.",
            status: "Submitted",
            createdById: "user123",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "r4",
            title: "Suspicious Activity",
            description: "Noticed unusual activity around the abandoned building on West Street for the past few nights.",
            status: "Submitted",
            createdById: "user456",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        
        // Mock data - assigned cases
        const mockCases: Case[] = [
          {
            id: "c3",
            crimeReportId: "r5",
            assignedOfficerId: user.id,
            progress: "In Progress",
            lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r5",
              title: "Vehicle Theft",
              description: "Car stolen from residential parking. Toyota Camry, license KBZ 123J.",
              status: "Under Investigation",
              createdById: "user789",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
          {
            id: "c4",
            crimeReportId: "r6",
            assignedOfficerId: user.id,
            progress: "Pending",
            lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r6",
              title: "Break-in at Business Premises",
              description: "Store broken into overnight. Security camera shows two individuals.",
              status: "Under Investigation",
              createdById: "user101",
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
          {
            id: "c5",
            crimeReportId: "r7",
            assignedOfficerId: user.id,
            progress: "Completed",
            lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r7",
              title: "Assault Report",
              description: "Physical altercation at Downtown Bar on Saturday night.",
              status: "Closed",
              createdById: "user202",
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
        ];
        
        setPendingReports(mockReports);
        setAssignedCases(mockCases);
        
        // Set statistics
        setStats({
          activeCases: mockCases.filter(c => c.progress !== "Completed").length,
          pendingReports: mockReports.length,
          closedCases: mockCases.filter(c => c.progress === "Completed").length,
          totalAssigned: mockCases.length,
        });
      } catch (error) {
        console.error("Failed to load officer dashboard data", error);
        toast({
          title: "Error loading data",
          description: "Failed to load case information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, navigate, toast]);
  
  // Handle case status update
  const handleUpdateStatus = (caseId: string, newStatus: CaseStatus) => {
    setAssignedCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId && caseItem.crimeReport) {
        return {
          ...caseItem,
          lastUpdated: new Date().toISOString(),
          crimeReport: {
            ...caseItem.crimeReport,
            status: newStatus
          }
        };
      }
      return caseItem;
    }));
    
    toast({
      title: "Case status updated",
      description: `Case ${caseId} status changed to ${newStatus}`,
    });
  };
  
  // Handle case progress update
  const handleUpdateProgress = (caseId: string, newProgress: CaseProgress) => {
    setAssignedCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId) {
        return {
          ...caseItem,
          progress: newProgress,
          lastUpdated: new Date().toISOString(),
        };
      }
      return caseItem;
    }));
    
    // If case is completed, also update the crime report status to closed
    if (newProgress === "Completed") {
      setAssignedCases(prev => prev.map(caseItem => {
        if (caseItem.id === caseId && caseItem.crimeReport) {
          return {
            ...caseItem,
            crimeReport: {
              ...caseItem.crimeReport,
              status: "Closed"
            }
          };
        }
        return caseItem;
      }));
    }
    
    toast({
      title: "Case progress updated",
      description: `Case ${caseId} progress changed to ${newProgress}`,
    });
  };
  
  // Handle assigning a report to yourself
  const handleAssignReport = (reportId: string) => {
    // Find the report
    const report = pendingReports.find(r => r.id === reportId);
    if (!report) return;
    
    // Create a new case
    const newCase: Case = {
      id: "c" + Math.random().toString(36).substring(2, 10),
      crimeReportId: reportId,
      assignedOfficerId: user?.id,
      progress: "Pending",
      lastUpdated: new Date().toISOString(),
      crimeReport: {
        ...report,
        status: "Under Investigation"
      }
    };
    
    // Add to assigned cases
    setAssignedCases(prev => [...prev, newCase]);
    
    // Remove from pending reports
    setPendingReports(prev => prev.filter(r => r.id !== reportId));
    
    // Update stats
    setStats(prev => ({
      ...prev,
      activeCases: prev.activeCases + 1,
      pendingReports: prev.pendingReports - 1,
      totalAssigned: prev.totalAssigned + 1
    }));
    
    toast({
      title: "Case assigned",
      description: `You have been assigned to case: ${report.title}`,
    });
  };
  
  // Handle evidence upload completion
  const handleEvidenceUploaded = () => {
    // Close the dialog and update the case
    setSelectedCaseForEvidence(null);
    
    // In a real app, you would refresh the case data
    toast({
      title: "Evidence uploaded",
      description: "The evidence has been attached to the case",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-kenya-black mb-1">Officer Dashboard</h1>
            <p className="text-gray-600">Welcome, Officer {user?.name}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={() => navigate("/officer-reports")}
              className="bg-kenya-green hover:bg-kenya-green/90 text-white"
            >
              View All Reports
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCases}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Closed Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closedCases}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssigned}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="assigned">Assigned Cases</TabsTrigger>
            <TabsTrigger value="pending">Pending Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assigned">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Cases Assigned to You</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-gray-400">Loading cases...</div>
                </div>
              ) : filteredCases.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCases.map((caseItem) => (
                    <div key={caseItem.id} className="relative">
                      <CaseCard 
                        caseData={caseItem} 
                        showActions={true}
                        onUpdateStatus={handleUpdateStatus}
                        onUpdateProgress={handleUpdateProgress}
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="absolute top-4 right-4 bg-white"
                            onClick={() => setSelectedCaseForEvidence(caseItem.id)}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Evidence
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload Evidence</DialogTitle>
                            <DialogDescription>
                              Attach evidence to case {caseItem.id}
                            </DialogDescription>
                          </DialogHeader>
                          <EvidenceUploader 
                            caseId={caseItem.id} 
                            onComplete={handleEvidenceUploaded} 
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "No cases match your search criteria" 
                      : "You don't have any assigned cases yet"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pending">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Pending Reports</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-gray-400">Loading reports...</div>
                </div>
              ) : pendingReports.length > 0 ? (
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
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingReports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {report.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.createdAt || "").toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {report.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button 
                              onClick={() => handleAssignReport(report.id || "")}
                              className="bg-kenya-green hover:bg-kenya-green/90 text-white"
                              size="sm"
                            >
                              Assign to Me
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">There are no pending reports to assign</p>
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

export default OfficerDashboard;
