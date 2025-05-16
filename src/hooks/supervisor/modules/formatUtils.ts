
import { CrimeReport, User } from "@/types";

/**
 * Utility functions for formatting data
 */
export const formatUtils = {
  /**
   * Format raw report data into CrimeReport objects
   */
  formatReports: (reportsData: any[]): CrimeReport[] => {
    return reportsData.map(report => ({
      id: report.id,
      title: report.title,
      description: report.description,
      status: report.status,
      createdAt: report.created_at,
      crimeType: report.category,
      location: report.location,
      createdById: report.reporter_id,
      category: report.category
    }));
  },
  
  /**
   * Format raw officer data into User objects
   */
  formatOfficers: (officersData: any[]): User[] => {
    return officersData.map(officer => ({
      id: officer.id,
      name: officer.full_name || officer.email.split('@')[0],
      email: officer.email,
      role: "Officer",
      badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`,
      assignedCases: 0 // Placeholder
    }));
  }
};
