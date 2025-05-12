
import { RegionalStats } from "@/components/supervisor/RegionalStats";
import { OfficerPerformance } from "@/components/supervisor/OfficerPerformance";
import { User } from "@/types";

interface RegionalStatsData {
  region: string;
  solved: number;
  pending: number;
  total: number;
}

interface StationAnalyticsProps {
  regionalData: RegionalStatsData[];
  officers: User[];
  isLoading: boolean;
}

export const StationAnalytics = ({ regionalData, officers, isLoading }: StationAnalyticsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <RegionalStats data={regionalData} isLoading={isLoading} />
      <OfficerPerformance officers={officers} isLoading={isLoading} />
    </div>
  );
};
