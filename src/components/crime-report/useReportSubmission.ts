
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
      
      // First, create the crime report
      const { data: crimeReport, error: crimeReportError } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();
      
      if (crimeReportError) {
        console.error("Error creating crime report:", crimeReportError);
        throw new Error(crimeReportError.message);
      }
      
      console.log("Created crime report:", crimeReport);

      // Then, create a case linked to this crime report
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          report_id: crimeReport.id,
          status: 'Submitted',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (caseError) {
        console.error("Error creating case:", caseError);
        throw new Error(caseError.message);
      }
      
      console.log("Created case:", caseData);
      
      // Format case ID for display
      const formattedCaseId = caseData.id.substring(0, 8).toUpperCase();
      
      toast({
        title: "Crime report submitted successfully!",
        description: `Your report has been filed with reference ID: ${formattedCaseId}`,
      });
      
      // Redirect to the tracking page with the case ID
      navigate(`/track-case?id=${caseData.id}`);
      
      return true;
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error submitting report",
        description: "Please try again later",
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
