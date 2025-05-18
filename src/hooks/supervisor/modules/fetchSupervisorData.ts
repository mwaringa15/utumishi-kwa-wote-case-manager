
import { User, Case, CrimeReport } from "@/types";
import { ToastType } from "../types";
import { getUserStationId } from "./getUserStationId";
import { fetchCases, formatCases } from "./fetchCases";
import { fetchPendingReports } from "./fetchPendingReports";
import { fetchOfficersWithCounts } from "./fetchOfficersWithCounts";

/**
 * Main function to fetch all supervisor dashboard data
 */
export async function fetchSupervisorData(
  user: User | null,
  showToast: ToastType
): Promise<{
  cases: Case[];
  pendingReports: CrimeReport[];
  officers: User[];
  stationId?: string;
} | null> {
  if (!user) {
    return null;
  }

  try {
    // Get the station ID for the current user
    const stationInfo = await getUserStationId(user.id);
    const stationId = stationInfo.stationId;

    if (!stationId && user.role !== "supervisor") {
      showToast({ 
        title: "No Station ID", 
        description: "Supervisor's station ID could not be determined.", 
        variant: "destructive" 
      });
      return null;
    }

    // Fetch cases and related data
    const { casesData, reportsById, officerNamesById } = await fetchCases(stationId);
    const formattedCases = formatCases(casesData, reportsById, officerNamesById);
    
    // Fetch pending reports that don't have cases yet
    const formattedReports = await fetchPendingReports(stationId);
    
    // Fetch officers with their case counts
    const officersWithCaseCounts = await fetchOfficersWithCounts(stationId);

    return {
      cases: formattedCases,
      pendingReports: formattedReports,
      officers: officersWithCaseCounts,
      stationId: stationId || undefined,
    };

  } catch (error: any) {
    console.error("Failed to load supervisor data:", error);
    showToast({
      title: "Error Loading Data",
      description: error.message || "Could not load supervisor dashboard data.",
      variant: "destructive",
    });
    return null;
  }
}
