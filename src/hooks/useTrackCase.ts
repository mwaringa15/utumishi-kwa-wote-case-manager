
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Case, CaseProgress, CaseStatus, CrimeReport } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { CaseSearchFormValues } from "@/components/case-tracking/CaseSearchForm";

export function useTrackCase() {
  const [isSearching, setIsSearching] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const lastSearchedId = useRef<string | null>(null);

  const handleSearch = async (data: CaseSearchFormValues) => {
    // If we're already searching for this ID, prevent duplicate requests
    if (isSearching && lastSearchedId.current === data.caseId) {
      return;
    }
    
    setIsSearching(true);
    setError(null);
    lastSearchedId.current = data.caseId;
    
    try {
      console.log("Searching for case with ID:", data.caseId);
      
      // Fetch case data from Supabase
      const { data: caseResult, error: caseError } = await supabase
        .from('cases')
        .select(`
          *,
          report:report_id (*)
        `)
        .eq('id', data.caseId)
        .single();
      
      if (caseError) {
        console.error("Case search error:", caseError);
        setError("Case not found. We couldn't find a case with that ID. Please check and try again.");
        setCaseData(null);
        setIsSearching(false);
        return;
      }
      
      if (!caseResult) {
        setError("No case found with that ID.");
        setCaseData(null);
        setIsSearching(false);
        return;
      }
      
      console.log("Case found:", caseResult);
      
      // Handle the case where report might be null or undefined
      if (!caseResult.report) {
        setError("Case found but report data is missing.");
        setCaseData(null);
        setIsSearching(false);
        return;
      }
      
      // Convert the Supabase result to our Case type
      const foundCase: Case = {
        id: caseResult.id,
        crimeReportId: caseResult.report_id,
        assignedOfficerId: caseResult.assigned_officer_id || undefined,
        progress: caseResult.status as CaseProgress,
        lastUpdated: caseResult.updated_at,
        crimeReport: {
          id: caseResult.report.id,
          title: caseResult.report.title,
          description: caseResult.report.description,
          status: caseResult.report.status as CaseStatus,
          createdAt: caseResult.report.created_at,
          location: caseResult.report.location,
          // Only include category if it exists in the report
          ...(caseResult.report.category && { category: caseResult.report.category }),
          createdById: caseResult.report.reporter_id || "anonymous" // Providing a default value as it's required by the type
        }
      };
      
      setCaseData(foundCase);
      
      // Show toast on successful case retrieval
      toast({
        title: "Case found",
        description: `Viewing case ${caseResult.id.substring(0, 8).toUpperCase()}`,
      });
      
    } catch (error) {
      console.error("Error searching for case", error);
      setError("There was a problem searching for your case");
      setCaseData(null);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    isSearching,
    caseData,
    error,
    handleSearch
  };
}
