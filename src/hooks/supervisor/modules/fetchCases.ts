
import { Case, CaseStatus, CrimeStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches cases for a specific station
 */
export async function fetchCases(stationId: string | null): Promise<{
  casesData: any[];
  reportsById: Record<string, any>;
  officerNamesById: Record<string, string>;
}> {
  try {
    // Modified query to avoid the relationship error by directly selecting all fields
    let casesQuery = supabase.from('cases').select('*');
    
    // Apply station filter if needed
    if (stationId) {
      casesQuery = casesQuery.eq('station', stationId);
    }
    
    const { data: casesData, error: casesError } = await casesQuery;
      
    if (casesError) throw casesError;
    
    // Now fetch related data separately
    const reportIds = casesData.map(c => c.report_id).filter(Boolean);
    const officerIds = casesData.map(c => c.assigned_officer_id).filter(Boolean);
    
    // Get reports data
    const reportsQuery = reportIds.length > 0
      ? supabase.from('reports').select('*').in('id', reportIds)
      : supabase.from('reports').select('*').limit(1); // Fallback query with limit 1
    
    const { data: reportsData, error: reportsDataError } = await reportsQuery;
    
    if (reportsDataError) throw reportsDataError;
    
    // Map reports by ID for easy lookup
    const reportsById: Record<string, any> = {};
    reportsData.forEach(report => {
      if (report.id) {
        reportsById[report.id] = report;
      }
    });
    
    // Get officers data - using the RLS policy we just created
    const caseOfficersQuery = officerIds.length > 0
      ? supabase.from('users').select('id, full_name, email, role, status, station_id').in('id', officerIds)
      : supabase.from('users').select('id, full_name, email, role, status, station_id').limit(1); // Fallback query
    
    const { data: officersDataById, error: officersDataError } = await caseOfficersQuery;
    
    if (officersDataError) throw officersDataError;
    
    // Map officers by ID for easy lookup
    const officerNamesById: Record<string, string> = {};
    officersDataById.forEach(officer => {
      if (officer.id) {
        officerNamesById[officer.id] = officer.full_name;
      }
    });

    return { casesData, reportsById, officerNamesById };
  } catch (error) {
    console.error("Error fetching cases:", error);
    throw error;
  }
}

/**
 * Formats fetched case data into Case objects
 */
export function formatCases(
  casesData: any[], 
  reportsById: Record<string, any>,
  officerNamesById: Record<string, string>
): Case[] {
  return (casesData || []).map((c: any) => ({
    id: c.id,
    crimeReportId: c.report_id,
    assignedOfficerId: c.assigned_officer_id,
    assignedOfficerName: c.assigned_officer_id ? officerNamesById[c.assigned_officer_id] || "Unknown" : "Unassigned",
    progress: c.status, 
    status: c.status as CaseStatus, 
    lastUpdated: c.updated_at,
    priority: c.priority,
    station: c.station,
    crimeReport: reportsById[c.report_id] ? {
      id: reportsById[c.report_id].id,
      title: reportsById[c.report_id].title,
      description: reportsById[c.report_id].description,
      status: reportsById[c.report_id].status as CrimeStatus,
      createdById: reportsById[c.report_id].reporter_id,
      createdAt: reportsById[c.report_id].created_at,
      location: reportsById[c.report_id].location,
      crimeType: reportsById[c.report_id].category,
    } : undefined,
  }));
}
