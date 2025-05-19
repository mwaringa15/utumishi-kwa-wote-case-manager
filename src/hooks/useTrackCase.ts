
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Case, CaseProgress, CaseStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { CaseSearchFormValues } from "@/components/case-tracking/CaseSearchForm";

export function useTrackCase() {
  const [isSearching, setIsSearching] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const lastSearchedId = useRef<string | null>(null);

  const handleSearch = useCallback(async (data: CaseSearchFormValues) => {
    // Don't search again if we're already searching the same ID
    if (isSearching && lastSearchedId.current === data.caseId) {
      return;
    }
    
    setIsSearching(true);
    setError(null);
    lastSearchedId.current = data.caseId;
    
    try {
      console.log("Searching for case with ID:", data.caseId);
      
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
      
      if (!caseResult.report) {
        setError("Case found but report data is missing.");
        setCaseData(null);
        setIsSearching(false);
        return;
      }
      
      const foundCase: Case = {
        id: caseResult.id,
        crimeReportId: caseResult.report_id,
        assignedOfficerId: caseResult.assigned_officer_id || undefined,
        progress: caseResult.status as CaseProgress,
        status: caseResult.status as CaseStatus,
        lastUpdated: caseResult.updated_at,
        crimeReport: {
          id: caseResult.report.id,
          title: caseResult.report.title,
          description: caseResult.report.description,
          status: caseResult.report.status as CaseStatus,
          createdAt: caseResult.report.created_at,
          location: caseResult.report.location,
          createdById: caseResult.report.reporter_id || "anonymous"
        }
      };
      
      setCaseData(foundCase);
      
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
  }, [isSearching, toast]);

  return {
    isSearching,
    caseData,
    error,
    handleSearch
  };
}
