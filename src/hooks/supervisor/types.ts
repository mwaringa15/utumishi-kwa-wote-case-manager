
export type ToastType = (props: { 
  title: string; 
  description: string; 
  variant?: "default" | "destructive"; 
}) => void;

export interface SupervisorStats {
  totalCases: number;
  pendingReports: number;
  activeCases: number;
  completedCases: number;
  totalOfficers: number;
}

export interface StatsUpdater {
  (prev: SupervisorStats): SupervisorStats;
}
