
// src/types/index.ts - Extending as needed

// User types
export type UserRole = "Public" | "Officer" | "OCS" | "Commander" | "Administrator" | "Judiciary";

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
}

// Crime report types
export type CrimeStatus = "Submitted" | "Under Investigation" | "Closed" | "Rejected" | "Submitted to Judiciary" | "Under Court Process" | "Returned from Judiciary";

export interface CrimeReport {
  id: string;
  title: string;
  description: string;
  status: string;
  createdById: string;
  createdAt: string;
  crimeType?: string;
  location?: string;
  victimName?: string;
  victimContact?: string;
  witnessDetails?: string;
  suspectDetails?: string;
  attachments?: string[];
}

// Case types
export type CaseProgress = "Pending" | "In Progress" | "Pending Review" | "Completed";
export type CaseStatus = "Under Investigation" | "Closed" | "Submitted to Judiciary" | "Returned from Judiciary" | "Under Court Process";
export type JudiciaryStatus = "Pending Review" | "Accepted" | "Returned";

export interface Case {
  id: string;
  crimeReportId: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  progress: string;
  lastUpdated: string;
  crimeReport?: CrimeReport;
  submittedToJudiciary?: boolean;
  judiciaryStatus?: JudiciaryStatus;
  judiciaryCaseNotes?: string;
}

// Case update types
export type UpdateType = "Progress Update" | "Evidence Added" | "Status Change" | "Case Priority Change";

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
