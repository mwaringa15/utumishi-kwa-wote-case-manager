
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Case, CaseProgress, CaseUpdate } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Import our new components
import { CaseDetailsTab } from "@/components/case-details/CaseDetailsTab";
import { TimelineTab } from "@/components/case-details/TimelineTab";
import { EvidenceTab } from "@/components/case-details/EvidenceTab";
import { UpdateTab } from "@/components/case-details/UpdateTab";
import { CaseHeader } from "@/components/case-details/CaseHeader";
import { CaseLoading } from "@/components/case-details/CaseLoading";
import { CaseNotFound } from "@/components/case-details/CaseNotFound";

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
      if (!id) return;
      
      setIsLoading(true);
      
      // Clear any cached data to ensure we're getting fresh data
      setCaseData(null);
      setCaseUpdates([]);
      
      try {
        console.log(`Loading case data for ID: ${id}`);
        // In a real app, this would fetch from Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock case data - would be from Supabase in production
        const mockCase: Case = {
          id: id,
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
            caseId: id,
            officerId: "officer789",
            officerName: "Officer John Doe",
            content: "Opened case and started initial investigation. Requested security footage from the convenience store.",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Progress Update"
          },
          {
            id: "u2",
            caseId: id,
            officerId: "officer789",
            officerName: "Officer John Doe",
            content: "Received security footage. Clearly shows suspect's face. Will run through facial recognition database.",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Evidence Added",
            attachmentName: "security_footage.mp4"
          },
          {
            id: "u3",
            caseId: id,
            officerId: "commander123",
            officerName: "Commander Sarah Johnson",
            content: "Reviewed case. Priority upgraded to high. Please expedite facial recognition search.",
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Case Priority Change"
          }
        ];
        
        setCaseData(mockCase);
        setCaseUpdates(mockUpdates);
        
        // Save current case ID to session storage to help debugging
        console.log(`Loaded case data for ID: ${id}`);
        sessionStorage.setItem('lastViewedCase', id);
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

  // Helper to navigate to a specific tab by ID
  const navigateToTab = (tabId: string) => {
    const element = document.getElementById(tabId);
    if (element) {
      if (typeof element.click === 'function') {
        element.click();
      } else if (element.dispatchEvent) {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    }
  };

  // Handle navigation to the timeline tab
  const viewAllUpdates = () => {
    navigateToTab('timeline-tab');
  };

  // Loading state
  if (isLoading) {
    return <CaseLoading isLoggedIn={!!user} userRole={user?.role} />;
  }

  // Not found or permission denied
  if (!caseData) {
    return <CaseNotFound isLoggedIn={!!user} userRole={user?.role} onBack={() => navigate(-1)} />;
  }

  // Main case details view
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <CaseHeader caseData={caseData} onBack={() => navigate(-1)} />
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details" id="details-tab">Case Details</TabsTrigger>
            <TabsTrigger value="timeline" id="timeline-tab">Timeline</TabsTrigger>
            <TabsTrigger value="evidence" id="evidence-tab">Evidence</TabsTrigger>
            {canEditCase() && (
              <TabsTrigger value="update" id="update-tab">Update Case</TabsTrigger>
            )}
          </TabsList>
          
          {/* Case Details Tab */}
          <TabsContent value="details">
            <CaseDetailsTab 
              caseData={caseData}
              caseUpdates={caseUpdates}
              onViewAllUpdates={viewAllUpdates}
              canEditCase={canEditCase()}
              onNavigateToTab={navigateToTab}
            />
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <TimelineTab 
              caseData={caseData}
              caseUpdates={caseUpdates}
            />
          </TabsContent>
          
          {/* Evidence Tab */}
          <TabsContent value="evidence">
            <EvidenceTab canEditCase={canEditCase()} />
          </TabsContent>
          
          {/* Update Case Tab - Only for authorized users */}
          {canEditCase() && (
            <TabsContent value="update">
              <UpdateTab 
                caseData={caseData}
                newUpdateText={newUpdateText}
                setNewUpdateText={setNewUpdateText}
                newProgress={newProgress}
                setNewProgress={setNewProgress}
                handleAddUpdate={handleAddUpdate}
                handleUpdateProgress={handleUpdateProgress}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default CaseDetails;
