
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from "recharts";

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
  const chartData = useMemo(() => {
    if (isLoading || !data.length) {
      // Return dummy data if loading or no data
      return [
        { region: "Central", solved: 0, pending: 0, total: 0 },
        { region: "Eastern", solved: 0, pending: 0, total: 0 },
        { region: "Western", solved: 0, pending: 0, total: 0 }
      ];
    }
    return data;
  }, [data, isLoading]);

  const chartConfig = {
    solved: { label: "Solved Cases", color: "#22c55e" },
    pending: { label: "Pending Cases", color: "#f59e0b" },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Regional Case Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground animate-pulse">Loading statistics...</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-[4/3]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="region" 
                  tick={{ fontSize: 12 }} 
                  axisLine={{ strokeWidth: 1 }}
                />
                <YAxis 
                  axisLine={{ strokeWidth: 1 }}
                  tick={{ fontSize: 12 }}
                  width={30}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="solved" name="Solved Cases" fill="#22c55e" />
                <Bar dataKey="pending" name="Pending Cases" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
