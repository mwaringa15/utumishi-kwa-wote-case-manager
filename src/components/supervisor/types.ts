
import { Case, User } from "@/types";

export interface StationCase {
  id: string;
  report_id: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  station: string;
  reports: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    location?: string;
    category?: string;
  };
}

export interface StationOfficer {
  id: string;
  name: string;
  email: string;
  role: string;
  station: string;
  status: string;
  badgeNumber?: string;
  assignedCases: number;
}

export interface StationData {
  station: string;
  stationId: string;
  unassignedCases: StationCase[];
  officers: StationOfficer[];
  pendingReports: any[];
}

export interface SupervisorDashboardProps {
  user: User | null;
  stationData: StationData | null;
  loading: boolean;
}

export type ToastType = {
  (props: { title: string; description: string; variant?: "default" | "destructive" }): void;
};
