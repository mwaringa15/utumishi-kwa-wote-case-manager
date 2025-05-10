
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
      
      // Fetch the case ID that was automatically created by the database trigger
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('id')
        .eq('report_id', reportResponse.id)
        .single();
      
      if (caseError) {
        console.error("Error fetching case ID:", caseError);
        throw new Error("Report submitted, but couldn't retrieve case ID.");
      }
      
      console.log("Retrieved case data:", caseData);
      const generatedCaseId = caseData.id;
      setCaseId(generatedCaseId);

      // Format the case ID for display (first 8 characters in uppercase)
      const displayCaseId = generatedCaseId.substring(0, 8).toUpperCase();
      
      toast({
        title: "Report submitted successfully",
        description: `Your case ID is: ${displayCaseId}. Use this ID to track your case status.`,
      });
      
      // Redirect based on user role or email domain
      if (user?.email?.endsWith('@supervisor.go.ke')) {
        navigate("/supervisor-dashboard");
      } else if (user?.role && ['Officer', 'OCS', 'Commander', 'Administrator'].includes(user.role)) {
        // For officers, navigate to case details page with the new case ID
        // This ensures they can track the case they just created
        navigate(`/case/${generatedCaseId}`);
      } else {
        // For public users, navigate to track case page with the ID
        navigate(`/track-case?id=${generatedCaseId}`);
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
