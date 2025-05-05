import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
  Clock, 
  User, 
  MapPin, 
  FileText, 
  MessageSquare, 
  Paperclip,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowUpFromLine,
} from "lucide-react";
import { 
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
} from "@/components/ui/timeline";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Case, CaseProgress, CaseStatus, CaseUpdate } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const CaseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [newProgress, setNewProgress] = useState<CaseProgress>("In Progress");
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([]);
  
  // Load case data
  useEffect(() => {
    const loadCaseData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock case data
        const mockCase: Case = {
          id: id || "c123",
          crimeReportId: "r456",
          assignedOfficerId: "officer789",
          assignedOfficerName: "Officer John Doe",
          progress: "In Progress",
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          crimeReport: {
            id: "r456",
            title: "Armed Robbery Investigation",
            description: "Armed robbery at a convenience store on Main Street. The suspect was armed with a handgun and fled with approximately $500 in cash. Security camera footage is available.",
            status: "Under Investigation",
            createdById: "user123",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: "123 Main Street, Downtown",
            crimeType: "Armed Robbery",
            victimName: "John Smith",
            victimContact: "0712345678"
          },
        };
        
        // Mock updates
        const mockUpdates: CaseUpdate[] = [
          {
            id: "u1",
            caseId: id || "c123",
            officerId: "officer789",
            officerName: "Officer John Doe",
            content: "Opened case and started initial investigation. Requested security footage from the convenience store.",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Progress Update"
          },
          {
            id: "u2",
            caseId: id || "c123",
            officerId: "officer789",
            officerName: "Officer John Doe",
            content: "Received security footage. Clearly shows suspect's face. Will run through facial recognition database.",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Evidence Added",
            attachmentName: "security_footage.mp4"
          },
          {
            id: "u3",
            caseId: id || "c123",
            officerId: "commander123",
            officerName: "Commander Sarah Johnson",
            content: "Reviewed case. Priority upgraded to high. Please expedite facial recognition search.",
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Case Priority Change"
          }
        ];
        
        setCaseData(mockCase);
        setCaseUpdates(mockUpdates);
      } catch (error) {
        console.error("Failed to load case data", error);
        toast({
          title: "Error loading case",
          description: "Failed to load case details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadCaseData();
    }
  }, [id, toast]);
  
  // Handle adding a new update
  const handleAddUpdate = () => {
    if (!newUpdateText.trim()) {
      toast({
        title: "Cannot add update",
        description: "Update text cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    const newUpdate: CaseUpdate = {
      id: `u${Math.random().toString(36).substring(2, 10)}`,
      caseId: id || "",
      officerId: user?.id || "",
      officerName: user?.name || "",
      content: newUpdateText,
      timestamp: new Date().toISOString(),
      type: "Progress Update"
    };
    
    setCaseUpdates(prev => [newUpdate, ...prev]);
    setNewUpdateText("");
    
    toast({
      title: "Update added",
      description: "Your update has been added to the case",
    });
  };
  
  // Handle updating case progress
  const handleUpdateProgress = () => {
    if (caseData) {
      const updatedCase = {
        ...caseData,
        progress: newProgress,
        lastUpdated: new Date().toISOString(),
      };
      
      setCaseData(updatedCase);
      
      // Add an update about the progress change
      const progressUpdate: CaseUpdate = {
        id: `u${Math.random().toString(36).substring(2, 10)}`,
        caseId: id || "",
        officerId: user?.id || "",
        officerName: user?.name || "",
        content: `Case progress updated to: ${newProgress}`,
        timestamp: new Date().toISOString(),
        type: "Status Change"
      };
      
      setCaseUpdates(prev => [progressUpdate, ...prev]);
      
      toast({
        title: "Progress updated",
        description: `Case progress changed to ${newProgress}`,
      });
    }
  };
  
  // Determine if user can edit the case
  const canEditCase = () => {
    if (!user) return false;
    
    // Officers can edit cases assigned to them
    if (user.role === "Officer" && caseData?.assignedOfficerId === user.id) {
      return true;
    }
    
    // Supervisors can edit all cases
    if (["OCS", "Commander", "Administrator"].includes(user.role)) {
      return true;
    }
    
    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={!!user} userRole={user?.role} />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kenya-green"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={!!user} userRole={user?.role} />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Case Not Found</h2>
            <p className="text-gray-600 mb-6">
              The case you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-2" 
                onClick={() => navigate(-1)}
              >
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-kenya-black">{caseData.crimeReport?.title}</h1>
            </div>
            <p className="text-gray-600 ml-12">Case ID: {caseData.id}</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-3 ${
              caseData.progress === "Completed" ? "bg-green-100 text-green-800" :
              caseData.progress === "In Progress" ? "bg-blue-100 text-blue-800" :
              caseData.progress === "Pending Review" ? "bg-purple-100 text-purple-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {caseData.progress}
            </span>
            
            {caseData.submittedToJudiciary && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                Judiciary: {caseData.judiciaryStatus || "Pending"}
              </span>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Case Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            {canEditCase() && (
              <TabsTrigger value="update">Update Case</TabsTrigger>
            )}
          </TabsList>
          
          {/* Case Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Crime Report Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-gray-800">{caseData.crimeReport?.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Crime Type</h3>
                        <p className="mt-1 text-gray-800">{caseData.crimeReport?.crimeType || "Not specified"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className="mt-1 text-gray-800">{caseData.crimeReport?.status}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
                        <p className="mt-1 text-gray-800">
                          {new Date(caseData.crimeReport?.createdAt || "").toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="mt-1 text-gray-800 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {caseData.crimeReport?.location || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {caseData.crimeReport?.victimName && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Victim Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Name</h3>
                        <p className="mt-1 text-gray-800">{caseData.crimeReport.victimName}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                        <p className="mt-1 text-gray-800">{caseData.crimeReport.victimContact || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {caseUpdates.length > 0 ? (
                      <div className="space-y-4">
                        {caseUpdates.slice(0, 3).map(update => (
                          <div key={update.id} className="border-l-4 border-kenya-green pl-4 py-1">
                            <p className="text-gray-800">{update.content}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <User className="h-4 w-4 mr-1" />
                              <span>{update.officerName}</span>
                              <span className="mx-2">•</span>
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{new Date(update.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No updates yet</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        const evidenceTab = document.getElementById('evidence-tab');
                        if (evidenceTab) {
                          if (typeof evidenceTab.click === 'function') {
                            evidenceTab.click();
                          } else if (evidenceTab.dispatchEvent) {
                            evidenceTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                          }
                        }
                      }}
                    >
                      View All Updates
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Case Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Assigned Officer</h3>
                      <p className="mt-1 text-gray-800 flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {caseData.assignedOfficerName || "Not assigned"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                      <p className="mt-1 text-gray-800 flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(caseData.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          caseData.progress === "Completed" ? "bg-green-100 text-green-800" :
                          caseData.progress === "In Progress" ? "bg-blue-100 text-blue-800" :
                          caseData.progress === "Pending Review" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {caseData.progress}
                        </span>
                      </p>
                    </div>
                    
                    {caseData.submittedToJudiciary && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Judiciary Status</h3>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            caseData.judiciaryStatus === "Accepted" ? "bg-green-100 text-green-800" :
                            caseData.judiciaryStatus === "Returned" ? "bg-red-100 text-red-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            {caseData.judiciaryStatus || "Pending"}
                          </span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {caseData.judiciaryCaseNotes && (
                  <Card className="mb-6 border-amber-200">
                    <CardHeader className="bg-amber-50 border-b border-amber-100">
                      <CardTitle className="text-amber-900 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Judiciary Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <p className="text-amber-800">{caseData.judiciaryCaseNotes}</p>
                    </CardContent>
                  </Card>
                )}
                
                {canEditCase() && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                        onClick={() => {
                          const notesTab = document.getElementById('notes-tab');
                          if (notesTab) {
                            if (typeof notesTab.click === 'function') {
                              notesTab.click();
                            } else if (notesTab.dispatchEvent) {
                              notesTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                            }
                          }
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Update
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Add Evidence
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
                <CardDescription>
                  A chronological history of all updates, evidence, and status changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {caseUpdates.length > 0 ? (
                  <Timeline>
                    {caseUpdates.map((update, index) => (
                      <TimelineItem key={update.id} className="relative">
                        {index < caseUpdates.length - 1 && <TimelineConnector />}
                        <TimelineHeader>
                          <TimelineIcon>
                            {update.type === "Progress Update" ? (
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                            ) : update.type === "Evidence Added" ? (
                              <Paperclip className="h-4 w-4 text-green-600" />
                            ) : update.type === "Status Change" ? (
                              <CheckCircle2 className="h-4 w-4 text-amber-600" />
                            ) : update.type === "Case Priority Change" ? (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Calendar className="h-4 w-4 text-gray-600" />
                            )}
                          </TimelineIcon>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">
                              {update.type}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(update.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </TimelineHeader>
                        <TimelineBody>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-800">{update.content}</p>
                            {update.attachmentName && (
                              <div className="mt-2 flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                                <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600">{update.attachmentName}</span>
                              </div>
                            )}
                            <div className="mt-2 text-sm text-gray-500 flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {update.officerName}
                            </div>
                          </div>
                        </TimelineBody>
                      </TimelineItem>
                    ))}
                    
                    <TimelineItem className="relative">
                      <TimelineHeader>
                        <TimelineIcon>
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </TimelineIcon>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            Case Created
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(caseData.crimeReport?.createdAt || "").toLocaleString()}
                          </p>
                        </div>
                      </TimelineHeader>
                      <TimelineBody>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-800">Case opened based on crime report: {caseData.crimeReport?.title}</p>
                        </div>
                      </TimelineBody>
                    </TimelineItem>
                  </Timeline>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No timeline events yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Evidence Tab */}
          <TabsContent value="evidence">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Evidence & Attachments</span>
                  {canEditCase() && (
                    <Button size="sm">
                      <ArrowUpFromLine className="h-4 w-4 mr-2" />
                      Upload Evidence
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Documents, photos, and other evidence related to this case
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No evidence has been uploaded yet</p>
                  {canEditCase() && (
                    <Button className="mt-4">
                      <ArrowUpFromLine className="h-4 w-4 mr-2" />
                      Upload Evidence
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Update Case Tab - Only for authorized users */}
          {canEditCase() && (
            <TabsContent value="update">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Case Update</CardTitle>
                    <CardDescription>
                      Add notes, observations, or other updates to the case file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Enter your update here..."
                      className="min-h-[150px]"
                      value={newUpdateText}
                      onChange={(e) => setNewUpdateText(e.target.value)}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setNewUpdateText("")}>
                      Clear
                    </Button>
                    <Button onClick={handleAddUpdate}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Update
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Update Case Progress</CardTitle>
                    <CardDescription>
                      Update the current progress of this case
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Current Progress: <span className="font-semibold">{caseData.progress}</span>
                      </label>
                      
                      <Select value={newProgress} onValueChange={(value: CaseProgress) => setNewProgress(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select new progress" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Pending Review">Pending Review</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleUpdateProgress}>
                      Update Progress
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default CaseDetails;
