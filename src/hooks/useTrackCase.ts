
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Case, CaseProgress, CaseStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { CaseSearchFormValues } from "@/components/case-tracking/CaseSearchForm";

export function useTrackCase() {
  const [isSearching, setIsSearching] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (data: CaseSearchFormValues) => {
    setIsSearching(true);
    setError(null);
    
    try {
      console.log("Searching for case with ID:", data.caseId);
      
      // Fetch case data from Supabase
      const { data: caseResult, error: caseError } = await supabase
        .from('cases')
        .select(`
          *,
          crime_report:crime_report_id (
            id,
            title,
            description,
            status,
            created_at,
            location,
            category
          )
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
      
      // Convert the Supabase result to our Case type
      const foundCase: Case = {
        id: caseResult.id,
        crimeReportId: caseResult.crime_report_id,
        assignedOfficerId: caseResult.assigned_officer_id || undefined,
        progress: caseResult.progress as CaseProgress,
        lastUpdated: caseResult.last_updated,
        crimeReport: caseResult.crime_report ? {
          id: caseResult.crime_report.id,
          title: caseResult.crime_report.title,
          description: caseResult.crime_report.description,
          status: caseResult.crime_report.status as CaseStatus,
          createdAt: caseResult.crime_report.created_at,
          location: caseResult.crime_report.location,
          category: caseResult.crime_report.category
        } : undefined
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
