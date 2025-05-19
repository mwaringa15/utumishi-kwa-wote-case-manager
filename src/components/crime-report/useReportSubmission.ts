
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"; 
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
      if (!data.stationId) {
        throw new Error("Please select a police station");
      }

      // Create the report object
      const reportData = {
        title: data.title,
        description: data.description,
        location: data.location,
        incident_date: data.incidentDate,
        category: data.category,
        station_id: data.stationId, // Make sure the stationId is included
        contact_phone: data.contactPhone || null,
        additional_info: data.additionalInfo || null,
        reporter_id: user?.id || null, // Allow null if user is not authenticated
        status: 'Pending' // Set to 'Pending' so supervisors can review it
      };
      
      console.log("Sending report data to server with station_id:", reportData.station_id);
      
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
        if (user?.role && ['officer', 'ocs', 'commander', 'administrator'].includes(user.role.toLowerCase())) {
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
          console.log("Report submitted for supervisor review");
          // For non-officers, just show a success message without case ID
          toast({
            title: "Report submitted successfully",
            description: "Your report has been submitted for review. A supervisor will review it shortly.",
          });
          
          // Always redirect to track case page, even without a case ID
          navigate("/track-case");
          
          setIsSubmitting(false);
          return true;
        }
      } else {
        newCaseId = caseData.id;
      }
      
      if (newCaseId) {
        console.log("Retrieved case ID:", newCaseId);
        setCaseId(newCaseId);
  
        // Format the case ID for display (first 8 characters in uppercase)
        const displayCaseId = newCaseId.substring(0, 8).toUpperCase();
        
        toast({
          title: "Report submitted successfully",
          description: `Your case ID is: ${displayCaseId}. Use this ID to track your case status.`,
        });
        
        // Clear any potentially cached case information in session storage
        sessionStorage.removeItem('lastViewedCase');
  
        // Redirect based on user role
        if (user?.role?.toLowerCase() === "supervisor") {
          navigate("/supervisor-dashboard");
        } else if (user?.role && ['officer', 'ocs', 'commander', 'administrator'].includes(user.role.toLowerCase())) {
          // Make sure we're using the correct case ID from the newly created case
          console.log(`Redirecting officer to new case: ${newCaseId}`);
          // Use replace instead of push to avoid back button issues
          navigate(`/case/${newCaseId}`, { replace: true });
        } else {
          // For public users, navigate to track case page with the new ID
          navigate(`/track-case?id=${newCaseId}`, { replace: true });
        }
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
