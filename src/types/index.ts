
// src/types/index.ts

// User types
export type UserRole = "public" | "officer" | "judiciary" | "supervisor";
export type OfficerStatus = "on_duty" | "on_leave" | "off_duty";

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  // Additional fields for officers
  badgeNumber?: string;
  station?: string;
  assignedCases?: number;
  status?: OfficerStatus;
}

// Crime report types
export type CrimeStatus = "Submitted" | "Under Investigation" | "Closed" | "Rejected" | "Submitted to Judiciary" | "Under Court Process" | "Returned from Judiciary" | "Under Review";

export interface CrimeReport {
  id: string;
  title: string;
  description: string;
  status: CrimeStatus;
  createdById: string;
  createdAt: string;
  crimeType?: string;
  location?: string;
  category?: string; // Keeping this as it's used in the code
  victimName?: string;
  victimContact?: string;
  witnessDetails?: string;
  suspectDetails?: string;
  attachments?: string[];
}

// Case types
export type CaseProgress = "Pending" | "In Progress" | "Pending Review" | "Completed" | "Under Review";
// Update CaseStatus to match CrimeStatus to fix type compatibility issues
export type CaseStatus = CrimeStatus;

export interface Case {
  id: string;
  crimeReportId: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  progress: CaseProgress;
  lastUpdated: string;
  crimeReport?: CrimeReport;
  submittedToJudiciary?: boolean;
  judiciaryStatus?: JudiciaryStatus;
  judiciaryCaseNotes?: string;
  // Add these properties for the new functionality
  priority?: "high" | "medium" | "low";
  station?: string;
  status: CaseStatus; // Added this property
}

// Case update types
export type UpdateType = "Progress Update" | "Evidence Added" | "Status Change" | "Case Priority Change";
export type JudiciaryStatus = "Pending Review" | "Accepted" | "Returned";

export interface CaseUpdate {
  id: string;
  caseId: string;
  officerId: string;
  officerName: string;
  content: string;
  timestamp: string;
  type: UpdateType;
  attachmentName?: string;
}

// Officer Dashboard specific types
export interface OfficerStats {
  activeCases: number;
  pendingReports: number;
  closedCases: number;
  totalAssigned: number;
}
