
import { Case, CrimeReport, User } from "@/types";

/**
 * Generates mock officers data for development
 */
export const generateMockOfficers = (): User[] => {
  return [
    {
      id: "officer1",
      name: "Officer John Doe",
      email: "john@police.go.ke",
      role: "Officer",
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      badgeNumber: "KP12345",
      assignedCases: 3
    },
    {
      id: "officer2",
      name: "Officer Jane Smith",
      email: "jane@police.go.ke",
      role: "Officer",
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      badgeNumber: "KP67890",
      assignedCases: 5
    },
    {
      id: "officer3",
      name: "Officer James Kimani",
      email: "james@police.go.ke",
      role: "Officer",
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      badgeNumber: "KP24680",
      assignedCases: 2
    },
    {
      id: "officer4",
      name: "Officer Mary Wanjiku",
      email: "mary@police.go.ke",
      role: "Officer",
      createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
      badgeNumber: "KP13579",
      assignedCases: 4
    },
  ];
};

/**
 * Generates mock pending reports data for development
 */
export const generateMockReports = (): CrimeReport[] => {
  return [
    {
      id: "r111",
      title: "Shoplifting at Central Mall",
      description: "Observed a person taking items without paying at the electronics section around 3 PM.",
      status: "Submitted",
      createdById: "user111",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Central Mall, Nairobi",
      crimeType: "Theft"
    },
    {
      id: "r112",
      title: "Suspicious Activity near School",
      description: "Noticed unusual activity around the school compound during late hours.",
      status: "Submitted",
      createdById: "user112",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: "St. Mary's School, Kiambu Road",
      crimeType: "Suspicious Activity"
    },
    {
      id: "r113",
      title: "Vehicle Break-in",
      description: "Car window broken and laptop stolen from inside.",
      status: "Submitted",
      createdById: "user113",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Westlands Parking Lot, Nairobi",
      crimeType: "Theft"
    },
  ];
};

/**
 * Generates mock cases data for development
 */
export const generateMockCases = (): Case[] => {
  return [
    {
      id: "c201",
      crimeReportId: "r201",
      assignedOfficerId: "officer1",
      assignedOfficerName: "Officer John Doe",
      progress: "In Progress",
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      crimeReport: {
        id: "r201",
        title: "Vehicle Theft at Shopping Mall",
        description: "Car stolen from mall parking. Toyota Corolla, license KCZ 123A.",
        status: "Under Investigation",
        createdById: "user201",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Sarit Centre, Westlands",
        crimeType: "Vehicle Theft"
      },
    },
    {
      id: "c202",
      crimeReportId: "r202",
      assignedOfficerId: "officer2",
      assignedOfficerName: "Officer Jane Smith",
      progress: "Pending",
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      crimeReport: {
        id: "r202",
        title: "Business Burglary",
        description: "Break-in at local business. Cash register and electronics taken.",
        status: "Under Investigation",
        createdById: "user202",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Biashara Street, CBD",
        crimeType: "Burglary"
      },
    },
    {
      id: "c203",
      crimeReportId: "r203",
      assignedOfficerId: "officer1",
      assignedOfficerName: "Officer John Doe",
      progress: "Completed",
      lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      submittedToJudiciary: true,
      judiciaryStatus: "Accepted",
      crimeReport: {
        id: "r203",
        title: "Assault at Nightclub",
        description: "Physical altercation between patrons at nightclub.",
        status: "Closed",
        createdById: "user203",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Club Zeros, Westlands",
        crimeType: "Assault"
      },
    },
    {
      id: "c204",
      crimeReportId: "r204",
      assignedOfficerId: "officer3",
      assignedOfficerName: "Officer James Kimani",
      progress: "In Progress",
      lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      crimeReport: {
        id: "r204",
        title: "Identity Theft Report",
        description: "Victim reported unauthorized accounts opened in their name.",
        status: "Under Investigation",
        createdById: "user204",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        location: "N/A (Online Crime)",
        crimeType: "Fraud"
      },
    },
    {
      id: "c205",
      crimeReportId: "r205",
      assignedOfficerId: "officer2",
      assignedOfficerName: "Officer Jane Smith",
      progress: "Pending Review",
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      crimeReport: {
        id: "r205",
        title: "Drug Activity Report",
        description: "Suspected drug dealing in apartment complex.",
        status: "Under Investigation",
        createdById: "user205",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Parklands Estate, Nairobi",
        crimeType: "Narcotics"
      },
    },
  ];
};

/**
 * Generates statistics based on the provided data
 */
export const generateStats = (
  cases: Case[],
  reports: CrimeReport[],
  officers: User[]
) => {
  return {
    totalCases: cases.length,
    pendingReports: reports.length,
    activeCases: cases.filter(c => c.progress !== "Completed").length,
    completedCases: cases.filter(c => c.progress === "Completed").length,
    totalOfficers: officers.length
  };
};
