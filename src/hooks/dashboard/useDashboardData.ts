
import { useState, useEffect } from "react";
import { Case, CrimeReport, CaseProgress, CaseStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useDashboardData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myReports, setMyReports] = useState<CrimeReport[]>([]);
  const [myCases, setMyCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        if (!user?.id) return;
        
        // Fetch crime reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .eq('reporter_id', user.id);
          
        if (reportsError) throw reportsError;
        
        // Fetch cases linked to those reports
        if (reportsData.length > 0) {
          const reportIds = reportsData.map(report => report.id);
          
          const { data: casesData, error: casesError } = await supabase
            .from('cases')
            .select(`
              *,
              report:report_id (*)
            `)
            .in('report_id', reportIds);
            
          if (casesError) throw casesError;
          
          // Convert to our app types with proper type casting
          const typedCases: Case[] = casesData.map(caseItem => ({
            id: caseItem.id,
            crimeReportId: caseItem.report_id,
            assignedOfficerId: caseItem.assigned_officer_id,
            progress: caseItem.status as CaseProgress, // This status is actually CaseProgress
            status: caseItem.status as CaseStatus,     // This is the actual CaseStatus
            lastUpdated: caseItem.updated_at,
            crimeReport: caseItem.report ? {
              id: caseItem.report.id,
              title: caseItem.report.title,
              description: caseItem.report.description,
              status: caseItem.report.status as CaseStatus,
              createdAt: caseItem.report.created_at,
              location: caseItem.report.location,
              createdById: user.id // Use the current user's ID as the creator
            } : undefined
          }));
          
          setMyCases(typedCases);
        }
        
        // Convert reports to our app types with proper type casting
        const typedReports: CrimeReport[] = reportsData.map(report => ({
          id: report.id,
          title: report.title,
          description: report.description,
          status: report.status as CaseStatus,
          createdById: report.reporter_id || user.id,
          createdAt: report.created_at,
          location: report.location
        }));
        
        setMyReports(typedReports);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        toast({
          title: "Error loading data",
          description: "Failed to load your reports and cases",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user, toast]);

  return { myReports, myCases, isLoading };
}
