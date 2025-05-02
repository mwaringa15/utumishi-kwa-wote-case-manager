
export type UserRole = 'Public' | 'Officer' | 'OCS' | 'Commander' | 'Administrator' | 'Judiciary';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type CaseStatus = 'Submitted' | 'Under Investigation' | 'Closed';
export type CaseProgress = 'Pending' | 'In Progress' | 'Completed';

export interface CrimeReport {
  id?: string;
  title: string;
  description: string;
  status: CaseStatus;
  createdById?: string;
  createdAt?: string;
  location?: string;
  category?: string;
}

export interface Case {
  id?: string;
  crimeReportId: string;
  assignedOfficerId?: string;
  progress: CaseProgress;
  evidence?: Record<string, any>;
  lastUpdated?: string;
  crimeReport?: CrimeReport;
}
