
import { StatCard } from "@/components/supervisor/StatCard";

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
      <StatCard title="Total Cases" value={stats.totalCases} />
      <StatCard title="Active Cases" value={stats.activeCases} />
      <StatCard title="Completed Cases" value={stats.completedCases} />
      <StatCard title="Pending Reports" value={stats.pendingReports} />
      <StatCard title="Total Officers" value={stats.totalOfficers} />
    </div>
  );
}
