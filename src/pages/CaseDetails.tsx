
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Case, CaseProgress, CaseUpdate } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
        
        // Fetch actual case data from Supabase
        const { data: fetchedCase, error: caseError } = await supabase
          .from('cases')
          .select(`
            id,
            status,
            priority,
            assigned_officer_id,
            created_at,
            updated_at,
            report_id,
            reports (
              id,
              title,
              description,
              status,
              created_at,
              location,
              category,
              contact_phone,
              additional_info
            )
          `)
          .eq('id', id)
          .single();
          
        if (caseError) {
          console.error("Failed to load case data", caseError);
          throw new Error("Failed to load case data");
        }
        
        if (!fetchedCase) {
          console.error("No case found with ID:", id);
          throw new Error("Case not found");
        }
        
        // Get the officer name if assigned
        let officerName = "";
        if (fetchedCase.assigned_officer_id) {
          const { data: officerData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', fetchedCase.assigned_officer_id)
            .single();
            
          officerName = officerData?.full_name || "Unknown Officer";
        }
        
        // Fetch case updates
        const { data: updates, error: updatesError } = await supabase
          .from('case_history')
          .select(`
            id,
            case_id,
            updated_by,
            update_note,
            updated_at,
            status_before,
            status_after,
            users (full_name)
          `)
          .eq('case_id', id)
          .order('updated_at', { ascending: false });
          
        if (updatesError) {
          console.error("Failed to load case updates", updatesError);
        }
        
        // Format the case data to match our Case type
        const formattedCase: Case = {
          id: fetchedCase.id,
          crimeReportId: fetchedCase.report_id,
          assignedOfficerId: fetchedCase.assigned_officer_id || "",
          assignedOfficerName: officerName,
          progress: fetchedCase.status as CaseProgress,
          lastUpdated: fetchedCase.updated_at,
          crimeReport: {
            id: fetchedCase.reports.id,
            title: fetchedCase.reports.title,
            description: fetchedCase.reports.description,
            status: fetchedCase.reports.status,
            createdById: "",
            createdAt: fetchedCase.reports.created_at,
            location: fetchedCase.reports.location,
            crimeType: fetchedCase.reports.category,
            victimName: "",
            victimContact: fetchedCase.reports.contact_phone || ""
          },
        };
        
        // Format the updates
        const formattedUpdates: CaseUpdate[] = updates 
          ? updates.map(update => ({
              id: update.id,
              caseId: update.case_id,
              officerId: update.updated_by || "",
              officerName: update.users?.full_name || "System",
              content: update.update_note || `Status changed from ${update.status_before} to ${update.status_after}`,
              timestamp: update.updated_at,
              type: update.status_before !== update.status_after ? "Status Change" : "Progress Update"
            }))
          : [];
        
        setCaseData(formattedCase);
        setCaseUpdates(formattedUpdates);
        
        console.log(`Successfully loaded case data for ID: ${id}`);
        sessionStorage.setItem('lastViewedCase', id);
      } catch (error: any) {
        console.error("Failed to load case data", error);
        toast({
          title: "Error loading case",
          description: error.message || "Failed to load case details",
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
  const handleAddUpdate = async () => {
    if (!newUpdateText.trim() || !id) {
      toast({
        title: "Cannot add update",
        description: "Update text cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Add update to Supabase
      const { data: newUpdate, error } = await supabase
        .from('case_history')
        .insert({
          case_id: id,
          updated_by: user?.id,
          update_note: newUpdateText,
          status_before: caseData?.progress,
          status_after: caseData?.progress
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Format and add to local state
      const formattedUpdate: CaseUpdate = {
        id: newUpdate.id,
        caseId: id,
        officerId: user?.id || "",
        officerName: user?.name || "",
        content: newUpdateText,
        timestamp: new Date().toISOString(),
        type: "Progress Update"
      };
      
      setCaseUpdates(prev => [formattedUpdate, ...prev]);
      setNewUpdateText("");
      
      toast({
        title: "Update added",
        description: "Your update has been added to the case",
      });
    } catch (error: any) {
      console.error("Failed to add update", error);
      toast({
        title: "Error adding update",
        description: error.message || "Failed to add update",
        variant: "destructive",
      });
    }
  };
  
  // Handle updating case progress
  const handleUpdateProgress = async () => {
    if (!caseData || !id) return;
    
    try {
      // Update case status in Supabase
      const { error } = await supabase
        .from('cases')
        .update({ 
          status: newProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Add case history record
      const { data: historyUpdate, error: historyError } = await supabase
        .from('case_history')
        .insert({
          case_id: id,
          updated_by: user?.id,
          status_before: caseData.progress,
          status_after: newProgress,
          update_note: `Case progress updated to: ${newProgress}`
        })
        .select()
        .single();
        
      if (historyError) {
        console.error("Failed to add history record", historyError);
      }
      
      // Update local state
      setCaseData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          progress: newProgress,
          lastUpdated: new Date().toISOString(),
        };
      });
      
      // Add an update about the progress change
      const progressUpdate: CaseUpdate = {
        id: historyUpdate?.id || `temp-${Date.now()}`,
        caseId: id,
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
    } catch (error: any) {
      console.error("Failed to update progress", error);
      toast({
        title: "Error updating progress",
        description: error.message || "Failed to update progress",
        variant: "destructive",
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
