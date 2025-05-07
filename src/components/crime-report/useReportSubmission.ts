
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CrimeReportFormValues } from "./types";

export function useReportSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (data: CrimeReportFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting form data:", data);
    
    try {
      // Create the report object and set reporter_id only if a user is logged in
      const reportData = {
        title: data.title,
        description: data.description,
        location: data.location,
        incident_date: data.incidentDate,
        category: data.category,
        contact_phone: data.contactPhone || null,
        additional_info: data.additionalInfo || null,
        status: 'Submitted'
      };
      
      // Only add reporter_id if user is logged in
      if (user && user.id) {
        Object.assign(reportData, { reporter_id: user.id });
      }
      
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
      
      console.log("Created crime report:", reportResponse);

      // Now fetch the automatically created case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select()
        .eq('report_id', reportResponse.id)
        .single();
      
      if (caseError) {
        console.error("Error retrieving case:", caseError);
        // Even if we can't retrieve the case, the report was submitted successfully
        toast({
          title: "Report submitted successfully!",
          description: "Your report has been filed, but we couldn't retrieve your case ID.",
        });
        navigate('/track-case');
        return true;
      }
      
      console.log("Retrieved case:", caseData);
      
      // Format case ID for display
      const formattedCaseId = caseData.id.substring(0, 8).toUpperCase();
      
      toast({
        title: "Report submitted successfully!",
        description: `Your report has been filed with reference ID: ${formattedCaseId}`,
      });
      
      // Redirect to the tracking page with the case ID
      navigate(`/track-case?id=${caseData.id}`);
      
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
    handleSubmit
  };
}
