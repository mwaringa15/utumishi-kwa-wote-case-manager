
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Case, CaseStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertCircle,
  Check,
  Filter,
  FileText,
  Search,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const JudiciaryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submittedCases, setSubmittedCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("lastUpdated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Mock data loading
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call to Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock cases data
        const mockCases: Case[] = [
          {
            id: "c101",
            crimeReportId: "r101",
            assignedOfficerId: "officer123",
            progress: "Completed",
            lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            submittedToJudiciary: true,
            judiciaryStatus: "Pending Review",
            crimeReport: {
              id: "r101",
              title: "Armed Robbery at Main Street Bank",
              description: "Three armed individuals robbed the bank. Security footage and witness statements collected.",
              status: "Submitted to Judiciary",
              createdById: "user123",
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Main Street, Nairobi",
              crimeType: "Armed Robbery",
            },
          },
          {
            id: "c102",
            crimeReportId: "r102",
            assignedOfficerId: "officer456",
            progress: "Completed",
            lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            submittedToJudiciary: true,
            judiciaryStatus: "Accepted",
            crimeReport: {
              id: "r102",
              title: "Fraud Investigation - Corporate Embezzlement",
              description: "Investigation into embezzlement of funds at XYZ Corporation. Financial documents collected and interviews conducted with staff.",
              status: "Under Court Process",
              createdById: "user456",
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Business District, Nairobi",
              crimeType: "Fraud",
            },
          },
          {
            id: "c103",
            crimeReportId: "r103",
            assignedOfficerId: "officer789",
            progress: "Completed",
            lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            submittedToJudiciary: true,
            judiciaryStatus: "Returned",
            crimeReport: {
              id: "r103",
              title: "Drug Trafficking Network",
              description: "Investigation into organized drug trafficking operation. Evidence includes surveillance records, seized substances, and informant testimony.",
              status: "Returned from Judiciary",
              createdById: "user789",
              createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
              location: "Multiple locations across Nairobi",
              crimeType: "Drug Trafficking",
            },
            judiciaryCaseNotes: "Insufficient evidence on chain of custody. Please provide additional documentation on evidence handling procedures.",
          },
        ];
        
        setSubmittedCases(mockCases);
        setFilteredCases(mockCases);
      } catch (error) {
        console.error("Failed to load judiciary dashboard data", error);
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
  
  // Filter and sort cases
  useEffect(() => {
    let filtered = [...submittedCases];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(caseItem => 
        caseItem.crimeReport?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.crimeReport?.crimeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        case "status":
          valueA = a.judiciaryStatus || "";
          valueB = b.judiciaryStatus || "";
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
  }, [submittedCases, searchTerm, sortField, sortDirection]);
  
  // Handle case status update
  const handleUpdateStatus = (caseId: string, newStatus: "Accepted" | "Returned") => {
    setSubmittedCases(prev => prev.map(caseItem => {
      if (caseItem.id === caseId) {
        const updatedCase = {
          ...caseItem,
          judiciaryStatus: newStatus,
          lastUpdated: new Date().toISOString(),
        };
        
        if (newStatus === "Returned") {
          updatedCase.judiciaryCaseNotes = "Please provide additional documentation.";
          updatedCase.crimeReport = {
            ...caseItem.crimeReport!,
            status: "Returned from Judiciary"
          };
        } else {
          updatedCase.crimeReport = {
            ...caseItem.crimeReport!,
            status: "Under Court Process"
          };
        }
        
        return updatedCase;
      }
      return caseItem;
    }));
    
    toast({
      title: `Case ${newStatus}`,
      description: `Case ${caseId} has been marked as ${newStatus}`,
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-kenya-black mb-1">Judiciary Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}</p>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search cases by title, type or ID..."
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
                    <SelectItem value="status">Status</SelectItem>
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
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Cases</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="returned">Returned</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-gray-400">Loading cases...</div>
                </div>
              ) : filteredCases.length > 0 ? (
                renderCasesList(filteredCases)
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No cases found</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pending">
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-gray-400">Loading cases...</div>
                </div>
              ) : filteredCases.filter(c => c.judiciaryStatus === "Pending Review").length > 0 ? (
                renderCasesList(filteredCases.filter(c => c.judiciaryStatus === "Pending Review"))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No cases pending review</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="accepted">
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-gray-400">Loading cases...</div>
                </div>
              ) : filteredCases.filter(c => c.judiciaryStatus === "Accepted").length > 0 ? (
                renderCasesList(filteredCases.filter(c => c.judiciaryStatus === "Accepted"))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No accepted cases</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="returned">
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-gray-400">Loading cases...</div>
                </div>
              ) : filteredCases.filter(c => c.judiciaryStatus === "Returned").length > 0 ? (
                renderCasesList(filteredCases.filter(c => c.judiciaryStatus === "Returned"))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No returned cases</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
  
  // Helper function to render cases list
  function renderCasesList(cases: Case[]) {
    return cases.map((caseItem) => (
      <Card key={caseItem.id} className="bg-white shadow hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{caseItem.crimeReport?.title}</CardTitle>
              <CardDescription>
                Case ID: {caseItem.id} | Crime Type: {caseItem.crimeReport?.crimeType}
              </CardDescription>
            </div>
            <div>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                caseItem.judiciaryStatus === "Accepted" ? "bg-green-100 text-green-800" :
                caseItem.judiciaryStatus === "Returned" ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {caseItem.judiciaryStatus}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Case Summary</h4>
              <p className="text-gray-700 mt-1">{caseItem.crimeReport?.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="text-gray-700 mt-1">{caseItem.crimeReport?.location || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date Submitted</h4>
                <p className="text-gray-700 mt-1">{new Date(caseItem.lastUpdated).toLocaleDateString()}</p>
              </div>
            </div>
            {caseItem.judiciaryCaseNotes && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <h4 className="text-sm font-medium text-amber-800 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Notes
                </h4>
                <p className="text-amber-700 mt-1 text-sm">{caseItem.judiciaryCaseNotes}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/case/${caseItem.id}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Full Case
          </Button>
          
          <div className="flex gap-2">
            {caseItem.judiciaryStatus === "Pending Review" && (
              <>
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => handleUpdateStatus(caseItem.id, "Returned")}
                >
                  Return for Revision
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleUpdateStatus(caseItem.id, "Accepted")}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept Case
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    ));
  }
};

export default JudiciaryDashboard;
