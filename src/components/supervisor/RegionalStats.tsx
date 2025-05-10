
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegionalStatsChart } from "@/components/charts/RegionalStatsChart";

interface RegionData {
  region: string;
  solved: number;
  pending: number;
  total: number;
}

interface RegionalStatsProps {
  data?: RegionData[];
  isLoading: boolean;
}

export function RegionalStats({ data = [], isLoading }: RegionalStatsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Regional Case Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <RegionalStatsChart data={data} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
