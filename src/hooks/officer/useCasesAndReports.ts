
import { useState, useEffect } from "react";
import { Case, CaseProgress, CaseStatus, CrimeReport, User, OfficerStats } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { loadOfficerDashboardData } from "./modules/loadOfficerDashboardData";
import { updateCaseStatusAndNotify, updateCaseProgressAndNotify } from "./modules/officerCaseActions";
import { assignReportToOfficerAndNotify } from "./modules/officerReportActions";
import { supabase } from "@/integrations/supabase/client";

export function useCasesAndReports(user: User | null) {
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [pendingReports, setPendingReports] = useState<CrimeReport[]>([]);
  const [officerReports, setOfficerReports] = useState<CrimeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<OfficerStats>({
    activeCases: 0,
    pendingReports: 0,
    closedCases: 0,
    totalAssigned: 0
  });
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user?.id) return;
    
    async function fetchOfficerReports() {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('reporter_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setOfficerReports(data.map(report => ({
          id: report.id,
          title: report.title,
          description: report.description,
          createdById: report.reporter_id,
          createdAt: report.created_at,
          status: report.status,
          location: report.location,
          crimeType: report.category,
          category: report.category,
        })));
      } catch (error) {
        console.error("Error fetching officer reports:", error);
        toast({
          title: "Error",
          description: "Failed to load your reports",
          variant: "destructive",
        });
      }
    }
    
    loadOfficerDashboardData({
      user,
      setAssignedCases,
      setPendingReports,
      setIsLoading,
      setStats,
      toast
    });
    
    fetchOfficerReports();
  }, [user, toast]); // Dependencies for data loading
  
  const handleUpdateStatus = (caseId: string, newStatus: CaseStatus) => {
    updateCaseStatusAndNotify(caseId, newStatus, setAssignedCases, toast);
    
    // Update the database
    if (user?.id) {
      supabase
        .from('cases')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating case status in database:", error);
          } else {
            // Add case history record
            supabase
              .from('case_history')
              .insert({
                case_id: caseId,
                updated_by: user.id,
                status_after: newStatus,
                update_note: `Status updated to ${newStatus}`
              })
              .then(({ error: historyError }) => {
                if (historyError) {
                  console.error("Error adding case history:", historyError);
                }
              });
          }
        });
    }
  };
  
  const handleUpdateProgress = (caseId: string, newProgress: CaseProgress) => {
    updateCaseProgressAndNotify(caseId, newProgress, setAssignedCases, toast);
    
    // Map progress to status for database update
    let newStatus: CaseStatus = "Submitted";
    if (newProgress === "Completed") {
      newStatus = "Closed";
    } else if (newProgress === "In Progress") {
      newStatus = "Under Investigation";
    } else if (newProgress === "Pending Review") {
      newStatus = "Submitted to Judiciary";
    }
    
    // Update the database
    if (user?.id) {
      supabase
        .from('cases')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating case progress in database:", error);
          } else {
            // Add case history record
            supabase
              .from('case_history')
              .insert({
                case_id: caseId,
                updated_by: user.id,
                status_after: newStatus,
                update_note: `Progress updated to ${newProgress}`
              })
              .then(({ error: historyError }) => {
                if (historyError) {
                  console.error("Error adding case history:", historyError);
                }
              });
          }
        });
    }
  };
  
  const handleAssignReport = (reportId: string) => {
    assignReportToOfficerAndNotify({
      reportId,
      user,
      pendingReports,
      setPendingReports,
      setAssignedCases,
      setStats,
      toast
    });
  };
  
  const handleEvidenceUploaded = () => {
    toast({
      title: "Evidence uploaded",
      description: "The evidence has been attached to the case",
    });
  };

  const handleUploadEvidence = async (caseId: string, file: File, description: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload evidence",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Generate a unique file path
      const filePath = `evidence/${caseId}/${Date.now()}_${file.name}`;
      
      // Upload file to Supabase Storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('case-evidence')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('case-evidence')
        .getPublicUrl(filePath);
        
      const fileUrl = urlData?.publicUrl;
      
      if (!fileUrl) {
        throw new Error("Failed to get public URL for the uploaded file");
      }
      
      // Record the evidence in the database
      const { error: evidenceError } = await supabase
        .from('evidence')
        .insert({
          case_id: caseId,
          file_url: fileUrl,
          description: description,
          uploaded_by: user.id
        });
        
      if (evidenceError) {
        throw evidenceError;
      }
      
      // Add case history record
      await supabase
        .from('case_history')
        .insert({
          case_id: caseId,
          updated_by: user.id,
          update_note: `Evidence uploaded: ${file.name}`
        });
      
      toast({
        title: "Evidence uploaded",
        description: "The evidence has been successfully attached to the case",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error uploading evidence:", error);
      
      toast({
        title: "Error uploading evidence",
        description: error.message || "Failed to upload evidence. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    assignedCases,
    pendingReports,
    officerReports,
    isLoading,
    stats,
    handleUpdateStatus,
    handleUpdateProgress,
    handleAssignReport,
    handleEvidenceUploaded,
    handleUploadEvidence
  };
}
