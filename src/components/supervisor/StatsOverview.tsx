
import { StatCard } from "@/components/supervisor/StatCard";
import { ClipboardList, ClipboardCheck, ClipboardPen, FileWarning, Users2 } from "lucide-react";

interface StatsOverviewProps {
  stats: {
    totalCases: number;
    pendingReports: number;
    activeCases: number;
    completedCases: number;
    totalOfficers: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <StatCard 
        title="Total Cases" 
        value={stats.totalCases} 
        icon={<ClipboardList className="h-6 w-6" />}
        color="bg-blue-500"
      />
      <StatCard 
        title="Active Cases" 
        value={stats.activeCases} 
        icon={<ClipboardPen className="h-6 w-6" />}
        color="bg-amber-500"
      />
      <StatCard 
        title="Completed Cases" 
        value={stats.completedCases} 
        icon={<ClipboardCheck className="h-6 w-6" />}
        color="bg-green-500"
      />
      <StatCard 
        title="Pending Reports" 
        value={stats.pendingReports} 
        icon={<FileWarning className="h-6 w-6" />}
        color="bg-red-500"
      />
      <StatCard 
        title="Total Officers" 
        value={stats.totalOfficers} 
        icon={<Users2 className="h-6 w-6" />}
        color="bg-purple-500"
      />
    </div>
  );
}
