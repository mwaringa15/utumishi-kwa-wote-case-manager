
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

      toast({
        title: "Report submitted successfully.",
        description: "Your case is being reviewed.",
      });
      
      // Redirect based on user role
      if (user?.role && ['Officer', 'OCS', 'Commander', 'Administrator'].includes(user.role)) {
        navigate("/officer-dashboard");
      } else {
        navigate("/dashboard");
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
    handleSubmit
  };
}
