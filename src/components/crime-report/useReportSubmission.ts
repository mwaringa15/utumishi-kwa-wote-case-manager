
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CrimeReportFormValues } from "./types";

export function useReportSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (data: CrimeReportFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting form data:", data);
    
    try {
      // Create the report object
      const reportData = {
        title: data.title,
        description: data.description,
        location: data.location,
        incident_date: data.incidentDate,
        category: data.category,
        contact_phone: data.contactPhone || null,
        additional_info: data.additionalInfo || null,
        reporter_id: user?.id || null, // Allow null if user is not authenticated
        status: 'Submitted'
      };
      
      console.log("Sending report data to server:", reportData);
      
      // Insert the report - the case will be created automatically via our database trigger
      const { data: reportResponse, error: reportError } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();
      
      if (reportError) {
        console.error("Error submitting report:", reportError);
        throw new Error(reportError.message);
      }
      
      console.log("Created report:", reportResponse);
      
      // For officers, auto-create a case if one wasn't created by the database trigger
      let newCaseId;
      
      // Fetch the case ID that was automatically created by the database trigger
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('id')
        .eq('report_id', reportResponse.id)
        .single();
        
      if (caseError) {
        // If no case was created by the trigger, create one now for officers
        if (user?.role && ['Officer', 'OCS', 'Commander', 'Administrator', 'Supervisor'].includes(user.role)) {
          console.log("No case found, creating one for officer...");
          
          // Create a case manually
          const { data: newCase, error: newCaseError } = await supabase
            .from('cases')
            .insert({
              report_id: reportResponse.id,
              status: 'Under Investigation',
              assigned_officer_id: user.id, // Auto-assign to the submitting officer
              priority: 'medium'
            })
            .select()
            .single();
            
          if (newCaseError) {
            console.error("Error creating case:", newCaseError);
            throw new Error("Report submitted, but couldn't create a case. Please try again.");
          }
          
          newCaseId = newCase.id;
          console.log("Created new case:", newCaseId);
        } else {
          console.error("Error fetching case ID:", caseError);
          throw new Error("Report submitted, but couldn't retrieve case ID.");
        }
      } else {
        newCaseId = caseData.id;
      }
      
      console.log("Retrieved case ID:", newCaseId);
      setCaseId(newCaseId);

      // Format the case ID for display (first 8 characters in uppercase)
      const displayCaseId = newCaseId.substring(0, 8).toUpperCase();
      
      toast({
        title: "Report submitted successfully",
        description: `Your case ID is: ${displayCaseId}. Use this ID to track your case status.`,
      });
      
      // Redirect based on user role or email domain
      if (user?.email?.endsWith('@supervisor.go.ke') || ["Supervisor"].includes(user?.role || "")) {
        navigate("/supervisor-dashboard");
      } else if (user?.role && ['Officer', 'OCS', 'Commander', 'Administrator'].includes(user.role)) {
        // Make sure we're using the correct case ID from the newly created case
        console.log(`Redirecting officer to new case: ${newCaseId}`);
        navigate(`/case/${newCaseId}`);
      } else {
        // For public users, navigate to track case page with the new ID
        navigate(`/track-case?id=${newCaseId}`);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error in report submission process:", error);
      toast({
        title: "Error submitting report",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    caseId,
    handleSubmit
  };
}
