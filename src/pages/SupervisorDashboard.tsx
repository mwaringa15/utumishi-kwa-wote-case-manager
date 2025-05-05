
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Filter, 
  Search, 
  ArrowDown, 
  ArrowUp, 
  User, 
  Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Case, CaseProgress, CaseStatus, CrimeReport, User as UserType } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [officers, setOfficers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("lastUpdated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingReports: 0,
    activeCases: 0,
    completedCases: 0,
    totalOfficers: 0
  });
  
  // Mock data loading
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!["OCS", "Commander", "Administrator"].includes(user.role)) {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call to Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock officers data
        const mockOfficers: UserType[] = [
          {
            id: "officer1",
            name: "Officer John Doe",
            email: "john@police.go.ke",
            role: "Officer",
            createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
            badgeNumber: "KP12345",
            assignedCases: 3
          },
          {
            id: "officer2",
            name: "Officer Jane Smith",
            email: "jane@police.go.ke",
            role: "Officer",
            createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
            badgeNumber: "KP67890",
            assignedCases: 5
          },
          {
            id: "officer3",
            name: "Officer James Kimani",
            email: "james@police.go.ke",
            role: "Officer",
            createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
            badgeNumber: "KP24680",
            assignedCases: 2
          },
          {
            id: "officer4",
            name: "Officer Mary Wanjiku",
            email: "mary@police.go.ke",
            role: "Officer",
            createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
            badgeNumber: "KP13579",
            assignedCases: 4
          },
        ];
        
        // Mock pending reports
        const mockReports: CrimeReport[] = [
          {
            id: "r111",
            title: "Shoplifting at Central Mall",
            description: "Observed a person taking items without paying at the electronics section around 3 PM.",
            status: "Submitted",
            createdById: "user111",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Central Mall, Nairobi",
            crimeType: "Theft"
          },
          {
            id: "r112",
            title: "Suspicious Activity near School",
            description: "Noticed unusual activity around the school compound during late hours.",
            status: "Submitted",
            createdById: "user112",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: "St. Mary's School, Kiambu Road",
            crimeType: "Suspicious Activity"
          },
          {
            id: "r113",
            title: "Vehicle Break-in",
            description: "Car window broken and laptop stolen from inside.",
            status: "Submitted",
            createdById: "user113",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Westlands Parking Lot, Nairobi",
            crimeType: "Theft"
          },
        ];
        
        // Mock cases data
        const mockCases: Case[] = [
          {
            id: "c201",
            crimeReportId: "r201",
            assignedOfficerId: "officer1",
            assignedOfficerName: "Officer John Doe",
            progress: "In Progress",
            lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r201",
              title: "Vehicle Theft at Shopping Mall",
              description: "Car stolen from mall parking. Toyota Corolla, license KCZ 123A.",
              status: "Under Investigation",
              createdById: "user201",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Sarit Centre, Westlands",
              crimeType: "Vehicle Theft"
            },
          },
          {
            id: "c202",
            crimeReportId: "r202",
            assignedOfficerId: "officer2",
            assignedOfficerName: "Officer Jane Smith",
            progress: "Pending",
            lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r202",
              title: "Business Burglary",
              description: "Break-in at local business. Cash register and electronics taken.",
              status: "Under Investigation",
              createdById: "user202",
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Biashara Street, CBD",
              crimeType: "Burglary"
            },
          },
          {
            id: "c203",
            crimeReportId: "r203",
            assignedOfficerId: "officer1",
            assignedOfficerName: "Officer John Doe",
            progress: "Completed",
            lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            submittedToJudiciary: true,
            judiciaryStatus: "Accepted",
            crimeReport: {
              id: "r203",
              title: "Assault at Nightclub",
              description: "Physical altercation between patrons at nightclub.",
              status: "Completed",
              createdById: "user203",
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Club Zeros, Westlands",
              crimeType: "Assault"
            },
          },
          {
            id: "c204",
            crimeReportId: "r204",
            assignedOfficerId: "officer3",
            assignedOfficerName: "Officer James Kimani",
            progress: "In Progress",
            lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r204",
              title: "Identity Theft Report",
              description: "Victim reported unauthorized accounts opened in their name.",
              status: "Under Investigation",
              createdById: "user204",
              createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              location: "N/A (Online Crime)",
              crimeType: "Fraud"
            },
          },
          {
            id: "c205",
            crimeReportId: "r205",
            assignedOfficerId: "officer2",
            assignedOfficerName: "Officer Jane Smith",
            progress: "Pending Review",
            lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            crimeReport: {
              id: "r205",
              title: "Drug Activity Report",
              description: "Suspected drug dealing in apartment complex.",
              status: "Under Investigation",
              createdById: "user205",
              createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Parklands Estate, Nairobi",
              crimeType: "Narcotics"
            },
          },
        ];
        
        setOfficers(mockOfficers);
        setPendingReports(mockReports);
        setAllCases(mockCases);
        setFilteredCases(mockCases);
        
        // Set statistics
        setStats({
          totalCases: mockCases.length,
          pendingReports: mockReports.length,
          activeCases: mockCases.filter(c => c.progress !== "Completed").length,
          completedCases: mockCases.filter(c => c.progress === "Completed").length,
          totalOfficers: mockOfficers.length
        });
      } catch (error) {
        console.error("Failed to load supervisor dashboard data", error);
        toast({
          title: "Error loading data",
          description: "Failed to load dashboard information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, navigate, toast]);
  
  // Filter and sort cases
  useEffect(() => {
    let filtered = [...allCases];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(caseItem => 
        caseItem.crimeReport?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.crimeReport?.crimeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.assignedOfficerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case "caseId":
          valueA = a.id;
          valueB = b.id;
          break;
        case "crimeType":
          valueA = a.crimeReport?.crimeType || "";
          valueB = b.crimeReport?.crimeType || "";
          break;
        case "title":
          valueA = a.crimeReport?.title || "";
          valueB = b.crimeReport?.title || "";
          break;
        case "officer":
          valueA = a.assignedOfficerName || "";
          valueB = b.assignedOfficerName || "";
          break;
        case "progress":
          valueA = a.progress || "";
          valueB = b.progress || "";
          break;
        default:
          valueA = a.lastUpdated || "";
          valueB = b.lastUpdated || "";
      }
      
      if (sortDirection === "asc") {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
    
    setFilteredCases(filtered);
  }, [allCases, searchTerm, sortField, sortDirection]);
  
  // Handle case assignment
  const handleAssignCase = (caseId: string, officerId: string, officerName: string) => {
    setAllCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId) {
        return {
          ...caseItem,
          assignedOfficerId: officerId,
          assignedOfficerName: officerName,
          lastUpdated: new Date().toISOString(),
        };
      }
      return caseItem;
    }));
    
    toast({
      title: "Case assigned",
      description: `Case ${caseId} has been assigned to ${officerName}`,
    });
  };
  
  // Handle assigning a report to create a case
  const handleCreateCase = (reportId: string, officerId: string, officerName: string) => {
    // Find the report
    const report = pendingReports.find(r => r.id === reportId);
    if (!report) return;
    
    // Create a new case
    const newCase: Case = {
      id: "c" + Math.random().toString(36).substring(2, 10),
      crimeReportId: reportId,
      assignedOfficerId: officerId,
      assignedOfficerName: officerName,
      progress: "Pending",
      lastUpdated: new Date().toISOString(),
      crimeReport: {
        ...report,
        status: "Under Investigation"
      }
    };
    
    // Add to all cases
    setAllCases(prev => [...prev, newCase]);
    
    // Remove from pending reports
    setPendingReports(prev => prev.filter(r => r.id !== reportId));
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalCases: prev.totalCases + 1,
      activeCases: prev.activeCases + 1,
      pendingReports: prev.pendingReports - 1
    }));
    
    toast({
      title: "Case created",
      description: `New case created and assigned to ${officerName}`,
    });
  };
  
  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Handle escalating a case to judiciary
  const handleSubmitToJudiciary = (caseId: string) => {
    setAllCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId && caseItem.crimeReport) {
        return {
          ...caseItem,
          submittedToJudiciary: true,
          judiciaryStatus: "Pending Review",
          lastUpdated: new Date().toISOString(),
          crimeReport: {
            ...caseItem.crimeReport,
            status: "Submitted to Judiciary"
          }
        };
      }
      return caseItem;
    }));
    
    toast({
      title: "Case submitted to judiciary",
      description: `Case ${caseId} has been submitted for judiciary review`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-kenya-black mb-1">Supervisor Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCases}</div>
            </CardContent>
          </Card>
          
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
              <CardTitle className="text-sm font-medium text-gray-500">Completed Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCases}</div>
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
              <CardTitle className="text-sm font-medium text-gray-500">Total Officers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOfficers}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filter Controls */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search cases by title, officer, type or ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select 
                  value={sortField} 
                  onValueChange={(value) => toggleSort(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastUpdated">Date Updated</SelectItem>
                    <SelectItem value="caseId">Case ID</SelectItem>
                    <SelectItem value="crimeType">Crime Type</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="officer">Officer</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                >
                  {sortDirection === "asc" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="cases">All Cases</TabsTrigger>
            <TabsTrigger value="pending">Pending Reports</TabsTrigger>
            <TabsTrigger value="officers">Officers</TabsTrigger>
          </TabsList>
          
          {/* All Cases Tab */}
          <TabsContent value="cases">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Case ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Officer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          <div className="animate-pulse text-gray-400">Loading cases...</div>
                        </td>
                      </tr>
                    ) : filteredCases.length > 0 ? (
                      filteredCases.map((caseItem) => (
                        <tr key={caseItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {caseItem.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {caseItem.crimeReport?.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {caseItem.crimeReport?.crimeType || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {caseItem.assignedOfficerName || "Unassigned"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              caseItem.progress === "Completed" ? "bg-green-100 text-green-800" :
                              caseItem.progress === "In Progress" ? "bg-blue-100 text-blue-800" :
                              caseItem.progress === "Pending Review" ? "bg-purple-100 text-purple-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {caseItem.progress}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(caseItem.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/case/${caseItem.id}`)}
                              >
                                View
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Assign
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Assign Case to Officer</DialogTitle>
                                    <DialogDescription>
                                      Select an officer to assign to this case.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <div className="space-y-4">
                                      {officers.map((officer) => (
                                        <div 
                                          key={officer.id} 
                                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                          <div className="flex items-center">
                                            <div className="bg-gray-200 rounded-full p-2 mr-3">
                                              <User className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div>
                                              <div className="font-medium">{officer.name}</div>
                                              <div className="text-sm text-gray-500">
                                                Badge: {officer.badgeNumber} | Cases: {officer.assignedCases}
                                              </div>
                                            </div>
                                          </div>
                                          <Button 
                                            size="sm" 
                                            onClick={() => handleAssignCase(caseItem.id, officer.id, officer.name)}
                                          >
                                            Assign
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              {caseItem.progress === "Completed" && !caseItem.submittedToJudiciary && (
                                <Button 
                                  variant="default"
                                  size="sm"
                                  className="bg-kenya-black hover:bg-kenya-black/90"
                                  onClick={() => handleSubmitToJudiciary(caseItem.id)}
                                >
                                  Submit to Judiciary
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No cases found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          {/* Pending Reports Tab */}
          <TabsContent value="pending">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          <div className="animate-pulse text-gray-400">Loading reports...</div>
                        </td>
                      </tr>
                    ) : pendingReports.length > 0 ? (
                      pendingReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.crimeType || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.location || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {}}
                              >
                                View
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm"
                                    className="bg-kenya-green hover:bg-kenya-green/90"
                                  >
                                    Create Case
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Create Case & Assign Officer</DialogTitle>
                                    <DialogDescription>
                                      Select an officer to handle this case.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <div className="space-y-4">
                                      {officers.map((officer) => (
                                        <div 
                                          key={officer.id} 
                                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                          <div className="flex items-center">
                                            <div className="bg-gray-200 rounded-full p-2 mr-3">
                                              <User className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div>
                                              <div className="font-medium">{officer.name}</div>
                                              <div className="text-sm text-gray-500">
                                                Badge: {officer.badgeNumber} | Cases: {officer.assignedCases}
                                              </div>
                                            </div>
                                          </div>
                                          <Button 
                                            size="sm" 
                                            onClick={() => handleCreateCase(report.id, officer.id, officer.name)}
                                          >
                                            Assign
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No pending reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          {/* Officers Tab */}
          <TabsContent value="officers">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Police Officers</h2>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Officers
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="animate-pulse text-gray-400">Loading officers...</div>
                  </div>
                ) : officers.length > 0 ? (
                  officers.map((officer) => (
                    <Card key={officer.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="bg-gray-200 rounded-full p-3 mr-4">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">{officer.name}</h3>
                              <p className="text-gray-500">{officer.email}</p>
                              <div className="flex items-center mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {officer.badgeNumber}
                                </span>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-sm text-gray-600">
                                  {officer.assignedCases} active cases
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            View Cases
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No officers found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorDashboard;
